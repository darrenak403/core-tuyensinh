/**
 * Health check handlers
 * Following Hono best practices - direct export
 */

import { env } from "@config/env";
import { API_INFO, HEALTH_STATUS } from "@constants/app";
import { getLogger } from "@middleware/request-logger.middleware";
import type { Context } from "hono";

/**
 * Health check handler
 * Simple health status without database connectivity testing
 */
export const healthHandler = async (c: Context) => {
  const logger = getLogger(c);

  logger.info("Health check completed");

  return c.json(
    {
      status: HEALTH_STATUS.HEALTHY,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: API_INFO.VERSION,
      environment: env.NODE_ENV as string,
    },
    200
  );
};
