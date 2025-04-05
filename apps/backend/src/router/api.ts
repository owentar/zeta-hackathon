import { randomBytes } from "crypto";
import { Router } from "express";
import { sql } from "kysely";
import { keccak256 } from "viem";
import { db } from "../db";
import { uploadImage } from "../services/cloudinary.service";
import { estimateAge } from "../services/faceplusplus.service";
import { logger } from "../services/logger";
import { airdropQueue } from "../services/queue.service";
import {
  ageEstimationIdSchema,
  estimateAgeSchema,
  listAgeEstimationsSchema,
} from "./validations";

const apiRouter = Router();

const generateSalt = () => randomBytes(32).toString("hex");

const hashAgeWithSalt = (age: number, salt: string) => {
  return keccak256(Buffer.from(`${age}${salt}`, "utf8"));
};

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
      status: "UNREVEALED",
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
    isRewarded: !existingWallet,
    cloudinaryPublicId,
    estimationId: ageEstimation?.id,
  });
});

apiRouter.post("/age-estimation/:id/reveal", async (req, res) => {
  const result = ageEstimationIdSchema.safeParse(req.params);

  if (!result.success) {
    logger.warn({ msg: "Invalid age estimation ID", error: result.error });
    return res.status(400).json(result.error);
  }

  const { id } = result.data;

  // First check if age estimation exists and is in valid state
  const existingEstimation = await db
    .selectFrom("age_estimations")
    .where("id", "=", id)
    .select(["status", "salt"])
    .executeTakeFirst();

  if (!existingEstimation) {
    logger.warn({ msg: "Age estimation not found", id });
    return res.status(404).json({ error: "Age estimation not found" });
  }

  if (existingEstimation.status === "REVEALED") {
    logger.warn({ msg: "Age estimation already revealed", id });
    return res.status(400).json({ error: "Age estimation already revealed" });
  }

  if (existingEstimation.salt) {
    logger.warn({ msg: "Game already started for this age estimation", id });
    return res.status(400).json({ error: "Game already started" });
  }

  const ageEstimation = await db
    .updateTable("age_estimations")
    .set({ status: "REVEALED" })
    .where("id", "=", id)
    .returning([
      "id",
      "cloudinary_public_id",
      "estimated_age",
      "wallet_address",
      "chain_id",
      "created_at",
      "status",
      "salt",
    ])
    .executeTakeFirstOrThrow();

  res.json(ageEstimation);
});

apiRouter.post("/age-estimation/:id/start-game", async (req, res) => {
  const result = ageEstimationIdSchema.safeParse(req.params);

  if (!result.success) {
    logger.warn({ msg: "Invalid age estimation ID", error: result.error });
    return res.status(400).json(result.error);
  }

  const { id } = result.data;

  // First check if age estimation exists and is in valid state
  const existingEstimation = await db
    .selectFrom("age_estimations")
    .where("id", "=", id)
    .select(["status", "salt"])
    .executeTakeFirst();

  if (!existingEstimation) {
    logger.warn({ msg: "Age estimation not found", id });
    return res.status(404).json({ error: "Age estimation not found" });
  }

  if (existingEstimation.status === "REVEALED") {
    logger.warn({ msg: "Age estimation already revealed", id });
    return res.status(400).json({ error: "Age estimation already revealed" });
  }

  if (existingEstimation.salt) {
    logger.warn({ msg: "Game already started for this age estimation", id });
    return res.status(400).json({ error: "Game already started" });
  }

  // Generate salt and hash age
  const salt = generateSalt();

  const ageEstimation = await db
    .updateTable("age_estimations")
    .set({ salt })
    .where("id", "=", id)
    .returning([
      "id",
      "cloudinary_public_id",
      "estimated_age",
      "wallet_address",
      "chain_id",
      "created_at",
      "status",
      "salt",
    ])
    .executeTakeFirstOrThrow();

  // Return the hash that will be used in the smart contract
  const ageHash = hashAgeWithSalt(ageEstimation.estimated_age, salt);

  res.json({
    id: ageEstimation.id,
    ageHash,
  });
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
    .select([
      "id",
      "cloudinary_public_id",
      "wallet_address",
      "chain_id",
      "created_at",
      "status",
      sql<
        number | null
      >`CASE WHEN status = 'REVEALED' THEN estimated_age ELSE NULL END`.as(
        "estimated_age"
      ),
    ])
    .executeTakeFirst();

  if (!ageEstimation) {
    logger.warn({ msg: "Age estimation not found", id });
    return res.status(404).json({ error: "Age estimation not found" });
  }

  res.json(ageEstimation);
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
    .select([
      "id",
      "cloudinary_public_id",
      "wallet_address",
      "chain_id",
      "created_at",
      "status",
      sql<
        number | null
      >`CASE WHEN status = 'REVEALED' THEN estimated_age ELSE NULL END`.as(
        "estimated_age"
      ),
    ])
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
