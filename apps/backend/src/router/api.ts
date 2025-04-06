import { randomBytes } from "crypto";
import { ethers } from "ethers";
import { Router } from "express";
import { keccak256 } from "viem";
import {
  checkWalletAirdropped,
  createAgeEstimation,
  createAirdroppedWallet,
  getAgeEstimationById,
  getAgeEstimationStatus,
  listAgeEstimations,
  revealAgeEstimation,
  startGame,
} from "../repositories/age-estimation.repository";
import { uploadImage } from "../services/cloudinary.service";
import { estimateAge } from "../services/faceplusplus.service";
import { logger } from "../services/logger";
import { addAirdropJob } from "../services/queue.service";
import { getContract } from "../services/web3";
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

apiRouter.post("/age-estimation", async (req, res) => {
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
  const ageEstimation = await createAgeEstimation({
    cloudinary_public_id: cloudinaryPublicId,
    estimated_age: age,
    wallet_address: walletAddress,
    chain_id: chainId,
  });

  res.json({
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
  const existingEstimation = await getAgeEstimationStatus(id);

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

  const ageEstimation = await revealAgeEstimation(id);

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
  const existingEstimation = await getAgeEstimationById(id);

  if (!existingEstimation) {
    logger.warn({ msg: "Age estimation not found", id });
    return res.status(404).json({ error: "Age estimation not found" });
  }

  if (existingEstimation.status === "REVEALED") {
    logger.warn({ msg: "Age estimation already revealed", id });
    return res.status(400).json({ error: "Age estimation already revealed" });
  }

  // Check if game exists in blockchain
  const contract = getContract(existingEstimation.chain_id);

  try {
    const game = await contract.games(BigInt(id));
    if (game.owner !== ethers.ZeroAddress) {
      logger.warn({ msg: "Game already exists in blockchain", id });
      return res.status(400).json({ error: "Game already started" });
    }
  } catch (error) {
    logger.error({
      msg: "Failed to check game status in blockchain",
      error,
      id,
    });
    return res.status(500).json({ error: "Failed to check game status" });
  }

  // Generate salt and hash age
  const salt = generateSalt();

  const ageEstimation = await startGame(id, salt);

  if (!ageEstimation) {
    logger.warn({ msg: "Failed to start game", id });
    return res.status(500).json({ error: "Failed to start game" });
  }

  // Check if wallet was already airdropped
  const existingWallet = await checkWalletAirdropped(
    ageEstimation.wallet_address,
    ageEstimation.chain_id
  );

  if (!existingWallet) {
    await createAirdroppedWallet({
      wallet_address: ageEstimation.wallet_address,
      status: "QUEUED",
      chain_id: ageEstimation.chain_id,
    });

    // Add to airdrop queue
    await addAirdropJob({
      walletAddress: ageEstimation.wallet_address,
      chainId: ageEstimation.chain_id,
    });
  }

  // Return the hash that will be used in the smart contract
  const ageHash = hashAgeWithSalt(ageEstimation.estimated_age, salt);

  res.json({
    id: ageEstimation.id,
    ageHash,
    isRewarded: !existingWallet,
  });
});

apiRouter.get("/age-estimation/:id", async (req, res) => {
  const result = ageEstimationIdSchema.safeParse(req.params);

  if (!result.success) {
    logger.warn({ msg: "Invalid age estimation ID", error: result.error });
    return res.status(400).json(result.error);
  }

  const { id } = result.data;

  const ageEstimation = await getAgeEstimationById(id);

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

  const response = await listAgeEstimations({
    limit,
    offset,
  });

  res.json(response);
});

export default apiRouter;
