import { Job, Queue, Worker } from "bullmq";
import { ethers } from "ethers";
import { db } from "../db";
import { logger } from "./logger";
import { sendAirdrop } from "./web3";

export interface AirdropJob {
  walletAddress: string;
  chainId: number;
}

let queue: Queue<AirdropJob>;

const getQueue = () => {
  if (!queue) {
    // Create queue instance
    queue = new Queue<AirdropJob>("airdrop", {
      connection: {
        url: process.env.REDIS_URL || "redis://localhost:6379",
      },
    });
  }
  return queue;
};

// Queue operations
export const addAirdropJob = async (
  data: AirdropJob
): Promise<Job<AirdropJob>> => {
  try {
    const job = await getQueue().add("airdrop", data);
    logger.info({ msg: "Added airdrop job", jobId: job.id, data });
    return job;
  } catch (error) {
    logger.error({ msg: "Failed to add airdrop job", error, data });
    throw error;
  }
};

export const closeQueue = async (): Promise<void> => {
  try {
    await getQueue().close();
    logger.info({ msg: "Closed airdrop queue" });
  } catch (error) {
    logger.error({ msg: "Failed to close airdrop queue", error });
    throw error;
  }
};

// Worker creation
export const createAirdropWorker = () => {
  const worker = new Worker<AirdropJob>(
    "airdrop",
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
        url: process.env.REDIS_URL || "redis://localhost:6379",
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
