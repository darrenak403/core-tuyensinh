/**
 * Documentation handlers
 * Handles OpenAPI documentation, Scalar UI, and API info endpoints
 */

import { API_INFO, BRAND_ASSETS, OPENAPI_CONFIG } from "@constants/app";
import type { Context } from "hono";

const scalarConfiguration = JSON.stringify({
  theme: "purple",
  layout: "modern",
  showSidebar: true,
  hideDownloadButton: false,
  searchHotKey: "k",
  favicon: BRAND_ASSETS.FAVICON,
  metaData: {
    title: `${API_INFO.NAME} - API Documentation`,
    description: API_INFO.DESCRIPTION,
    ogTitle: API_INFO.NAME,
    ogImage: BRAND_ASSETS.LOGO,
  },
});

/**
 * Scalar documentation handler
 * Serves Scalar API reference UI
 */
export const scalarDocsHandler = async (c: Context) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${API_INFO.NAME} - API Documentation</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="${API_INFO.DESCRIPTION}" />
        <link rel="icon" type="image/webp" href="${BRAND_ASSETS.FAVICON}" />
        <link rel="apple-touch-icon" href="${BRAND_ASSETS.LOGO}" />
      </head>
      <body>
        <script
          id="api-reference"
          data-url="${OPENAPI_CONFIG.PATHS.OPENAPI_JSON}"
          data-configuration='${scalarConfiguration}'
          src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest"></script>
      </body>
    </html>
  `);
};
