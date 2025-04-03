import { Queue, Worker } from "bullmq";
import { ethers } from "ethers";
import { db } from "../db";
import { logger } from "./logger";
import { sendAirdrop } from "./web3";

interface AirdropJob {
  walletAddress: string;
  chainId: number;
}

const AIRDROP_QUEUE_NAME = "airdrop-queue";

export const airdropQueue = new Queue<AirdropJob>(AIRDROP_QUEUE_NAME, {
  connection: {
    url: process.env.REDIS_URL,
  },
});
airdropQueue.setGlobalConcurrency(1);

export const createAirdropWorker = () => {
  const worker = new Worker<AirdropJob>(
    AIRDROP_QUEUE_NAME,
    async (job) => {
      const { walletAddress, chainId } = job.data;

      // Check if wallet is waiting for airdrop
      const existingWallet = await db
        .selectFrom("airdropped_wallets")
        .where("wallet_address", "=", walletAddress)
        .where("chain_id", "=", chainId)
        .where("status", "=", "QUEUED")
        .selectAll()
        .executeTakeFirst();

      if (!existingWallet) {
        logger.error({
          msg: `Airdrop not scheduled for wallet ${walletAddress} on chain ${chainId}`,
          data: job.data,
        });
        return;
      }

      logger.info({
        msg: `Sending airdrop to wallet ${walletAddress} on chain ${chainId}`,
        data: job.data,
      });

      // Send ZETA tokens
      const amount = ethers.parseEther(process.env.AIRDROP_AMOUNT || "0.01");
      const tx = await sendAirdrop({
        to: walletAddress,
        amount,
        chainId,
      });
      await tx.wait();

      // Record the airdrop
      await db
        .updateTable("airdropped_wallets")
        .set({
          tx_hash: tx.hash,
          status: "COMPLETED",
        })
        .where("id", "=", existingWallet.id)
        .execute();
    },
    {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
      },
      concurrency: 1, // Ensure only one job is processed at a time
    }
  );

  worker.on("completed", (job) => {
    logger.info({
      msg: `Airdrop completed for wallet: ${job.data.walletAddress} on chain ${job.data.chainId}`,
      data: job.data,
    });
  });

  worker.on("failed", (job, error) => {
    logger.error({
      msg: `Airdrop failed for wallet: ${job?.data.walletAddress} on chain ${job?.data.chainId}`,
      error,
    });
  });

  return worker;
};
