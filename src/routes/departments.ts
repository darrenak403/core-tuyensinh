/**
 * Department routes - API endpoints for department operations
 */

import {
  createDepartmentHandler,
  deleteDepartmentHandler,
  getDepartmentHandler,
  getDepartmentsHandler,
  updateDepartmentHandler,
} from "@handlers/departments.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  createDepartmentSchema,
  departmentDeleteResponseSchema,
  departmentErrorSchema,
  departmentParamsSchema,
  departmentResponseSchema,
  departmentsQuerySchema,
  departmentsResponseSchema,
  updateDepartmentSchema,
} from "@schemas/departments";

const app = new OpenAPIHono();

// Get all departments route (public)
const getDepartmentsRoute = createRoute({
  method: "get",
  path: "/api/v1/departments",
  summary: "Get all departments",
  description: "Retrieve all active departments with pagination support",
  tags: ["Departments"],
  request: {
    query: departmentsQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: departmentsResponseSchema,
        },
      },
      description: "Paginated list of departments with metadata",
    },
  },
});

// Get department by ID route (public)
const getDepartmentRoute = createRoute({
  method: "get",
  path: "/api/v1/departments/{id}",
  summary: "Get department by ID",
  description: "Retrieve a specific department by ID",
  tags: ["Departments"],
  request: {
    params: departmentParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: departmentResponseSchema,
        },
      },
      description: "Department details",
    },
    404: {
      content: {
        "application/json": {
          schema: departmentErrorSchema,
        },
      },
      description: "Department not found",
    },
  },
});

// Create department route (admin only)
const createDepartmentRoute = createRoute({
  method: "post",
  path: "/api/v1/departments",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Create department",
  description: "Create a new department",
  tags: ["Departments"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createDepartmentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: departmentResponseSchema,
        },
      },
      description: "Department created successfully",
    },
    409: {
      content: {
        "application/json": {
          schema: departmentErrorSchema,
        },
      },
      description: "Department with code already exists",
    },
  },
});

// Update department route (admin only)
const updateDepartmentRoute = createRoute({
  method: "put",
  path: "/api/v1/departments/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Update department",
  description: "Update an existing department",
  tags: ["Departments"],
  request: {
    params: departmentParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateDepartmentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: departmentResponseSchema,
        },
      },
      description: "Department updated successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: departmentErrorSchema,
        },
      },
      description: "Department not found",
    },
  },
});

// Delete department route (admin only)
const deleteDepartmentRoute = createRoute({
  method: "delete",
  path: "/api/v1/departments/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Delete department",
  description: "Soft delete a department (admin only)",
  tags: ["Departments"],
  request: {
    params: departmentParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: departmentDeleteResponseSchema,
        },
      },
      description: "Department deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: departmentErrorSchema,
        },
      },
      description: "Department not found",
    },
  },
});

// Public routes
app.openapi(getDepartmentsRoute, getDepartmentsHandler);
app.openapi(getDepartmentRoute, getDepartmentHandler);

// Protected routes (admin only) - middleware defined in route definitions
app.openapi(createDepartmentRoute, createDepartmentHandler);
app.openapi(updateDepartmentRoute, updateDepartmentHandler);
app.openapi(deleteDepartmentRoute, deleteDepartmentHandler);

export default app;
