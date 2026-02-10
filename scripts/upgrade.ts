import { ethers, upgrades } from "hardhat";

// Replace with your deployed proxy address
const PROXY_ADDRESS = process.env.PROXY_ADDRESS || "";

async function main() {
  if (!PROXY_ADDRESS) {
    throw new Error("Set PROXY_ADDRESS env variable (e.g. PROXY_ADDRESS=0x... npx hardhat run ...)");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Upgrading CarRentalV1 -> V2 with account:", deployer.address);
  console.log("Proxy address:", PROXY_ADDRESS);

  const CarRentalV2 = await ethers.getContractFactory("CarRentalV2");
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, CarRentalV2, {
    call: {
      fn: "initializeV2",
      args: [
        ethers.parseEther("0.005"), // 0.005 ETH late penalty per day
        5,                          // 5% platform fee
      ],
    },
  });
  await upgraded.waitForDeployment();

  const newImplementation = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);

  console.log("\n--- Upgrade Successful ---");
  console.log("Proxy address (unchanged):", PROXY_ADDRESS);
  console.log("New implementation:       ", newImplementation);

  const v2 = await ethers.getContractAt("CarRentalV2", PROXY_ADDRESS);
  console.log("getVersion():", await v2.getVersion());
  console.log("latePenaltyPerDay:", ethers.formatEther(await v2.latePenaltyPerDay()), "ETH");
  console.log("platformFeePercent:", (await v2.platformFeePercent()).toString(), "%");

  console.log("\nTo verify the new implementation on Etherscan:");
  console.log(`  npx hardhat verify --network sepolia ${newImplementation}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
