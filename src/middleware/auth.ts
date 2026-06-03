import type { AuthUser } from "@app-types/auth";
import { AUTH_CONSTANTS, JWT_CONFIG, type UserRole } from "@config/auth";
import { AuthService } from "@services/auth/auth.service";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

// Create auth service instance
const authService = new AuthService();

/**
 * Authentication middleware - requires valid JWT token
 */
export const authMiddleware = createMiddleware<{
  Variables: {
    user: AuthUser;
  };
}>(async (c, next) => {
  // Get token from Authorization header or cookie
  const authHeader = c.req.header("Authorization");
  const token =
    authHeader?.replace(AUTH_CONSTANTS.BEARER_PREFIX, "") ||
    getCookie(c, JWT_CONFIG.cookieName);

  if (!token) {
    throw new HTTPException(401, {
      message: "Authentication required. Please provide a valid token.",
    });
  }

  // Verify token
  const verification = await authService.verifyToken(token);

  if (!verification.valid || !verification.payload) {
    throw new HTTPException(401, {
      message: verification.error || "Invalid or expired token",
    });
  }

  // Set user in context
  c.set("user", verification.payload);

  await next();
});

/**
 * Role-based authorization middleware
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return createMiddleware<{
    Variables: {
      user: AuthUser;
    };
  }>(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      throw new HTTPException(401, {
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      throw new HTTPException(403, {
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    await next();
  });
};

/**
 * Optional authentication middleware - doesn't throw if no token
 */
export const optionalAuth = createMiddleware<{
  Variables: {
    user?: AuthUser;
  };
}>(async (c, next) => {
  // Get token from Authorization header or cookie
  const authHeader = c.req.header("Authorization");
  const token =
    authHeader?.replace(AUTH_CONSTANTS.BEARER_PREFIX, "") ||
    getCookie(c, JWT_CONFIG.cookieName);

  if (token) {
    // Verify token if present
    const verification = await authService.verifyToken(token);

    if (verification.valid && verification.payload) {
      c.set("user", verification.payload);
    }
  }

  await next();
});

/**
 * Admin-only middleware (admin, staff, super_admin)
 */
export const requireAdmin = requireRole("admin", "staff", "super_admin");

/**
 * Super admin only middleware
 */
export const requireSuperAdmin = requireRole("super_admin");

/**
 * Student-only middleware
 */
export const requireStudent = requireRole("student");
