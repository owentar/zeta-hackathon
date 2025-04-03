import { Router } from "express";
import { db } from "../db";
import { estimateAge } from "../services/faceplusplus.service";
import { logger } from "../services/logger";
import { airdropQueue } from "../services/queue.service";
import { estimateAgeSchema } from "./validations";

const apiRouter = Router();

apiRouter.post("/estimate-age", async (req, res) => {
  const result = estimateAgeSchema.safeParse(req.body);

  if (!result.success) {
    logger.warn({ msg: "Invalid request", error: result.error });

    return res.status(400).json(result.error);
  }

  const { imageDataURL, walletAddress, chainId } = result.data;

  const { faces } = await estimateAge(imageDataURL);

  if (faces.length !== 1) {
    const errorMsg =
      faces.length === 0 ? "No face detected" : "Multiple faces detected";
    logger.warn({
      msg: errorMsg,
      walletAddress,
    });

    return res.status(400).json({ error: errorMsg, faces: faces.length });
  }

  const age = faces[0].attributes.age.value;

  // Check if wallet was already airdropped
  const existingWallet = await db
    .selectFrom("airdropped_wallets")
    .where("wallet_address", "=", walletAddress)
    .selectAll()
    .executeTakeFirst();

  if (!existingWallet) {
    await db
      .insertInto("airdropped_wallets")
      .values({
        wallet_address: walletAddress,
        status: "QUEUED",
        chain_id: chainId,
      })
      .execute();

    // Add to airdrop queue
    await airdropQueue.add("airdrop", {
      walletAddress,
    });
  }

  res.json({
    age,
    isRewarded: !existingWallet,
  });
});

export default apiRouter;
