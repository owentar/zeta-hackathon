/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type AgeEstimationStatus = "REVEALED" | "UNREVEALED";

export type AirdropStatus = "COMPLETED" | "QUEUED";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface AgeEstimations {
  chain_id: number;
  cloudinary_public_id: string;
  created_at: Generated<Timestamp>;
  estimated_age: number;
  id: Generated<string>;
  salt: string | null;
  status: Generated<AgeEstimationStatus>;
  wallet_address: string;
}

export interface AirdroppedWallets {
  chain_id: Generated<number>;
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  status: Generated<AirdropStatus>;
  tx_hash: string | null;
  updated_at: Generated<Timestamp>;
  wallet_address: string;
}

export interface DB {
  age_estimations: AgeEstimations;
  airdropped_wallets: AirdroppedWallets;
}
