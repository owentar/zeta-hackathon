import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { uploadImage } from "../services/cloudinary.service";
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

  // Upload image to Cloudinary
  const cloudinaryPublicId = await uploadImage(imageDataURL);

  // Save age estimation record
  const ageEstimation = await db
    .insertInto("age_estimations")
    .values({
      cloudinary_public_id: cloudinaryPublicId,
      estimated_age: age,
      wallet_address: walletAddress,
      chain_id: chainId,
    })
    .returning(["id"])
    .executeTakeFirst();

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
      chainId,
    });
  }

  res.json({
    age,
    isRewarded: !existingWallet,
    cloudinaryPublicId,
    estimationId: ageEstimation?.id,
  });
});

const ageEstimationIdSchema = z.object({
  id: z.string().uuid(),
});

apiRouter.get("/age-estimation/:id", async (req, res) => {
  const result = ageEstimationIdSchema.safeParse(req.params);

  if (!result.success) {
    logger.warn({ msg: "Invalid age estimation ID", error: result.error });
    return res.status(400).json(result.error);
  }

  const { id } = result.data;

  const ageEstimation = await db
    .selectFrom("age_estimations")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  if (!ageEstimation) {
    logger.warn({ msg: "Age estimation not found", id });
    return res.status(404).json({ error: "Age estimation not found" });
  }

  res.json(ageEstimation);
});

const listAgeEstimationsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(5),
  offset: z.number().int().min(0).default(0),
});

apiRouter.get("/age-estimations", async (req, res) => {
  const result = listAgeEstimationsSchema.safeParse({
    limit: Number(req.query.limit),
    offset: Number(req.query.offset),
  });

  if (!result.success) {
    logger.warn({ msg: "Invalid pagination parameters", error: result.error });
    return res.status(400).json(result.error);
  }

  const { limit, offset } = result.data;

  const ageEstimations = await db
    .selectFrom("age_estimations")
    .orderBy("created_at", "desc")
    .limit(limit)
    .offset(offset)
    .selectAll()
    .execute();

  const totalCount = await db
    .selectFrom("age_estimations")
    .select(({ fn }) => [fn.count<number>("id").as("total")])
    .executeTakeFirst();

  res.json({
    items: ageEstimations,
    total: totalCount?.total ?? 0,
    limit,
    offset,
  });
});

export default apiRouter;
