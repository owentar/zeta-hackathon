import { promises as fs } from "fs";
import { FileMigrationProvider, Migrator } from "kysely";
import * as path from "path";

import { logger } from "../services/logger";
import { db } from "./";

export async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "./migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  if (error) {
    logger.error({ msg: "Failed to migrate", error: error.toString() });

    process.exit(1);
  }

  if (!results || results.length === 0) {
    logger.info({ msg: "No migrations to execute" });

    return;
  }

  results.forEach((result) => {
    if (result.status === "Success") {
      logger.info({
        msg: `Migration executed successfully`,
        migrationName: result.migrationName,
      });
    } else if (result.status === "Error") {
      logger.error({
        msg: "Failed to execute migration",
        migrationName: result.migrationName,
      });
    } else {
      logger.error({
        msg: "Unknown migration status",
        status: result.status,
        migrationName: result.migrationName,
      });
    }
  });
}

export const revert = async () => {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "./migrations"),
    }),
  });

  const { error, results } = await migrator.migrateDown();

  if (error) {
    logger.error({ msg: "Failed to revert", error: error.toString() });

    process.exit(1);
  }

  if (!results || results.length === 0) {
    logger.info({ msg: "No migrations to revert" });

    return;
  }

  results.forEach((result) => {
    if (result.status === "Success") {
      logger.info({
        msg: `Migration reverted successfully`,
        migrationName: result.migrationName,
      });
    } else if (result.status === "Error") {
      logger.error({
        msg: "Failed to execute migration revert",
        migrationName: result.migrationName,
      });
    } else {
      logger.error({
        msg: "Unknown migration status",
        status: result.status,
        migrationName: result.migrationName,
      });
    }
  });
};
