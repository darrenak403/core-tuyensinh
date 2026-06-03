/**
 * Documentation routes
 * Route definitions for OpenAPI documentation, Scalar UI, and API info endpoints
 */

import { BRAND_ASSETS } from "@constants/app";
import { env } from "@config/env";
import { faviconHandler, logoHandler } from "@handlers/assets.handler";
import { scalarDocsHandler } from "@handlers/docs.handler";
import { OpenAPIHono } from "@hono/zod-openapi";

const app = new OpenAPIHono();

app.get(BRAND_ASSETS.FAVICON, faviconHandler);
app.get(BRAND_ASSETS.LOGO, logoHandler);

// Documentation routes using handlers
if (env.NODE_ENV === "development") {
  app.get("/docs", scalarDocsHandler);
}

export default app;
