import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { CarRentalV1 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Retourne un timestamp UTC aligne a minuit, N jours dans le futur.
 */
function futureDayTimestamp(daysFromNow: number): bigint {
  const now = Math.floor(Date.now() / 1000);
  const todayMidnight = now - (now % 86400);
  return BigInt(todayMidnight + daysFromNow * 86400);
}

describe("CarRentalV1", function () {
  let contract: CarRentalV1;
  let owner: HardhatEthersSigner;
  let carLister: HardhatEthersSigner;
  let renter: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  const DAILY_PRICE = ethers.parseEther("0.01"); // 0.01 ETH/jour

  beforeEach(async function () {
    [owner, carLister, renter, other] = await ethers.getSigners();
    const CarRentalV1 = await ethers.getContractFactory("CarRentalV1");
    contract = (await upgrades.deployProxy(CarRentalV1, [owner.address], {
      kind: "uups",
    })) as unknown as CarRentalV1;
    await contract.waitForDeployment();
  });

  // ── TEST 1 : Deploiement ──
  it("devrait deployer avec une adresse proxy non nulle et le bon owner", async function () {
    const address = await contract.getAddress();
    expect(address).to.not.equal(ethers.ZeroAddress);
    expect(address).to.be.properAddress;
    expect(await contract.owner()).to.equal(owner.address);
    expect(await contract.getCarCount()).to.equal(0);
  });

  // ── TEST 2 : Lister une voiture ──
  it("devrait lister une voiture avec les parametres corrects", async function () {
    const tx = await contract
      .connect(carLister)
      .listCar("Toyota", "Camry", 2023, DAILY_PRICE, "ipfs://Qm...");

    await expect(tx)
      .to.emit(contract, "CarListed")
      .withArgs(1, carLister.address, "Toyota", "Camry", DAILY_PRICE);

    const car = await contract.getCar(1);
    expect(car.brand).to.equal("Toyota");
    expect(car.model).to.equal("Camry");
    expect(car.year).to.equal(2023);
    expect(car.dailyPrice).to.equal(DAILY_PRICE);
    expect(car.owner).to.equal(carLister.address);
    expect(car.isActive).to.be.true;
    expect(await contract.getCarCount()).to.equal(1);
  });

  // ── TEST 3 : Location (locataire + duree + prix total corrects) ──
  it("devrait louer une voiture avec le bon locataire, duree et prix", async function () {
    await contract
      .connect(carLister)
      .listCar("Toyota", "Camry", 2023, DAILY_PRICE, "");

    const start = futureDayTimestamp(2);
    const end = futureDayTimestamp(5); // 3 jours
    const expectedPrice = DAILY_PRICE * 3n;

    const tx = await contract
      .connect(renter)
      .rentCar(1, start, end, { value: expectedPrice });

    await expect(tx)
      .to.emit(contract, "CarRented")
      .withArgs(1, 1, renter.address, start, end, expectedPrice);

    const reservation = await contract.getReservation(1);
    expect(reservation.renter).to.equal(renter.address);
    expect(reservation.startDate).to.equal(start);
    expect(reservation.endDate).to.equal(end);
    expect(reservation.totalPrice).to.equal(expectedPrice);
    expect(reservation.isActive).to.be.true;
  });

  // ── TEST 4 : Disponibilite mise a jour apres location ──
  it("devrait mettre a jour la disponibilite apres location", async function () {
    await contract
      .connect(carLister)
      .listCar("BMW", "X5", 2024, DAILY_PRICE, "");

    const start = futureDayTimestamp(5);
    const end = futureDayTimestamp(10);

    await contract
      .connect(renter)
      .rentCar(1, start, end, { value: DAILY_PRICE * 5n });

    // Periode chevauchante → non disponible
    expect(
      await contract.isCarAvailable(1, futureDayTimestamp(7), futureDayTimestamp(12))
    ).to.be.false;

    // Periode non chevauchante → disponible
    expect(
      await contract.isCarAvailable(1, futureDayTimestamp(11), futureDayTimestamp(15))
    ).to.be.true;
  });

  // ── TEST 5 : Restitution restaure la disponibilite ──
  it("devrait restaurer la disponibilite apres restitution", async function () {
    await contract
      .connect(carLister)
      .listCar("Audi", "A4", 2022, DAILY_PRICE, "");

    const start = futureDayTimestamp(3);
    const end = futureDayTimestamp(6);

    await contract
      .connect(renter)
      .rentCar(1, start, end, { value: DAILY_PRICE * 3n });

    expect(await contract.isCarAvailable(1, start, end)).to.be.false;

    await expect(contract.connect(renter).returnCar(1))
      .to.emit(contract, "CarReturned")
      .withArgs(1, 1, renter.address);

    expect(await contract.isCarAvailable(1, start, end)).to.be.true;

    const res = await contract.getReservation(1);
    expect(res.isActive).to.be.false;
  });

  // ── TEST 6 : Calcul de duree/prix exact ──
  it("devrait calculer le prix exactement", async function () {
    await contract
      .connect(carLister)
      .listCar("Honda", "Civic", 2023, DAILY_PRICE, "");

    // 1 jour
    expect(
      await contract.calculateRentalPrice(
        1,
        futureDayTimestamp(1),
        futureDayTimestamp(2)
      )
    ).to.equal(DAILY_PRICE);

    // 7 jours
    expect(
      await contract.calculateRentalPrice(
        1,
        futureDayTimestamp(1),
        futureDayTimestamp(8)
      )
    ).to.equal(DAILY_PRICE * 7n);

    // 30 jours
    expect(
      await contract.calculateRentalPrice(
        1,
        futureDayTimestamp(1),
        futureDayTimestamp(31)
      )
    ).to.equal(DAILY_PRICE * 30n);
  });

  // ── TEST 7 : Conflit de reservation ──
  it("devrait empecher les reservations chevauchantes", async function () {
    await contract
      .connect(carLister)
      .listCar("Tesla", "Model 3", 2024, DAILY_PRICE, "");

    const start1 = futureDayTimestamp(10);
    const end1 = futureDayTimestamp(15);
    await contract
      .connect(renter)
      .rentCar(1, start1, end1, { value: DAILY_PRICE * 5n });

    // Chevauchement 1 : commence pendant la reservation existante
    await expect(
      contract
        .connect(other)
        .rentCar(1, futureDayTimestamp(12), futureDayTimestamp(18), {
          value: DAILY_PRICE * 6n,
        })
    ).to.be.revertedWithCustomError(contract, "ReservationOverlap");

    // Chevauchement 2 : finit pendant la reservation existante
    await expect(
      contract
        .connect(other)
        .rentCar(1, futureDayTimestamp(8), futureDayTimestamp(11), {
          value: DAILY_PRICE * 3n,
        })
    ).to.be.revertedWithCustomError(contract, "ReservationOverlap");

    // Chevauchement 3 : entierement contenu
    await expect(
      contract
        .connect(other)
        .rentCar(1, futureDayTimestamp(11), futureDayTimestamp(14), {
          value: DAILY_PRICE * 3n,
        })
    ).to.be.revertedWithCustomError(contract, "ReservationOverlap");

    // Reservation adjacente : commence quand la premiere finit → OK
    await expect(
      contract
        .connect(other)
        .rentCar(1, futureDayTimestamp(15), futureDayTimestamp(20), {
          value: DAILY_PRICE * 5n,
        })
    ).to.not.be.reverted;
  });

  // ── TEST 8 : Paiement insuffisant ──
  it("devrait rejeter un paiement insuffisant", async function () {
    await contract
      .connect(carLister)
      .listCar("Ford", "Focus", 2021, DAILY_PRICE, "");

    const start = futureDayTimestamp(2);
    const end = futureDayTimestamp(5); // 3 jours = 0.03 ETH

    await expect(
      contract.connect(renter).rentCar(1, start, end, {
        value: ethers.parseEther("0.02"), // seulement 0.02
      })
    ).to.be.revertedWithCustomError(contract, "InsufficientPayment");
  });

  // ── TEST 9 : Impossible de louer sa propre voiture ──
  it("devrait empecher de louer sa propre voiture", async function () {
    await contract
      .connect(carLister)
      .listCar("Mazda", "3", 2023, DAILY_PRICE, "");

    await expect(
      contract
        .connect(carLister)
        .rentCar(1, futureDayTimestamp(2), futureDayTimestamp(5), {
          value: DAILY_PRICE * 3n,
        })
    ).to.be.revertedWithCustomError(contract, "CannotRentOwnCar");
  });

  // ── TEST 10 : Retrait des gains ──
  it("devrait permettre au proprietaire de retirer ses gains", async function () {
    await contract
      .connect(carLister)
      .listCar("Kia", "Sportage", 2024, DAILY_PRICE, "");

    const rentalPrice = DAILY_PRICE * 3n;
    await contract
      .connect(renter)
      .rentCar(1, futureDayTimestamp(2), futureDayTimestamp(5), {
        value: rentalPrice,
      });

    expect(await contract.getOwnerEarnings(carLister.address)).to.equal(
      rentalPrice
    );

    await expect(
      contract.connect(carLister).withdrawEarnings()
    ).to.changeEtherBalance(carLister, rentalPrice);

    expect(await contract.getOwnerEarnings(carLister.address)).to.equal(0);
  });

  // ── TEST 11 : updateCar modifie prix et statut ──
  it("devrait modifier le prix et desactiver une voiture via updateCar", async function () {
    await contract
      .connect(carLister)
      .listCar("Nissan", "Leaf", 2023, DAILY_PRICE, "");

    const newPrice = ethers.parseEther("0.05");

    const tx = await contract
      .connect(carLister)
      .updateCar(1, newPrice, false);

    await expect(tx)
      .to.emit(contract, "CarUpdated")
      .withArgs(1, newPrice, false);

    const car = await contract.getCar(1);
    expect(car.dailyPrice).to.equal(newPrice);
    expect(car.isActive).to.be.false;
  });

  // ── TEST 12 : updateCar revert si non-proprietaire ──
  it("devrait rejeter updateCar par un non-proprietaire", async function () {
    await contract
      .connect(carLister)
      .listCar("Nissan", "Leaf", 2023, DAILY_PRICE, "");

    await expect(
      contract.connect(other).updateCar(1, DAILY_PRICE, false)
    ).to.be.revertedWithCustomError(contract, "NotCarOwner");
  });

  // ── TEST 13 : listCar revert avec prix 0 ──
  it("devrait rejeter listCar avec un prix de 0", async function () {
    await expect(
      contract.connect(carLister).listCar("Test", "Car", 2024, 0, "")
    ).to.be.revertedWith("Price must be > 0");
  });

  // ── TEST 14 : listCar revert avec marque vide ──
  it("devrait rejeter listCar avec une marque vide", async function () {
    await expect(
      contract.connect(carLister).listCar("", "Car", 2024, DAILY_PRICE, "")
    ).to.be.revertedWith("Brand required");
  });

  // ── TEST 15 : annulation de reservation avant debut ──
  it("devrait annuler une reservation et rembourser le locataire", async function () {
    await contract
      .connect(carLister)
      .listCar("Volvo", "XC40", 2024, DAILY_PRICE, "");

    const rentalPrice = DAILY_PRICE * 3n;
    await contract
      .connect(renter)
      .rentCar(1, futureDayTimestamp(10), futureDayTimestamp(13), {
        value: rentalPrice,
      });

    await expect(
      contract.connect(renter).cancelReservation(1)
    ).to.changeEtherBalance(renter, rentalPrice);

    const res = await contract.getReservation(1);
    expect(res.isActive).to.be.false;

    expect(await contract.getOwnerEarnings(carLister.address)).to.equal(0);
  });
});
