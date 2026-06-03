/**
 * Scholarships routes - API endpoints for scholarship operations
 */

import {
  createScholarshipHandler,
  deleteScholarshipHandler,
  getScholarshipByIdHandler,
  getScholarshipsHandler,
  updateScholarshipHandler,
} from "@handlers/scholarships.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  createScholarshipSchema,
  scholarshipDeleteResponseSchema,
  scholarshipErrorSchema,
  scholarshipListResponseSchema,
  scholarshipParamsSchema,
  scholarshipQuerySchema,
  scholarshipResponseSchema,
  updateScholarshipSchema,
} from "@schemas/scholarships";

const app = new OpenAPIHono();

// Get all scholarships route (public)
const getScholarshipsRoute = createRoute({
  method: "get",
  path: "/api/v1/scholarships",
  summary: "Get all scholarships",
  description:
    "Retrieve all scholarships with filtering support for year and type.",
  tags: ["Scholarships"],
  request: {
    query: scholarshipQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: scholarshipListResponseSchema,
        },
      },
      description: "A paginated list of scholarships",
    },
  },
});

// Get scholarship by ID route (public)
const getScholarshipByIdRoute = createRoute({
  method: "get",
  path: "/api/v1/scholarships/{id}",
  summary: "Get a single scholarship by ID",
  description: "Retrieve a specific scholarship by its unique ID.",
  tags: ["Scholarships"],
  request: {
    params: scholarshipParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: scholarshipResponseSchema,
        },
      },
      description: "Details of the scholarship",
    },
    404: {
      content: {
        "application/json": {
          schema: scholarshipErrorSchema,
        },
      },
      description: "Scholarship not found",
    },
  },
});

// Create scholarship route (admin only)
const createScholarshipRoute = createRoute({
  method: "post",
  path: "/api/v1/scholarships",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Create a new scholarship",
  description: "Create a new scholarship record (admin access required).",
  tags: ["Scholarships"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createScholarshipSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: scholarshipResponseSchema,
        },
      },
      description: "Scholarship created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: scholarshipErrorSchema,
        },
      },
      description: "Invalid request data",
    },
    409: {
      content: {
        "application/json": {
          schema: scholarshipErrorSchema,
        },
      },
      description: "Scholarship with this code already exists for the year",
    },
  },
});

// Update scholarship route (admin only)
const updateScholarshipRoute = createRoute({
  method: "put",
  path: "/api/v1/scholarships/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Update an existing scholarship",
  description: "Update an existing scholarship record (admin access required).",
  tags: ["Scholarships"],
  request: {
    params: scholarshipParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateScholarshipSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: scholarshipResponseSchema,
        },
      },
      description: "Scholarship updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: scholarshipErrorSchema,
        },
      },
      description: "Invalid request data",
    },
    404: {
      content: {
        "application/json": {
          schema: scholarshipErrorSchema,
        },
      },
      description: "Scholarship not found",
    },
    409: {
      content: {
        "application/json": {
          schema: scholarshipErrorSchema,
        },
      },
      description: "Scholarship with this code already exists for the year",
    },
  },
});

// Delete scholarship route (admin only)
const deleteScholarshipRoute = createRoute({
  method: "delete",
  path: "/api/v1/scholarships/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Delete a scholarship",
  description:
    "Soft delete a scholarship record by its ID (admin access required).",
  tags: ["Scholarships"],
  request: {
    params: scholarshipParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: scholarshipDeleteResponseSchema,
        },
      },
      description: "Scholarship deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: scholarshipErrorSchema,
        },
      },
      description: "Scholarship not found",
    },
    500: {
      content: {
        "application/json": {
          schema: scholarshipErrorSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Register routes
app.openapi(getScholarshipsRoute, getScholarshipsHandler);
app.openapi(getScholarshipByIdRoute, getScholarshipByIdHandler);
app.openapi(createScholarshipRoute, createScholarshipHandler);
app.openapi(updateScholarshipRoute, updateScholarshipHandler);
app.openapi(deleteScholarshipRoute, deleteScholarshipHandler);

export default app;
