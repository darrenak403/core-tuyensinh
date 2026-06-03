/**
 * Scholarship handlers - Request handlers for scholarship operations
 */

import { ScholarshipService } from "@services/scholarships.service";
import type { Context } from "hono";

// Create service instance
const scholarshipService = new ScholarshipService();

/**
 * Get all scholarships handler
 */
export const getScholarshipsHandler = async (c: Context) => {
  const type = c.req.query("type");
  const year = Number(c.req.query("year")) || 2025;
  const limit = Number(c.req.query("limit")) || 50;
  const offset = Number(c.req.query("offset")) || 0;

  const result = await scholarshipService.findAll({
    type,
    year,
    limit,
    offset,
  });

  return c.json(result, 200);
};

/**
 * Get scholarship by ID handler
 */
export const getScholarshipByIdHandler = async (c: Context) => {
  const id = c.req.param("id");
  const scholarship = await scholarshipService.findById(id);

  if (!scholarship) {
    return c.json(
      {
        error: "NOT_FOUND",
        message: "Scholarship not found",
      },
      404
    );
  }

  return c.json({ data: scholarship }, 200);
};

/**
 * Create scholarship handler (admin only)
 */
export const createScholarshipHandler = async (c: Context) => {
  const data = await c.req.json();

  try {
    const scholarship = await scholarshipService.create(data);
    return c.json({ data: scholarship }, 201);
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
 * Update scholarship handler (admin only)
 */
export const updateScholarshipHandler = async (c: Context) => {
  const id = c.req.param("id");
  const data = await c.req.json();

  try {
    const scholarship = await scholarshipService.update(id, data);
    return c.json({ data: scholarship }, 200);
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
 * Delete scholarship handler (admin only)
 */
export const deleteScholarshipHandler = async (c: Context) => {
  const id = c.req.param("id");

  try {
    await scholarshipService.delete(id);
    return c.json({ message: "Scholarship deleted successfully" }, 200);
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return c.json({ error: "NOT_FOUND", message: error.message }, 404);
    }
    return c.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      500
    );
  }
};
