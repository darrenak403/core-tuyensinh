import { env } from "@config/env";
import { logger } from "@config/logger";
import { SQL } from "bun";

/**
 * PostgreSQL database connection using Bun's built-in SQL
 */
export const db = new SQL({
  url: env.DATABASE_URL,
  onconnect: () => logger.debug("Database connected"),
  onclose: () => logger.debug("Database disconnected"),
  max: 20,
  idleTimeout: 30000,
});

/**
 * Close database connection gracefully
 */
export async function closeDatabaseConnection(): Promise<void> {
  await db.end();
}
