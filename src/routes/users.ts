/**
 * Users routes - API endpoints for user management
 */

import {
  createUserHandler,
  deleteUserHandler,
  getUserByIdHandler,
  getUsersHandler,
  updateUserHandler,
} from "@handlers/users.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  createUserSchema,
  updateUserSchema,
  userDeleteResponseSchema,
  userErrorSchema,
  userListResponseSchema,
  userParamsSchema,
  userQuerySchema,
  userResponseSchema,
} from "@schemas/users";

const app = new OpenAPIHono();

// Get all users route
const getUsersRoute = createRoute({
  method: "get",
  path: "/api/v1/users",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Get all users",
  description: "Retrieve all users with filtering support.",
  tags: ["Users"],
  request: {
    query: userQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: userListResponseSchema,
        },
      },
      description: "A paginated list of users",
    },
  },
});

// Get user by ID route
const getUserByIdRoute = createRoute({
  method: "get",
  path: "/api/v1/users/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Get a single user by ID",
  description: "Retrieve a specific user by their unique ID.",
  tags: ["Users"],
  request: {
    params: userParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: userResponseSchema,
        },
      },
      description: "Details of the user",
    },
    404: {
      content: {
        "application/json": {
          schema: userErrorSchema,
        },
      },
      description: "User not found",
    },
  },
});

// Create user route
const createUserRoute = createRoute({
  method: "post",
  path: "/api/v1/users",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Create a new user",
  description: "Create a new user record.",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: userResponseSchema,
        },
      },
      description: "User created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: userErrorSchema,
        },
      },
      description: "Invalid request data",
    },
    409: {
      content: {
        "application/json": {
          schema: userErrorSchema,
        },
      },
      description: "User with this username or email already exists",
    },
  },
});

// Update user route
const updateUserRoute = createRoute({
  method: "put",
  path: "/api/v1/users/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Update an existing user",
  description: "Update an existing user record.",
  tags: ["Users"],
  request: {
    params: userParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: userResponseSchema,
        },
      },
      description: "User updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: userErrorSchema,
        },
      },
      description: "Invalid request data",
    },
    404: {
      content: {
        "application/json": {
          schema: userErrorSchema,
        },
      },
      description: "User not found",
    },
  },
});

// Delete user route
const deleteUserRoute = createRoute({
  method: "delete",
  path: "/api/v1/users/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Delete a user",
  description: "Soft delete a user record by their ID.",
  tags: ["Users"],
  request: {
    params: userParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: userDeleteResponseSchema,
        },
      },
      description: "User deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: userErrorSchema,
        },
      },
      description: "User not found",
    },
    500: {
      content: {
        "application/json": {
          schema: userErrorSchema,
        },
      },
      description: "Internal Server Error",
    },
  },
});

// Register routes
app.openapi(getUsersRoute, getUsersHandler);
app.openapi(getUserByIdRoute, getUserByIdHandler);
app.openapi(createUserRoute, createUserHandler);
app.openapi(updateUserRoute, updateUserHandler);
app.openapi(deleteUserRoute, deleteUserHandler);

export default app;
