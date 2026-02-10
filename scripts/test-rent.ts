import { ethers } from "hardhat";

async function main() {
  const proxy = "0x2BCA7b901cEc9049EBCF2695Be33735BeDc7f748";
  const v2 = await ethers.getContractAt("CarRentalV2", proxy);

  // Check car info
  const car = await v2.getCar(1);
  console.log("Car:", car.brand, car.model, "price:", ethers.formatEther(car.dailyPrice), "ETH/day");
  console.log("Active:", car.isActive, "Owner:", car.owner);

  // Check dates
  const tomorrow = Math.floor(Date.now() / 1000 / 86400 + 1) * 86400;
  const dayAfter = tomorrow + 86400;
  console.log("\nStart (tomorrow midnight UTC):", tomorrow, new Date(tomorrow * 1000).toISOString());
  console.log("End (day after):", dayAfter, new Date(dayAfter * 1000).toISOString());
  console.log("Current block.timestamp approx:", Math.floor(Date.now() / 1000));

  // Check availability
  const available = await v2.isCarAvailable(1, tomorrow, dayAfter);
  console.log("Available:", available);

  // Check price
  const price = await v2.calculateRentalPrice(1, tomorrow, dayAfter);
  console.log("Rental price:", ethers.formatEther(price), "ETH");

  // Check deposit
  const deposit = await v2.carDepositAmounts(1);
  console.log("Deposit:", ethers.formatEther(deposit), "ETH");

  // Try static call to simulate rentCar
  try {
    const [signer] = await ethers.getSigners();
    console.log("\nSigner:", signer.address);
    console.log("Trying rentCar static call...");
    await v2.rentCar.staticCall(1, tomorrow, dayAfter, { value: price });
    console.log("SUCCESS - rentCar would work!");
  } catch (e: any) {
    console.log("REVERT:", e.message);
  }
}

main().catch(console.error);
