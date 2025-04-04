import { ethers } from "hardhat";

async function main() {
  const platformWallet = process.env.PLATFORM_WALLET;
  if (!platformWallet) {
    throw new Error("PLATFORM_WALLET environment variable is not set");
  }

  console.log("Deploying AgeEstimationGame contract...");
  console.log("Platform wallet:", platformWallet);

  const AgeEstimationGame = await ethers.getContractFactory(
    "AgeEstimationGame"
  );
  const game = await AgeEstimationGame.deploy(platformWallet);

  await game.waitForDeployment();

  console.log("AgeEstimationGame deployed to:", await game.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
