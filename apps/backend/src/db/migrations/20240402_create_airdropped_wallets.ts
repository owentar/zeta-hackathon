import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType("airdrop_status")
    .asEnum(["QUEUED", "COMPLETED"])
    .execute();

  await db.schema
    .createTable("airdropped_wallets")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("wallet_address", "varchar", (col) => col.notNull().unique())
    .addColumn("chain_id", "integer", (col) => col.notNull().defaultTo(7000))
    .addColumn("status", sql`airdrop_status`, (col) =>
      col.notNull().defaultTo("QUEUED")
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("airdropped_wallets").execute();
  await db.schema.dropType("airdrop_status").execute();
}
