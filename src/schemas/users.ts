/**
 * User validation schemas
 */

import { UserRole } from "@app-types/users";
import { z } from "zod";

// Base user schema matching the database entity
export const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password_hash: z.string(),
  role: z.nativeEnum(UserRole),
  is_active: z.boolean().default(true),
  last_login_at: z.date().nullable().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Schema for public-facing user data (omits password_hash)
export const userPublicSchema = userSchema.omit({
  password_hash: true,
});

// Schema for creating a new user (admin action)
export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(UserRole).default(UserRole.STAFF),
});

// Schema for updating an existing user (admin action)
export const updateUserSchema = z
  .object({
    username: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    role: z.nativeEnum(UserRole).optional(),
    is_active: z.boolean().optional(),
  })
  .partial();

// Schema for query parameters
export const userQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  is_active: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// Schema for URL parameters
export const userParamsSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

// Response schemas
export const userResponseSchema = z.object({
  data: userPublicSchema,
});

export const userListResponseSchema = z.object({
  data: z.array(userPublicSchema),
  meta: z.object({
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
    has_next: z.boolean(),
    has_prev: z.boolean(),
  }),
});

export const userDeleteResponseSchema = z.object({
  message: z.string(),
});

// Error schema
export const userErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.any().optional(),
});
