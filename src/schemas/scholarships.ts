/**
 * Scholarship validation schemas
 */

import { z } from "zod";

// Base scholarship schema matching the database entity
export const scholarshipSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(50),
  recipients: z.coerce.number().int().positive().optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
  requirements: z.string().optional(),
  year: z.coerce.number().int().min(2020).max(2030),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date(),
});

// Schema for public-facing scholarship data
export const scholarshipPublicSchema = scholarshipSchema.pick({
  id: true,
  code: true,
  name: true,
  type: true,
  recipients: true,
  percentage: true,
  requirements: true,
  year: true,
  notes: true,
  is_active: true,
  created_at: true,
  updated_at: true,
});

// Schema for creating a new scholarship
export const createScholarshipSchema = scholarshipSchema.pick({
  code: true,
  name: true,
  type: true,
  recipients: true,
  percentage: true,
  requirements: true,
  year: true,
  notes: true,
});

// Schema for updating an existing scholarship
export const updateScholarshipSchema = scholarshipSchema
  .pick({
    code: true,
    name: true,
    type: true,
    recipients: true,
    percentage: true,
    requirements: true,
    year: true,
    notes: true,
    is_active: true,
  })
  .partial();

// Schema for query parameters
export const scholarshipQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2030).optional(),
  type: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// Schema for URL parameters (e.g., /api/v1/scholarships/{id})
export const scholarshipParamsSchema = z.object({
  id: z.string().uuid("Invalid scholarship ID format"),
});

// Response schemas
export const scholarshipResponseSchema = z.object({
  data: scholarshipPublicSchema,
});

export const scholarshipListResponseSchema = z.object({
  data: z.array(scholarshipPublicSchema),
  meta: z.object({
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
    has_next: z.boolean(),
    has_prev: z.boolean(),
  }),
});

export const scholarshipDeleteResponseSchema = z.object({
  message: z.string(),
});

// Error schema
export const scholarshipErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.any().optional(),
});
