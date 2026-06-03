import { env } from "@config/env";
import { ERROR_CODES, HTTP_METHODS } from "@constants/app";
import { OpenAPIHono } from "@hono/zod-openapi";
import { errorHandler } from "@middleware/error.middleware";
import { requestLogger } from "@middleware/request-logger.middleware";
import { setupRoutes } from "@routes/index";
import { setupOpenAPIDoc } from "@utils/open-api.config";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";

/**
 * Create and configure the Hono application
 * Optimized for Bun runtime
 */
export function createApp() {
  // Create app with Bun-optimized settings
  const app = new OpenAPIHono({
    strict: false, // Better performance in Bun
  });

  // Middleware order optimized for performance
  // 1. Security first
  app.use("*", secureHeaders());

  // 2. CORS (early to handle preflight)
  app.use(
    "*",
    cors({
      origin: env.NODE_ENV === "development" ? "*" : env.CORS_ORIGINS,
      allowMethods: [...HTTP_METHODS],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // 3. Request ID (before logging)
  app.use("*", requestId());

  // 4. Logging (before routes for complete coverage)
  app.use("*", requestLogger);

  // 5. Performance monitoring
  app.use("*", timing());

  // 6. Development-only middleware
  if (env.NODE_ENV === "development") {
    app.use("*", prettyJSON());
  }

  // Setup OpenAPI documentation
  setupOpenAPIDoc(app);

  // Setup API routes
  setupRoutes(app);

  // 404 handler
  app.notFound((c) => {
    return c.json(
      {
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: "The requested resource was not found",
          path: c.req.path,
          method: c.req.method,
          timestamp: new Date().toISOString(),
        },
      },
      404
    );
  });

  app.onError((err, c) => {
    return errorHandler(err, c);
  });

  return app;
}
