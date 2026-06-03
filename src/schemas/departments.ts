/**
 * Department validation schemas
 */

import { z } from "zod";

// Base department schema
export const departmentSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  name_en: z.string().max(100).optional(),
  description: z.string().optional(),
});

// Public department response schema
export const departmentPublicSchema = departmentSchema.pick({
  id: true,
  code: true,
  name: true,
  name_en: true,
  description: true,
});

// Create department request schema
export const createDepartmentSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(10, "Code must be at most 10 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  name_en: z
    .string()
    .max(100, "English name must be at most 100 characters")
    .optional(),
  description: z.string().optional(),
});

// Update department request schema
export const updateDepartmentSchema = z.object({
  code: z.string().min(1).max(10).optional(),
  name: z.string().min(1).max(100).optional(),
  name_en: z.string().max(100).optional(),
  description: z.string().optional(),
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

// Query parameters schema for pagination
export const departmentsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(100).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

// Response schemas
export const departmentResponseSchema = z.object({
  data: departmentPublicSchema,
});

export const departmentsResponseSchema = z.object({
  data: z.array(departmentPublicSchema),
  meta: paginationMetaSchema,
});

// Error schema
export const departmentErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

// Path parameters
export const departmentParamsSchema = z.object({
  id: z.string().uuid("Invalid department ID format"),
});

// Delete response schema
export const departmentDeleteResponseSchema = z.object({
  message: z.string(),
});
