import { sql } from "kysely";
import { db } from "../db";

export type CreateAgeEstimationParams = {
  cloudinary_public_id: string;
  estimated_age: number;
  wallet_address: string;
  chain_id: number;
};

export type ListAgeEstimationsParams = {
  limit: number;
  offset: number;
  chain_id?: number;
};

export type CreateAirdroppedWalletParams = {
  wallet_address: string;
  status: "QUEUED" | "COMPLETED";
  chain_id: number;
};

export const createAgeEstimation = async (data: CreateAgeEstimationParams) => {
  return db
    .insertInto("age_estimations")
    .values({
      ...data,
      status: "UNREVEALED",
    })
    .returning(["id"])
    .executeTakeFirst();
};

export const getAgeEstimationById = async (id: number) => {
  return db
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
};

export const getAgeEstimationStatus = async (id: number) => {
  return db
    .selectFrom("age_estimations")
    .where("id", "=", id)
    .select(["status", "salt"])
    .executeTakeFirst();
};

export const revealAgeEstimation = async (id: number) => {
  return db
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
    .executeTakeFirst();
};

export const startGame = async (id: number, salt: string) => {
  return db
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
    .executeTakeFirst();
};

export const listAgeEstimations = async (params: ListAgeEstimationsParams) => {
  let query = db
    .selectFrom("age_estimations")
    .orderBy("created_at", "desc")
    .limit(params.limit)
    .offset(params.offset);

  if (params.chain_id !== undefined) {
    query = query.where("chain_id", "=", params.chain_id);
  }

  const ageEstimations = await query
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

  let totalCountQuery = db.selectFrom("age_estimations");

  if (params.chain_id !== undefined) {
    totalCountQuery = totalCountQuery.where("chain_id", "=", params.chain_id);
  }

  const totalCount = await totalCountQuery
    .select(({ fn }) => [fn.count<number>("id").as("total")])
    .executeTakeFirst();

  return {
    items: ageEstimations,
    total: totalCount?.total ?? 0,
    limit: params.limit,
    offset: params.offset,
  };
};

export const checkWalletAirdropped = async (
  wallet_address: string,
  chain_id: number
) => {
  return db
    .selectFrom("airdropped_wallets")
    .where("wallet_address", "=", wallet_address)
    .where("chain_id", "=", chain_id)
    .select(["wallet_address", "chain_id"])
    .executeTakeFirst();
};

export const createAirdroppedWallet = async (
  data: CreateAirdroppedWalletParams
) => {
  return db.insertInto("airdropped_wallets").values(data).execute();
};
