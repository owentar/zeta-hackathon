import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType("airdrop_status")
    .asEnum(["QUEUED", "COMPLETED"])
    .execute();

  await db.schema
    .createTable("airdropped_wallets")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("wallet_address", "varchar", (col) => col.notNull())
    .addColumn("chain_id", "integer", (col) => col.notNull().defaultTo(7000))
    .addColumn("status", sql`airdrop_status`, (col) =>
      col.notNull().defaultTo("QUEUED")
    )
    .addColumn("tx_hash", "varchar")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addUniqueConstraint("wallet_address_chain_id", [
      "wallet_address",
      "chain_id",
    ])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("airdropped_wallets").execute();
  await db.schema.dropType("airdrop_status").execute();
}
