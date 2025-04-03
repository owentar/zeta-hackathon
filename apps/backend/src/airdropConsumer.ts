import "dotenv/config";
import { logger } from "./services/logger";
import { createAirdropWorker } from "./services/queue.service";

const start = async () => {
  const worker = createAirdropWorker();

  // Handle graceful shutdown
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info({ msg: `Received ${signal}, closing worker...` });
      await worker.close();
      process.exit(0);
    });
  });
};

start().catch((error) => {
  logger.error({ msg: "Error starting airdrop consumer:", error });
  process.exit(1);
});
