/**
 * Program routes - API endpoints for program operations
 */

import {
  createProgramHandler,
  deleteProgramHandler,
  getProgramHandler,
  getProgramsHandler,
  updateProgramHandler,
} from "@handlers/programs.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  createProgramSchema,
  programDeleteResponseSchema,
  programErrorSchema,
  programParamsSchema,
  programResponseSchema,
  programsQuerySchema,
  programsResponseSchema,
  updateProgramSchema,
} from "@schemas/programs";

const app = new OpenAPIHono();

// Get all programs route (public)
const getProgramsRoute = createRoute({
  method: "get",
  path: "/api/v1/programs",
  summary: "Get all programs",
  description:
    "Retrieve all active programs with department information. Supports pagination and optional filtering by department code.",
  tags: ["Programs"],
  request: {
    query: programsQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: programsResponseSchema,
        },
      },
      description:
        "Paginated list of programs with department information and metadata",
    },
  },
});

// Get program by ID route (public)
const getProgramRoute = createRoute({
  method: "get",
  path: "/api/v1/programs/{id}",
  summary: "Get program by ID",
  description: "Retrieve a specific program by ID with department information",
  tags: ["Programs"],
  request: {
    params: programParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: programResponseSchema,
        },
      },
      description: "Program details with department information",
    },
    404: {
      content: {
        "application/json": {
          schema: programErrorSchema,
        },
      },
      description: "Program not found",
    },
  },
});

// Create program route (admin only)
const createProgramRoute = createRoute({
  method: "post",
  path: "/api/v1/programs",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Create program",
  description: "Create a new program",
  tags: ["Programs"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createProgramSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: programResponseSchema,
        },
      },
      description: "Program created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: programErrorSchema,
        },
      },
      description: "Invalid request data or department not found",
    },
    409: {
      content: {
        "application/json": {
          schema: programErrorSchema,
        },
      },
      description: "Program with code already exists",
    },
  },
});

// Update program route (admin only)
const updateProgramRoute = createRoute({
  method: "put",
  path: "/api/v1/programs/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Update program",
  description: "Update an existing program",
  tags: ["Programs"],
  request: {
    params: programParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateProgramSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: programResponseSchema,
        },
      },
      description: "Program updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: programErrorSchema,
        },
      },
      description: "Invalid request data or department not found",
    },
    404: {
      content: {
        "application/json": {
          schema: programErrorSchema,
        },
      },
      description: "Program not found",
    },
    409: {
      content: {
        "application/json": {
          schema: programErrorSchema,
        },
      },
      description: "Program with code already exists",
    },
  },
});

// Delete program route (admin only)
const deleteProgramRoute = createRoute({
  method: "delete",
  path: "/api/v1/programs/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Delete program",
  description: "Soft delete a program (admin only)",
  tags: ["Programs"],
  request: {
    params: programParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: programDeleteResponseSchema,
        },
      },
      description: "Program deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: programErrorSchema,
        },
      },
      description: "Program not found",
    },
  },
});

// Public routes
app.openapi(getProgramsRoute, getProgramsHandler);
app.openapi(getProgramRoute, getProgramHandler);

// Protected routes (admin only) - middleware defined in route definitions
app.openapi(createProgramRoute, createProgramHandler);
app.openapi(updateProgramRoute, updateProgramHandler);
app.openapi(deleteProgramRoute, deleteProgramHandler);

export default app;
