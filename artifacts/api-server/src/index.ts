import app from "./app";
import { logger } from "./lib/logger";
import { seedIfEmpty } from "./lib/store";

const rawPort = process.env["PORT"] ?? "3001";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  try {
    await seedIfEmpty();
    logger.info("Database seeded (if needed)");
  } catch (e) {
    logger.error({ err: e }, "Failed to seed database");
  }
});
