import { USER_ROLES } from "@config/auth";
import { z } from "@hono/zod-openapi";

/**
 * Login request schema
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Register request schema
 */
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    ),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
  role: z
    .enum([
      USER_ROLES.STUDENT,
      USER_ROLES.ADMIN,
      USER_ROLES.STAFF,
      USER_ROLES.SUPER_ADMIN,
    ])
    .optional()
    .default(USER_ROLES.STUDENT),
});

/**
 * User public response schema
 */
export const userPublicSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum([
    USER_ROLES.STUDENT,
    USER_ROLES.ADMIN,
    USER_ROLES.STAFF,
    USER_ROLES.SUPER_ADMIN,
  ]),
  last_login_at: z.string().datetime().optional(),
});

/**
 * Login response schema
 */
export const loginResponseSchema = z.object({
  data: z.object({
    user: userPublicSchema,
    token: z.string(),
  }),
});

/**
 * Register response schema
 */
export const registerResponseSchema = z.object({
  data: userPublicSchema,
});

/**
 * Profile response schema
 */
export const profileResponseSchema = z.object({
  data: userPublicSchema,
});

/**
 * Logout response schema
 */
export const logoutResponseSchema = z.object({
  message: z.string(),
});

/**
 * Refresh token response schema
 */
export const refreshTokenResponseSchema = z.object({
  data: z.object({
    token: z.string(),
  }),
});

/**
 * Error response schema
 */
export const authErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.string()).optional(),
  }),
});

/**
 * Common auth headers schema
 */
export const authHeadersSchema = z.object({
  authorization: z.string().optional(),
});

/**
 * Type exports for use in handlers
 */
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type UserPublicResponse = z.infer<typeof userPublicSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
export type AuthError = z.infer<typeof authErrorSchema>;
