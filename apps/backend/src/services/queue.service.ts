import { Queue, Worker } from "bullmq";
import { ethers } from "ethers";
import { db } from "../db";

interface AirdropJob {
  walletAddress: string;
}

const AIRDROP_QUEUE_NAME = "airdrop-queue";

export const airdropQueue = new Queue<AirdropJob>(AIRDROP_QUEUE_NAME, {
  connection: {
    url: process.env.REDIS_URL,
  },
});

const provider = new ethers.JsonRpcProvider(process.env.ZETACHAIN_RPC_URL);
const wallet = new ethers.Wallet(
  process.env.AIRDROP_WALLET_PRIVATE_KEY!,
  provider
);

const worker = new Worker<AirdropJob>(
  AIRDROP_QUEUE_NAME,
  async (job) => {
    const { walletAddress } = job.data;

    // Check if wallet was already airdropped
    const existingWallet = await db
      .selectFrom("airdropped_wallets")
      .where("wallet_address", "=", walletAddress)
      .selectAll()
      .executeTakeFirst();

    if (existingWallet) {
      throw new Error("Wallet already received airdrop");
    }

    // Send ZETA tokens
    const amount = ethers.parseEther(process.env.AIRDROP_AMOUNT || "0.1");
    const tx = await wallet.sendTransaction({
      to: walletAddress,
      value: amount,
    });

    await tx.wait();

    // Record the airdrop
    await db
      .insertInto("airdropped_wallets")
      .values({
        wallet_address: walletAddress,
      })
      .execute();
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`Airdrop completed for wallet: ${job.data.walletAddress}`);
});

worker.on("failed", (job, err) => {
  console.error(`Airdrop failed for wallet: ${job?.data.walletAddress}`, err);
});
