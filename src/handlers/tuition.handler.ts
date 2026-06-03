/**
 * Tuition handlers - Request handlers for tuition operations
 */

import { db } from "@config/database";
import { TuitionService } from "@services/tuition.service";
import type { Context } from "hono";

// Create service instance
const tuitionService = new TuitionService();

/**
 * Get all tuition fees handler
 */
export const getTuitionHandler = async (c: Context) => {
  const program_code = c.req.query("program_code");
  const campus_code = c.req.query("campus_code");
  const year = Number(c.req.query("year")) || 2025;
  const limit = Number(c.req.query("limit")) || 50;
  const offset = Number(c.req.query("offset")) || 0;

  const result = await tuitionService.findAll({
    program_code,
    campus_code,
    year,
    limit,
    offset,
  });

  return c.json(result, 200);
};

/**
 * Get tuition by ID handler
 */
export const getTuitionByIdHandler = async (c: Context) => {
  const id = c.req.param("id");
  const tuition = await tuitionService.findById(id);

  if (!tuition) {
    return c.json(
      {
        error: "NOT_FOUND",
        message: "Tuition record not found",
      },
      404
    );
  }

  return c.json({ data: tuition }, 200);
};

/**
 * Get tuition comparison handler
 */
export const getTuitionComparisonHandler = async (c: Context) => {
  const program_code = c.req.query("program_code");
  const year = Number(c.req.query("year")) || 2025;

  const data = await tuitionService.getComparison({
    program_code,
    year,
  });

  return c.json({ data }, 200);
};

/**
 * Get campus tuition summary handler
 */
export const getCampusTuitionHandler = async (c: Context) => {
  const campus_code = c.req.param("campus_code");
  const year = Number(c.req.query("year")) || 2025;

  const data = await tuitionService.getCampusSummary({
    campus_code,
    year,
  });

  if (!data) {
    return c.json(
      {
        error: "NOT_FOUND",
        message: "Campus tuition data not found",
      },
      404
    );
  }

  return c.json({ data }, 200);
};

/**
 * Calculate total program cost handler
 */
export const calculateTuitionCostHandler = async (c: Context) => {
  const program_code = c.req.query("program_code");
  const campus_code = c.req.query("campus_code");
  const has_ielts = c.req.query("has_ielts") === "true";
  const year = Number(c.req.query("year")) || 2025;

  if (!program_code || !campus_code) {
    return c.json(
      {
        error: "VALIDATION_ERROR",
        message: "Program code and campus code are required",
      },
      400
    );
  }

  const data = await tuitionService.calculateTotalCost({
    program_code,
    campus_code,
    has_ielts,
    year,
  });

  if (!data) {
    return c.json(
      {
        error: "NOT_FOUND",
        message: "Program or campus not found, or no tuition data available",
      },
      404
    );
  }

  return c.json({ data }, 200);
};

/**
 * Get tuition with custom filters handler
 */
export const getTuitionWithFiltersHandler = async (c: Context) => {
  const program_codes = c.req.query("program_codes")?.split(",");
  const campus_codes = c.req.query("campus_codes")?.split(",");
  const year = Number(c.req.query("year")) || 2025;
  const include_inactive = c.req.query("include_inactive") === "true";

  const data = await tuitionService.findWithFilters(
    program_codes,
    campus_codes,
    year,
    include_inactive
  );

  return c.json({ data }, 200);
};

/**
 * Create tuition handler (admin only)
 */
export const createTuitionHandler = async (c: Context) => {
  const data = await c.req.json();

  try {
    const tuition = await tuitionService.create(data);
    return c.json({ data: tuition }, 201);
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      return c.json(
        {
          error: "CONFLICT",
          message: error.message,
        },
        409
      );
    }
    // Handle other validation errors from the service
    return c.json(
      {
        error: "VALIDATION_ERROR",
        message: error.message,
      },
      400
    );
  }
};

/**
 * Update tuition handler (admin only)
 */
export const updateTuitionHandler = async (c: Context) => {
  const id = c.req.param("id");
  const data = await c.req.json();

  try {
    const tuition = await tuitionService.update(id, data);
    return c.json({ data: tuition }, 200);
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return c.json({ error: "NOT_FOUND", message: error.message }, 404);
    }
    if (error.message.includes("already exists")) {
      return c.json({ error: "CONFLICT", message: error.message }, 409);
    }
    return c.json({ error: "VALIDATION_ERROR", message: error.message }, 400);
  }
};

/**
 * Delete tuition handler (admin only)
 */
export const deleteTuitionHandler = async (c: Context) => {
  const id = c.req.param("id");

  try {
    await tuitionService.delete(id);
    return c.json({ message: "Tuition record deleted successfully" }, 200);
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return c.json({ error: "NOT_FOUND", message: error.message }, 404);
    }
    // Generic error for other issues
    return c.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      500
    );
  }
};

/**
 * Get tuition summary handler (for analytics/overview)
 */
export const getTuitionSummaryHandler = async (c: Context) => {
  const year = Number(c.req.query("year")) || 2025;

  const [stats] = await db`
    SELECT 
      COUNT(*) as total_records,
      COUNT(DISTINCT program_id) as total_programs,
      COUNT(DISTINCT campus_id) as total_campuses,
      MIN(semester_group_1_3_fee) as min_fee,
      MAX(semester_group_7_9_fee) as max_fee,
      AVG(semester_group_1_3_fee + semester_group_4_6_fee + semester_group_7_9_fee) / 3 as avg_semester_fee
    FROM progressive_tuition 
    WHERE year = ${year} AND is_active = true
  `;

  return c.json({ data: stats }, 200);
};
