/**
 * Campus routes - API endpoints for campus operations
 */

import {
  createCampusHandler,
  deleteCampusHandler,
  getCampusHandler,
  getCampusesHandler,
  getCampusesSummaryHandler,
  updateCampusHandler,
} from "@handlers/campuses.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  campusDeleteResponseSchema,
  campusErrorSchema,
  campusParamsSchema,
  campusResponseSchema,
  campusSummaryResponseSchema,
  campusesQuerySchema,
  campusesResponseSchema,
  createCampusBodySchema,
  updateCampusBodySchema,
} from "@schemas/campuses";

const app = new OpenAPIHono();

// Get all campuses route (public)
const getCampusesRoute = createRoute({
  method: "get",
  path: "/api/v1/campuses",
  summary: "Get all campuses",
  description:
    "Retrieve all active campuses with foundation fees and program availability. Supports pagination and year filtering.",
  tags: ["Campuses"],
  request: {
    query: campusesQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: campusesResponseSchema,
        },
      },
      description:
        "Paginated list of campuses with foundation fees and program availability",
    },
  },
});

// Get campus by ID route (public)
const getCampusRoute = createRoute({
  method: "get",
  path: "/api/v1/campuses/{id}",
  summary: "Get campus by ID",
  description:
    "Retrieve a specific campus by ID with foundation fees and program availability",
  tags: ["Campuses"],
  request: {
    params: campusParamsSchema,
    query: campusesQuerySchema.pick({ year: true }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: campusResponseSchema,
        },
      },
      description:
        "Campus details with foundation fees and program availability",
    },
    404: {
      content: {
        "application/json": {
          schema: campusErrorSchema,
        },
      },
      description: "Campus not found",
    },
  },
});

// Create campus route (admin only)
const createCampusRoute = createRoute({
  method: "post",
  path: "/api/v1/campuses",
  summary: "Create new campus",
  description: "Create a new campus (admin only)",
  tags: ["Campuses"],
  middleware: [authMiddleware, requireAdmin] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: createCampusBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: campusResponseSchema,
        },
      },
      description: "Campus created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: campusErrorSchema,
        },
      },
      description: "Invalid input data",
    },
    401: {
      content: {
        "application/json": {
          schema: campusErrorSchema,
        },
      },
      description: "Unauthorized",
    },
    403: {
      content: {
        "application/json": {
          schema: campusErrorSchema,
        },
      },
      description: "Forbidden - Admin access required",
    },
  },
});

// Update campus route (admin only)
const updateCampusRoute = createRoute({
  method: "put",
  path: "/api/v1/campuses/{id}",
  summary: "Update campus",
  description: "Update an existing campus (admin only)",
  tags: ["Campuses"],
  middleware: [authMiddleware, requireAdmin] as const,
  request: {
    params: campusParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateCampusBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: campusResponseSchema,
        },
      },
      description: "Campus updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: campusErrorSchema,
        },
      },
      description: "Invalid input data",
    },
    401: {
      content: {
        "application/json": {
          schema: campusErrorSchema,
        },
      },
      description: "Unauthorized",
    },
    403: {
      content: {
        "application/json": {
          schema: campusErrorSchema,
        },
      },
      description: "Forbidden - Admin access required",
    },
    404: {
      content: {
        "application/json": {
          schema: campusErrorSchema,
        },
      },
      description: "Campus not found",
    },
  },
});

// Delete campus route (admin only)
const deleteCampusRoute = createRoute({
  method: "delete",
  path: "/api/v1/campuses/{id}",
  summary: "Delete campus",
  description:
    "Soft delete a campus by setting is_active to false (admin only)",
  tags: ["Campuses"],
  middleware: [authMiddleware, requireAdmin] as const,
  request: {
    params: campusParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: campusDeleteResponseSchema,
        },
      },
      description: "Campus deleted successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: campusErrorSchema,
        },
      },
      description: "Unauthorized",
    },
    403: {
      content: {
        "application/json": {
          schema: campusErrorSchema,
        },
      },
      description: "Forbidden - Admin access required",
    },
    404: {
      content: {
        "application/json": {
          schema: campusErrorSchema,
        },
      },
      description: "Campus not found",
    },
  },
});

// Get campuses summary route (public)
const getCampusesSummaryRoute = createRoute({
  method: "get",
  path: "/api/v1/campuses/summary",
  summary: "Get campuses summary",
  description:
    "Get statistical summary of all campuses including totals, averages, and counts",
  tags: ["Campuses"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: campusSummaryResponseSchema,
        },
      },
      description: "Campus summary statistics",
    },
  },
});

// Register routes (summary must come before {id} route to avoid conflicts)
app.openapi(getCampusesRoute, getCampusesHandler);
app.openapi(getCampusesSummaryRoute, getCampusesSummaryHandler);
app.openapi(getCampusRoute, getCampusHandler);
app.openapi(createCampusRoute, createCampusHandler);
app.openapi(updateCampusRoute, updateCampusHandler);
app.openapi(deleteCampusRoute, deleteCampusHandler);

export default app;
