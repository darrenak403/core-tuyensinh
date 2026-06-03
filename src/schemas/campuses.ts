/**
 * Campus validation schemas
 */

import { z } from "zod";

// Preparation fee schema
export const preparationFeeSchema = z.object({
  year: z.number().int(),
  orientation: z.object({
    fee: z.number(),
    is_mandatory: z.boolean(),
    max_periods: z.number().int(),
    description: z.string().optional(),
  }),
  english_prep: z.object({
    fee: z.number(),
    is_mandatory: z.boolean(),
    max_periods: z.number().int(),
    description: z.string().optional(),
  }),
});

// Available programs schema
export const availableProgramsSchema = z.object({
  count: z.number().int(),
  codes: z.array(z.string()),
});

// Base campus schema
export const campusSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional(),
  discount_percentage: z.number().min(0).max(100).default(0),
});

// Public campus response schema
export const campusPublicSchema = campusSchema.extend({
  preparation_fees: preparationFeeSchema.optional(),
  available_programs: availableProgramsSchema.optional(),
});

// Create campus request body schema
export const createCampusBodySchema = z.object({
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional(),
  discount_percentage: z.number().min(0).max(100).default(0),
});

// Update campus request body schema
export const updateCampusBodySchema = z.object({
  code: z.string().min(1).max(10).optional(),
  name: z.string().min(1).max(255).optional(),
  city: z.string().min(1).max(100).optional(),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
  is_active: z.boolean().optional(),
});

// Campus params schema
export const campusParamsSchema = z.object({
  id: z.string().uuid(),
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
export const campusesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(100).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
  year: z.coerce.number().int().min(2020).max(2030).default(2025).optional(),
});

// Response schemas
export const campusResponseSchema = z.object({
  data: campusPublicSchema,
});

export const campusesResponseSchema = z.object({
  data: z.array(campusPublicSchema),
  meta: paginationMetaSchema,
});

// Delete response schema
export const campusDeleteResponseSchema = z.object({
  message: z.string(),
});

// Campus summary response schema
export const campusSummaryResponseSchema = z.object({
  data: z.object({
    total_campuses: z.number(),
    avg_discount: z.number(),
    campuses_with_discount: z.number(),
    total_available_programs: z.number(),
    foundation_fees_configured: z.number(),
  }),
});

// Error schema
export const campusErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});
