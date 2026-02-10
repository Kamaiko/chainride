import { ethers } from "hardhat";

async function main() {
  const v2 = await ethers.getContractAt("CarRentalV2", "0x2BCA7b901cEc9049EBCF2695Be33735BeDc7f748");
  console.log("getVersion():", await v2.getVersion());
}

main().catch(console.error);
