/**
 * Tuition routes - API endpoints for tuition operations
 */

import {
  calculateTuitionCostHandler,
  createTuitionHandler,
  deleteTuitionHandler,
  getCampusTuitionHandler,
  getTuitionByIdHandler,
  getTuitionComparisonHandler,
  getTuitionHandler,
  getTuitionSummaryHandler,
  getTuitionWithFiltersHandler,
  updateTuitionHandler,
} from "@handlers/tuition.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  campusTuitionQuerySchema,
  campusTuitionResponseSchema,
  createTuitionSchema,
  tuitionCalculateSchema,
  tuitionCalculationResponseSchema,
  tuitionComparisonQuerySchema,
  tuitionComparisonResponseSchema,
  tuitionDeleteResponseSchema,
  tuitionErrorSchema,
  tuitionListResponseSchema,
  tuitionParamsSchema,
  tuitionQuerySchema,
  tuitionResponseSchema,
  updateTuitionSchema,
} from "@schemas/tuition";

const app = new OpenAPIHono();

// Get all tuition fees route (public)
const getTuitionRoute = createRoute({
  method: "get",
  path: "/api/v1/tuition",
  summary: "Get tuition fees",
  description:
    "Retrieve tuition fees with filtering support. Supports pagination and filtering by program code, campus code, and year.",
  tags: ["Tuition"],
  request: {
    query: tuitionQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: tuitionListResponseSchema,
        },
      },
      description: "Paginated list of tuition fees with metadata",
    },
  },
});

// Get tuition by ID route (public)
const getTuitionByIdRoute = createRoute({
  method: "get",
  path: "/api/v1/tuition/{id}",
  summary: "Get tuition by ID",
  description: "Retrieve a specific tuition record by ID",
  tags: ["Tuition"],
  request: {
    params: tuitionParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: tuitionResponseSchema,
        },
      },
      description: "Tuition details",
    },
    404: {
      content: {
        "application/json": {
          schema: tuitionErrorSchema,
        },
      },
      description: "Tuition record not found",
    },
  },
});

// Get tuition comparison route (public)
const getTuitionComparisonRoute = createRoute({
  method: "get",
  path: "/api/v1/tuition/comparison",
  summary: "Compare tuition across campuses",
  description:
    "Get tuition comparison data across different campuses for programs. Useful for comparing costs between locations.",
  tags: ["Tuition"],
  request: {
    query: tuitionComparisonQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: tuitionComparisonResponseSchema,
        },
      },
      description: "Tuition comparison data across campuses",
    },
  },
});

// Calculate total program cost route (public)
const calculateTuitionCostRoute = createRoute({
  method: "get",
  path: "/api/v1/tuition/calculate",
  summary: "Calculate total program cost",
  description:
    "Calculate the total cost of a program including tuition fees and preparation fees (orientation and English preparation if needed).",
  tags: ["Tuition"],
  request: {
    query: tuitionCalculateSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: tuitionCalculationResponseSchema,
        },
      },
      description: "Total program cost calculation with breakdown",
    },
    400: {
      content: {
        "application/json": {
          schema: tuitionErrorSchema,
        },
      },
      description: "Invalid request parameters",
    },
    404: {
      content: {
        "application/json": {
          schema: tuitionErrorSchema,
        },
      },
      description: "Program or campus not found",
    },
  },
});

// Get campus tuition summary route (public)
const getCampusTuitionRoute = createRoute({
  method: "get",
  path: "/api/v1/tuition/campus/{campus_code}",
  summary: "Get campus tuition summary",
  description:
    "Get comprehensive tuition summary for a specific campus including all available programs and statistics.",
  tags: ["Tuition"],
  request: {
    params: campusTuitionQuerySchema.pick({ campus_code: true }),
    query: campusTuitionQuerySchema.omit({ campus_code: true }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: campusTuitionResponseSchema,
        },
      },
      description: "Campus tuition summary with programs and statistics",
    },
    404: {
      content: {
        "application/json": {
          schema: tuitionErrorSchema,
        },
      },
      description: "Campus not found or no tuition data available",
    },
  },
});

// Create tuition route (admin only)
const createTuitionRoute = createRoute({
  method: "post",
  path: "/api/v1/tuition",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Create tuition record",
  description: "Create a new tuition record for a program and campus",
  tags: ["Tuition"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createTuitionSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: tuitionResponseSchema,
        },
      },
      description: "Tuition record created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: tuitionErrorSchema,
        },
      },
      description: "Invalid request data",
    },
    409: {
      content: {
        "application/json": {
          schema: tuitionErrorSchema,
        },
      },
      description: "Tuition already exists for this program and campus",
    },
    500: {
      content: {
        "application/json": {
          schema: tuitionErrorSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Update tuition route (admin only)
const updateTuitionRoute = createRoute({
  method: "put",
  path: "/api/v1/tuition/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Update tuition record",
  description: "Update an existing tuition record",
  tags: ["Tuition"],
  request: {
    params: tuitionParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateTuitionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: tuitionResponseSchema,
        },
      },
      description: "Tuition record updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: tuitionErrorSchema,
        },
      },
      description: "Invalid request data",
    },
    404: {
      content: {
        "application/json": {
          schema: tuitionErrorSchema,
        },
      },
      description: "Tuition record not found",
    },
  },
});

// Delete tuition route (admin only)
const deleteTuitionRoute = createRoute({
  method: "delete",
  path: "/api/v1/tuition/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Delete tuition record",
  description: "Soft delete a tuition record (admin only)",
  tags: ["Tuition"],
  request: {
    params: tuitionParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: tuitionDeleteResponseSchema,
        },
      },
      description: "Tuition record deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: tuitionErrorSchema,
        },
      },
      description: "Tuition record not found",
    },
  },
});

// Register routes (order matters - specific routes before parameterized ones)
app.openapi(getTuitionRoute, getTuitionHandler);
app.openapi(getTuitionComparisonRoute, getTuitionComparisonHandler);
app.openapi(calculateTuitionCostRoute, calculateTuitionCostHandler);
app.openapi(getCampusTuitionRoute, getCampusTuitionHandler);
app.openapi(getTuitionByIdRoute, getTuitionByIdHandler);

// Protected routes (admin only) - middleware defined in route definitions
app.openapi(createTuitionRoute, createTuitionHandler);
app.openapi(updateTuitionRoute, updateTuitionHandler);
app.openapi(deleteTuitionRoute, deleteTuitionHandler);

export default app;
