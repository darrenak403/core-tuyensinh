import { env } from "@config/env";

/**
 * JWT Configuration
 */
export const JWT_CONFIG = {
  secret: env.JWT_SECRET,
  cookieName: "auth_token",
  expiresIn: 24 * 60 * 60, // 24 hours in seconds
  refreshExpiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

/**
 * JWT Payload interface extending Hono's JWTPayload
 */
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat?: number; // Issued at
  exp?: number; // Expires at
  [key: string]: any; // Index signature for Hono compatibility
}

/**
 * User roles enum
 */
export const USER_ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
  STAFF: "staff",
  SUPER_ADMIN: "super_admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Auth-related constants
 */
export const AUTH_CONSTANTS = {
  BEARER_PREFIX: "Bearer ",
  PASSWORD_MIN_LENGTH: 8,
  TOKEN_TYPE: "JWT",
} as const;
