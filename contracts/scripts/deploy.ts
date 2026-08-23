import { ethers } from "hardhat";

async function main() {
  console.log("Deploying HardWAveHardwareToken contract...");

  const factory = await ethers.getContractFactory("HardWAveHardwareToken");
  const hardwaveToken = await factory.deploy();
  await hardwaveToken.waitForDeployment();

  const contractAddress = await hardwaveToken.getAddress();
  console.log(`✅ HardWAveHardwareToken deployed to: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
