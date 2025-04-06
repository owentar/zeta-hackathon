import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType("age_estimation_status")
    .asEnum(["UNREVEALED", "REVEALED"])
    .execute();

  await db.schema
    .createTable("age_estimations")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("cloudinary_public_id", "text", (col) => col.notNull())
    .addColumn("estimated_age", "integer", (col) => col.notNull())
    .addColumn("wallet_address", "text", (col) => col.notNull())
    .addColumn("chain_id", "integer", (col) => col.notNull())
    .addColumn("status", sql`age_estimation_status`, (col) =>
      col.notNull().defaultTo("UNREVEALED")
    )
    .addColumn("salt", "text")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("age_estimations").execute();
  await db.schema.dropType("age_estimation_status").execute();
}
