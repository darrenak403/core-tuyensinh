import { JWT_CONFIG } from "@config/auth";
import { AuthService } from "@services/auth/auth.service";
import {
  AUDIT_EVENTS,
  logAuthFailure,
  logAuthSuccess,
} from "@utils/audit.logger";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

// Create auth service instance
const authService = new AuthService();

/**
 * Register a new user
 */
export const registerHandler = async (c: Context) => {
  const data = await c.req.json();

  try {
    const user = await authService.register(data);

    // Log successful registration
    logAuthSuccess(c, AUDIT_EVENTS.USER_REGISTERED, user.id, user.email);

    return c.json(
      {
        data: user,
      },
      201
    );
  } catch (error) {
    // Log failed registration
    logAuthFailure(c, AUDIT_EVENTS.USER_REGISTERED, data.email, {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Internal server error during registration",
    });
  }
};

/**
 * Login user and set auth cookie
 */
export const loginHandler = async (c: Context) => {
  const { email, password } = await c.req.json();

  try {
    const result = await authService.login(email, password);

    if (!result) {
      throw new HTTPException(401, {
        message: "Invalid email or password",
      });
    }

    // Set HTTP-only cookie for web clients
    setCookie(c, JWT_CONFIG.cookieName, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: JWT_CONFIG.expiresIn,
      path: "/",
    });

    return c.json(
      {
        data: {
          user: result.user,
          token: result.token,
        },
      },
      200
    );
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Internal server error during login",
    });
  }
};

/**
 * Logout user and clear auth cookie
 */
export const logoutHandler = async (c: Context) => {
  // Clear the auth cookie
  deleteCookie(c, JWT_CONFIG.cookieName, {
    path: "/",
  });

  return c.json(
    {
      message: "Logged out successfully",
    },
    200
  );
};

/**
 * Get current user profile
 */
export const profileHandler = async (c: Context) => {
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Authentication required",
    });
  }

  try {
    const profile = await authService.getProfile(user.id);

    if (!profile) {
      throw new HTTPException(404, {
        message: "User profile not found",
      });
    }

    return c.json(
      {
        data: profile,
      },
      200
    );
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Internal server error while fetching profile",
    });
  }
};

/**
 * Refresh JWT token
 */
export const refreshHandler = async (c: Context) => {
  const authHeader = c.req.header("Authorization");
  const oldToken =
    authHeader?.replace("Bearer ", "") || getCookie(c, JWT_CONFIG.cookieName);

  if (!oldToken) {
    throw new HTTPException(401, {
      message: "No token provided for refresh",
    });
  }

  try {
    const newToken = await authService.refreshToken(oldToken);

    if (!newToken) {
      throw new HTTPException(401, {
        message: "Invalid or expired token",
      });
    }

    // Set new cookie
    setCookie(c, JWT_CONFIG.cookieName, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: JWT_CONFIG.expiresIn,
      path: "/",
    });

    return c.json(
      {
        data: {
          token: newToken,
        },
      },
      200
    );
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Internal server error during token refresh",
    });
  }
};
