import { ethers } from "hardhat";

async function main() {
  const AgeEstimation = await ethers.getContractFactory("AgeEstimation");
  const ageEstimation = await AgeEstimation.deploy();

  await ageEstimation.waitForDeployment();

  console.log("AgeEstimation deployed to:", await ageEstimation.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
