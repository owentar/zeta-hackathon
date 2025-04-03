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
