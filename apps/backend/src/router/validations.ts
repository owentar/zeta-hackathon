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
