/**
 * Admission Methods routes - API endpoints for admission method operations
 */

import {
  createAdmissionMethodHandler,
  deleteAdmissionMethodHandler,
  getAdmissionMethodByIdHandler,
  getAdmissionMethodsHandler,
  updateAdmissionMethodHandler,
} from "@handlers/admission-methods.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  admissionMethodDeleteResponseSchema,
  admissionMethodErrorSchema,
  admissionMethodListResponseSchema,
  admissionMethodParamsSchema,
  admissionMethodQuerySchema,
  admissionMethodResponseSchema,
  createAdmissionMethodSchema,
  updateAdmissionMethodSchema,
} from "@schemas/admission-methods";

const app = new OpenAPIHono();

// Get all admission methods route (public)
const getAdmissionMethodsRoute = createRoute({
  method: "get",
  path: "/api/v1/admission-methods",
  summary: "Get all admission methods",
  description:
    "Retrieve all admission methods with filtering support for year.",
  tags: ["Admission Methods"],
  request: {
    query: admissionMethodQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: admissionMethodListResponseSchema,
        },
      },
      description: "A paginated list of admission methods",
    },
  },
});

// Get admission method by ID route (public)
const getAdmissionMethodByIdRoute = createRoute({
  method: "get",
  path: "/api/v1/admission-methods/{id}",
  summary: "Get a single admission method by ID",
  description: "Retrieve a specific admission method by its unique ID.",
  tags: ["Admission Methods"],
  request: {
    params: admissionMethodParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: admissionMethodResponseSchema,
        },
      },
      description: "Details of the admission method",
    },
    404: {
      content: {
        "application/json": {
          schema: admissionMethodErrorSchema,
        },
      },
      description: "Admission method not found",
    },
  },
});

// Create admission method route (admin only)
const createAdmissionMethodRoute = createRoute({
  method: "post",
  path: "/api/v1/admission-methods",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Create a new admission method",
  description: "Create a new admission method record (admin access required).",
  tags: ["Admission Methods"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createAdmissionMethodSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: admissionMethodResponseSchema,
        },
      },
      description: "Admission method created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: admissionMethodErrorSchema,
        },
      },
      description: "Invalid request data",
    },
    409: {
      content: {
        "application/json": {
          schema: admissionMethodErrorSchema,
        },
      },
      description:
        "Admission method with this code already exists for the year",
    },
  },
});

// Update admission method route (admin only)
const updateAdmissionMethodRoute = createRoute({
  method: "put",
  path: "/api/v1/admission-methods/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Update an existing admission method",
  description:
    "Update an existing admission method record (admin access required).",
  tags: ["Admission Methods"],
  request: {
    params: admissionMethodParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateAdmissionMethodSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: admissionMethodResponseSchema,
        },
      },
      description: "Admission method updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: admissionMethodErrorSchema,
        },
      },
      description: "Invalid request data",
    },
    404: {
      content: {
        "application/json": {
          schema: admissionMethodErrorSchema,
        },
      },
      description: "Admission method not found",
    },
    409: {
      content: {
        "application/json": {
          schema: admissionMethodErrorSchema,
        },
      },
      description:
        "Admission method with this code already exists for the year",
    },
  },
});

// Delete admission method route (admin only)
const deleteAdmissionMethodRoute = createRoute({
  method: "delete",
  path: "/api/v1/admission-methods/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Delete an admission method",
  description:
    "Soft delete an admission method record by its ID (admin access required).",
  tags: ["Admission Methods"],
  request: {
    params: admissionMethodParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: admissionMethodDeleteResponseSchema,
        },
      },
      description: "Admission method deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: admissionMethodErrorSchema,
        },
      },
      description: "Admission method not found",
    },
    500: {
      content: {
        "application/json": {
          schema: admissionMethodErrorSchema,
        },
      },
      description: "Internal Server Error",
    },
  },
});

// Register routes
app.openapi(getAdmissionMethodsRoute, getAdmissionMethodsHandler);
app.openapi(getAdmissionMethodByIdRoute, getAdmissionMethodByIdHandler);
app.openapi(createAdmissionMethodRoute, createAdmissionMethodHandler);
app.openapi(updateAdmissionMethodRoute, updateAdmissionMethodHandler);
app.openapi(deleteAdmissionMethodRoute, deleteAdmissionMethodHandler);

export default app;
