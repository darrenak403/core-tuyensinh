import {
  loginHandler,
  logoutHandler,
  profileHandler,
  refreshHandler,
  registerHandler,
} from "@handlers/auth/auth.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware } from "@middleware/auth";
import {
  loginRateLimit,
  registerRateLimit,
} from "@middleware/rate-limiter.middleware";
import {
  authErrorSchema,
  loginResponseSchema,
  loginSchema,
  logoutResponseSchema,
  profileResponseSchema,
  refreshTokenResponseSchema,
  registerResponseSchema,
  registerSchema,
} from "@schemas/auth/auth";

const app = new OpenAPIHono();

/**
 * Register route
 */
const registerRoute = createRoute({
  method: "post",
  path: "/api/v1/auth/register",
  tags: ["Authentication"],
  summary: "Register a new user",
  description: "Create a new user account with username, email, and password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: registerResponseSchema,
        },
      },
      description: "User registered successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
      description: "Validation error or weak password",
    },
    409: {
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
      description: "User already exists",
    },
  },
});

/**
 * Login route
 */
const loginRoute = createRoute({
  method: "post",
  path: "/api/v1/auth/login",
  tags: ["Authentication"],
  summary: "Login user",
  description:
    "Authenticate user with email and password, returns JWT token and sets HTTP-only cookie",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: loginResponseSchema,
        },
      },
      description: "Login successful",
    },
    401: {
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
      description: "Invalid credentials",
    },
  },
});

/**
 * Logout route
 */
const logoutRoute = createRoute({
  method: "post",
  path: "/api/v1/auth/logout",
  tags: ["Authentication"],
  summary: "Logout user",
  description: "Clear authentication cookie and invalidate session",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: logoutResponseSchema,
        },
      },
      description: "Logout successful",
    },
  },
});

/**
 * Profile route
 */
const profileRoute = createRoute({
  method: "get",
  path: "/api/v1/auth/profile",
  tags: ["Authentication"],
  summary: "Get user profile",
  description: "Get current authenticated user's profile information",
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: profileResponseSchema,
        },
      },
      description: "Profile retrieved successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
      description: "Authentication required",
    },
    404: {
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
      description: "User not found",
    },
  },
});

/**
 * Refresh token route
 */
const refreshRoute = createRoute({
  method: "post",
  path: "/api/v1/auth/refresh",
  tags: ["Authentication"],
  summary: "Refresh JWT token",
  description: "Generate a new JWT token using the current valid token",
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: refreshTokenResponseSchema,
        },
      },
      description: "Token refreshed successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
      description: "Invalid or expired token",
    },
  },
});

// Register routes with rate limiting
app.use("/api/v1/auth/register", registerRateLimit);
app.openapi(registerRoute, registerHandler);

app.use("/api/v1/auth/login", loginRateLimit);
app.openapi(loginRoute, loginHandler);

app.openapi(logoutRoute, logoutHandler);

// Protected routes
app.use("/api/v1/auth/profile", authMiddleware);
app.openapi(profileRoute, profileHandler);

app.use("/api/v1/auth/refresh", authMiddleware);
app.openapi(refreshRoute, refreshHandler);

export default app;
