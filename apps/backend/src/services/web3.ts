import { ethers } from "ethers";
import { logger } from "./logger";

const gerZetaRpcUrl = (chainId: number) => {
  switch (chainId) {
    case 7000:
      return process.env.ZETACHAIN_MAINNET_RPC_URL;
    case 7001:
      return process.env.ZETACHAIN_TESTNET_RPC_URL;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
};

export const sendAirdrop = async ({
  to,
  amount,
  chainId,
}: {
  to: string;
  amount: ethers.BigNumberish;
  chainId: number;
}) => {
  const provider = new ethers.JsonRpcProvider(gerZetaRpcUrl(chainId));
  const backendWallet = new ethers.Wallet(
    process.env.AIRDROP_WALLET_PRIVATE_KEY!,
    provider
  );
  // Check wallet balance before sending
  const balance = await provider.getBalance(backendWallet.address);
  if (ethers.getBigInt(balance) < ethers.getBigInt(amount)) {
    logger.error({
      msg: `Insufficient balance. Required: ${amount}, Available: ${balance}`,
      data: { to, amount },
    });
    throw new Error(
      `Insufficient balance. Required: ${amount}, Available: ${balance}`
    );
  }

  return backendWallet.sendTransaction({
    to,
    value: amount,
  });
};

export const getBackendWallet = (chainId: number) => {
  const provider = new ethers.JsonRpcProvider(gerZetaRpcUrl(chainId));
  return new ethers.Wallet(
    process.env.AGE_ESTIMATION_GAME_ADMIN_PRIVATE_KEY!,
    provider
  );
};

export const getContract = (chainId: number) => {
  const provider = new ethers.JsonRpcProvider(gerZetaRpcUrl(chainId));
  return new ethers.Contract(
    process.env.AGE_ESTIMATION_GAME_CONTRACT_ADDRESS!,
    [
      "function getGame(uint256) view returns (tuple(uint256 id, bytes32 secretHash, uint256 endTime, uint256 betAmount, uint256 potSize, bool isRevealed, bool isFinished, address owner, uint256 actualAge))",
      "function games(uint256) view returns (tuple(uint256 id, bytes32 secretHash, uint256 endTime, uint256 betAmount, uint256 potSize, bool isRevealed, bool isFinished, address owner, uint256 actualAge))",
      "function revealAndFinishGame(uint256, uint256, string) external",
      "function computeHash(uint256, string) view returns (bytes32)",
    ],
    provider
  );
};
