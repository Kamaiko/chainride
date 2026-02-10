import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CarRentalV1 with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const CarRentalV1 = await ethers.getContractFactory("CarRentalV1");
  const proxy = await upgrades.deployProxy(CarRentalV1, [deployer.address], {
    kind: "uups",
  });
  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("\n--- Deployment Successful ---");
  console.log("Proxy address:          ", proxyAddress);
  console.log("Implementation address: ", implementationAddress);
  console.log("\nSave the proxy address for the upgrade script and frontend.");
  console.log("To verify on Etherscan:");
  console.log(`  npx hardhat verify --network sepolia ${implementationAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
