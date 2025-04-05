import { ethers } from "ethers";
import { z } from "zod";

export const walletSchema = z
  .string()
  .refine((val) => ethers.isAddress(val), {
    message: "Invalid wallet",
  })
  .transform((val) => val.toLowerCase());

export const estimateAgeSchema = z.object({
  imageDataURL: z.string(),
  walletAddress: walletSchema,
  chainId: z
    .number()
    .int()
    .refine((val) => val === 7000 || val === 7001, {
      message: "Chain ID must be either 7000 or 7001",
    }),
});

export const ageEstimationIdSchema = z.object({
  id: z.string().uuid(),
});

export const listAgeEstimationsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(5),
  offset: z.number().int().min(0).default(0),
});
