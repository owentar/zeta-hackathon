import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("age_estimations")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("cloudinary_public_id", "text", (col) => col.notNull())
    .addColumn("estimated_age", "integer", (col) => col.notNull())
    .addColumn("wallet_address", "text", (col) => col.notNull())
    .addColumn("chain_id", "integer", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("age_estimations").execute();
}
