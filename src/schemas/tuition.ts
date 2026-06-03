/**
 * Tuition validation schemas
 */

import { z } from "zod";

// Base tuition schema
export const tuitionSchema = z.object({
  id: z.string().uuid(),
  program_id: z.string().uuid(),
  campus_id: z.string().uuid(),
  year: z.number().int().min(2020).max(2030),
  semester_group_1_3_fee: z.number().positive(),
  semester_group_4_6_fee: z.number().positive(),
  semester_group_7_9_fee: z.number().positive(),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date(),
});

// Public tuition summary schema (from v_tuition_summary view)
export const tuitionSummarySchema = z.object({
  id: z.string().uuid(),
  year: z.number().int(),
  program_id: z.string().uuid(),
  program_code: z.string(),
  program_name: z.string(),
  program_name_en: z.string().optional(),
  department_id: z.string().uuid(),
  department_code: z.string(),
  department_name: z.string(),
  department_name_en: z.string().optional(),
  campus_id: z.string().uuid(),
  campus_code: z.string(),
  campus_name: z.string(),
  campus_city: z.string(),
  campus_discount: z.coerce.number().min(0).max(100),
  semester_group_1_3_fee: z.coerce.number().positive(),
  semester_group_4_6_fee: z.coerce.number().positive(),
  semester_group_7_9_fee: z.coerce.number().positive(),
  total_program_fee: z.coerce.number().positive(),
  min_semester_fee: z.coerce.number().positive(),
  max_semester_fee: z.coerce.number().positive(),
});

// Campus fee schema for comparison
export const campusFeeSchema = z.object({
  campus_code: z.string(),
  campus_name: z.string(),
  city: z.string(),
  discount_percentage: z.coerce.number().min(0).max(100),
  semester_1_3_fee: z.coerce.number().positive(),
  semester_4_6_fee: z.coerce.number().positive(),
  semester_7_9_fee: z.coerce.number().positive(),
  total_program_fee: z.coerce.number().positive(),
});

// Tuition comparison schema
export const tuitionComparisonSchema = z.object({
  program_code: z.string(),
  program_name: z.string(),
  department_name: z.string(),
  year: z.number().int(),
  campus_fees: z.array(campusFeeSchema),
  min_semester_fee: z.coerce.number().positive(),
  max_semester_fee: z.coerce.number().positive(),
  min_total_fee: z.coerce.number().positive(),
  max_total_fee: z.coerce.number().positive(),
});

// Program fee schema for campus summary
export const programFeeSchema = z.object({
  program_code: z.string(),
  program_name: z.string(),
  department_name: z.string(),
  semester_1_3_fee: z.coerce.number().positive(),
  semester_4_6_fee: z.coerce.number().positive(),
  semester_7_9_fee: z.coerce.number().positive(),
});

// Campus tuition summary schema
export const campusTuitionSummarySchema = z.object({
  campus_id: z.string().uuid(),
  campus_code: z.string(),
  campus_name: z.string(),
  campus_city: z.string(),
  discount_percentage: z.coerce.number().min(0).max(100),
  year: z.coerce.number().int(),
  total_programs: z.coerce.number().int().min(0),
  total_departments: z.coerce.number().int().min(0),
  min_semester_fee: z.coerce.number().positive(),
  max_semester_fee: z.coerce.number().positive(),
  avg_semester_1_3_fee: z.coerce.number().positive(),
  avg_semester_4_6_fee: z.coerce.number().positive(),
  avg_semester_7_9_fee: z.coerce.number().positive(),
  programs: z.array(programFeeSchema),
});

// Cost breakdown schema
export const costBreakdownSchema = z.object({
  tuition_total: z.coerce.number().min(0),
  orientation_fee: z.coerce.number().min(0),
  english_prep_fee: z.coerce.number().min(0),
  english_periods: z.coerce.number().int().min(0).max(6),
  has_ielts_exemption: z.boolean(),
});

// Tuition calculation schema
export const tuitionCalculationSchema = z.object({
  program_fee: z.coerce.number().positive(),
  preparation_fees: z.coerce.number().min(0),
  total_cost: z.coerce.number().positive(),
  cost_breakdown: costBreakdownSchema,
});

// Query parameters schemas
export const tuitionQuerySchema = z.object({
  program_code: z.string().optional(),
  campus_code: z.string().optional(),
  year: z.coerce.number().int().min(2020).max(2030).default(2025),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const tuitionCalculateSchema = z.object({
  program_code: z.string().min(1, "Program code is required"),
  campus_code: z.string().min(1, "Campus code is required"),
  has_ielts: z.coerce.boolean().default(false),
  year: z.coerce.number().int().min(2020).max(2030).default(2025),
});

export const tuitionComparisonQuerySchema = z.object({
  program_code: z.string().optional(),
  year: z.coerce.number().int().min(2020).max(2030).default(2025),
});

export const campusTuitionQuerySchema = z.object({
  campus_code: z.string().min(1, "Campus code is required"),
  year: z.coerce.number().int().min(2020).max(2030).default(2025),
});

// Request schemas
export const createTuitionSchema = z.object({
  program_id: z.string().uuid("Invalid program ID format"),
  campus_id: z.string().uuid("Invalid campus ID format"),
  year: z.number().int().min(2020).max(2030),
  semester_group_1_3_fee: z
    .number()
    .positive("Semester 1-3 fee must be positive"),
  semester_group_4_6_fee: z
    .number()
    .positive("Semester 4-6 fee must be positive"),
  semester_group_7_9_fee: z
    .number()
    .positive("Semester 7-9 fee must be positive"),
});

export const updateTuitionSchema = z.object({
  program_id: z.string().uuid().optional(),
  campus_id: z.string().uuid().optional(),
  year: z.number().int().min(2020).max(2030).optional(),
  semester_group_1_3_fee: z.number().positive().optional(),
  semester_group_4_6_fee: z.number().positive().optional(),
  semester_group_7_9_fee: z.number().positive().optional(),
  is_active: z.boolean().optional(),
});

// Parameter schemas
export const tuitionParamsSchema = z.object({
  id: z.string().uuid("Invalid tuition ID format"),
});

// Response schemas
export const tuitionResponseSchema = z.object({
  data: tuitionSummarySchema,
});

export const tuitionListResponseSchema = z.object({
  data: z.array(tuitionSummarySchema),
  meta: z.object({
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
    has_next: z.boolean(),
    has_prev: z.boolean(),
  }),
});

export const tuitionComparisonResponseSchema = z.object({
  data: z.array(tuitionComparisonSchema),
});

export const tuitionCalculationResponseSchema = z.object({
  data: tuitionCalculationSchema,
});

export const campusTuitionResponseSchema = z.object({
  data: campusTuitionSummarySchema,
});

export const tuitionDeleteResponseSchema = z.object({
  message: z.string(),
});

// Error schema
export const tuitionErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.any().optional(),
});
