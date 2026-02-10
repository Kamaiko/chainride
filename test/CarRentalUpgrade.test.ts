import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { CarRentalV1, CarRentalV2 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

function futureDayTimestamp(daysFromNow: number): bigint {
  const now = Math.floor(Date.now() / 1000);
  const todayMidnight = now - (now % 86400);
  return BigInt(todayMidnight + daysFromNow * 86400);
}

describe("CarRental Upgrade V1 → V2", function () {
  it("devrait preserver l'etat apres upgrade et activer les fonctionnalites V2", async function () {
    const [owner, carLister, renter] = await ethers.getSigners();

    // ─── STEP A : Deployer V1 via proxy ───
    const V1Factory = await ethers.getContractFactory("CarRentalV1");
    const proxy = await upgrades.deployProxy(V1Factory, [owner.address], {
      kind: "uups",
    });
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();
    const v1 = proxy as unknown as CarRentalV1;

    // ─── STEP B : Modifier l'etat en V1 ───
    await v1
      .connect(carLister)
      .listCar("Toyota", "Supra", 2024, ethers.parseEther("0.05"), "");

    const start = futureDayTimestamp(5);
    const end = futureDayTimestamp(8); // 3 jours
    await v1.connect(renter).rentCar(1, start, end, {
      value: ethers.parseEther("0.15"),
    });

    // Verifier l'etat V1
    expect(await v1.getCarCount()).to.equal(1);
    expect(await v1.getReservationCount()).to.equal(1);

    // ─── STEP C : Upgrader vers V2 ───
    const V2Factory = await ethers.getContractFactory("CarRentalV2");
    const upgraded = await upgrades.upgradeProxy(proxyAddress, V2Factory, {
      call: {
        fn: "initializeV2",
        args: [
          ethers.parseEther("0.005"), // 0.005 ETH penalite par jour de retard
          5, // 5% frais de plateforme
        ],
      },
    });
    const v2 = upgraded as unknown as CarRentalV2;

    // L'adresse proxy n'a pas change
    expect(await v2.getAddress()).to.equal(proxyAddress);

    // ─── STEP D : Verifier que l'etat V1 est preserve ───
    const car = await v2.getCar(1);
    expect(car.brand).to.equal("Toyota");
    expect(car.model).to.equal("Supra");
    expect(car.year).to.equal(2024);
    expect(car.dailyPrice).to.equal(ethers.parseEther("0.05"));
    expect(car.owner).to.equal(carLister.address);
    expect(car.isActive).to.be.true;

    const reservation = await v2.getReservation(1);
    expect(reservation.renter).to.equal(renter.address);
    expect(reservation.totalPrice).to.equal(ethers.parseEther("0.15"));
    expect(reservation.isActive).to.be.true;

    expect(await v2.getCarCount()).to.equal(1);
    expect(await v2.getReservationCount()).to.equal(1);

    // ─── STEP E : Tester les nouvelles fonctionnalites V2 ───

    // getVersion() retourne "2.0.0"
    expect(await v2.getVersion()).to.equal("2.0.0");

    // Parametres V2 initialises correctement
    expect(await v2.latePenaltyPerDay()).to.equal(
      ethers.parseEther("0.005")
    );
    expect(await v2.platformFeePercent()).to.equal(5);

    // Definir un depot de garantie sur la voiture existante
    await v2
      .connect(carLister)
      .setCarDeposit(1, ethers.parseEther("0.1"));
    expect(await v2.carDepositAmounts(1)).to.equal(
      ethers.parseEther("0.1")
    );

    // Louer avec depot (V2)
    const start2 = futureDayTimestamp(15);
    const end2 = futureDayTimestamp(18); // 3 jours
    const rentalPrice = ethers.parseEther("0.15"); // 3 * 0.05
    const deposit = ethers.parseEther("0.1");

    const tx = await v2
      .connect(renter)
      .rentCarWithDeposit(1, start2, end2, {
        value: rentalPrice + deposit,
      });

    await expect(tx).to.emit(v2, "DepositPaid").withArgs(2, deposit);
    await expect(tx).to.emit(v2, "CarRented");

    // Verifier le depot stocke
    expect(await v2.reservationDeposits(2)).to.equal(deposit);

    // Frais de plateforme accumules (5% de 0.15 = 0.0075)
    expect(await v2.accumulatedPlatformFees()).to.equal(
      ethers.parseEther("0.0075")
    );
  });
});
