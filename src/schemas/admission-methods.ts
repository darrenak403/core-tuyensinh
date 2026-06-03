/**
 * Admission Method validation schemas
 */

import { z } from "zod";

// Base admission method schema matching the database entity
export const admissionMethodSchema = z.object({
  id: z.string().uuid(),
  method_code: z.string().min(1).max(10),
  name: z.string().min(1).max(255),
  requirements: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  year: z.coerce.number().int().min(2020).max(2030),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date(),
});

// Schema for public-facing data
export const admissionMethodPublicSchema = admissionMethodSchema.pick({
  id: true,
  method_code: true,
  name: true,
  requirements: true,
  notes: true,
  year: true,
  is_active: true,
});

// Schema for creating a new admission method
export const createAdmissionMethodSchema = admissionMethodSchema.pick({
  method_code: true,
  name: true,
  requirements: true,
  notes: true,
  year: true,
});

// Schema for updating an existing admission method
export const updateAdmissionMethodSchema = admissionMethodSchema
  .pick({
    method_code: true,
    name: true,
    requirements: true,
    notes: true,
    year: true,
    is_active: true,
  })
  .partial();

// Schema for query parameters
export const admissionMethodQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2030).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// Schema for URL parameters
export const admissionMethodParamsSchema = z.object({
  id: z.string().uuid("Invalid admission method ID format"),
});

// Response schemas
export const admissionMethodResponseSchema = z.object({
  data: admissionMethodPublicSchema,
});

export const admissionMethodListResponseSchema = z.object({
  data: z.array(admissionMethodPublicSchema),
  meta: z.object({
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
    has_next: z.boolean(),
    has_prev: z.boolean(),
  }),
});

export const admissionMethodDeleteResponseSchema = z.object({
  message: z.string(),
});

// Error schema
export const admissionMethodErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.any().optional(),
});
