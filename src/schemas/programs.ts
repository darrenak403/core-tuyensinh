/**
 * Program validation schemas
 */

import { z } from "zod";

// Department info schema for nested responses
export const departmentInfoSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  name_en: z.string().optional(),
});

// Base program schema
export const programSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  name_en: z.string().max(255).optional(),
  department_id: z.string().uuid(),
  duration_years: z.number().int().min(1).max(6),
});

// Public program response schema (with department info)
export const programPublicSchema = programSchema
  .pick({
    id: true,
    code: true,
    name: true,
    name_en: true,
    department_id: true,
    duration_years: true,
  })
  .extend({
    department: departmentInfoSchema,
  });

// Create program request schema
export const createProgramSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  name_en: z
    .string()
    .max(255, "English name must be at most 255 characters")
    .optional(),
  department_id: z.string().uuid("Invalid department ID format"),
  duration_years: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 year")
    .max(6, "Duration must be at most 6 years"),
});

// Update program request schema
export const updateProgramSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(255).optional(),
  name_en: z.string().max(255).optional(),
  department_id: z.string().uuid().optional(),
  duration_years: z.number().int().min(1).max(6).optional(),
  is_active: z.boolean().optional(),
});

// Pagination metadata schema
export const paginationMetaSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  has_next: z.boolean(),
  has_prev: z.boolean(),
});

// Query parameters schema for filtering and pagination
export const programsQuerySchema = z.object({
  department_code: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(100).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

// Response schemas
export const programResponseSchema = z.object({
  data: programPublicSchema,
});

export const programsResponseSchema = z.object({
  data: z.array(programPublicSchema),
  meta: paginationMetaSchema,
});

// Error schema
export const programErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

// Path parameters
export const programParamsSchema = z.object({
  id: z.string().uuid("Invalid program ID format"),
});

// Delete response schema
export const programDeleteResponseSchema = z.object({
  message: z.string(),
});
