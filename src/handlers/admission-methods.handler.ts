/**
 * Admission Method handlers - Request handlers for admission method operations
 */

import { AdmissionMethodsService } from "@services/admission-methods.service";
import type { Context } from "hono";

// Create service instance
const admissionMethodsService = new AdmissionMethodsService();

/**
 * Get all admission methods handler
 */
export const getAdmissionMethodsHandler = async (c: Context) => {
  const year = Number(c.req.query("year")) || 2025;
  const limit = Number(c.req.query("limit")) || 50;
  const offset = Number(c.req.query("offset")) || 0;

  const result = await admissionMethodsService.findAll({
    year,
    limit,
    offset,
  });

  return c.json(result, 200);
};

/**
 * Get admission method by ID handler
 */
export const getAdmissionMethodByIdHandler = async (c: Context) => {
  const id = c.req.param("id");
  const method = await admissionMethodsService.findById(id);

  if (!method) {
    return c.json(
      {
        error: "NOT_FOUND",
        message: "Admission method not found",
      },
      404
    );
  }

  return c.json({ data: method }, 200);
};

/**
 * Create admission method handler (admin only)
 */
export const createAdmissionMethodHandler = async (c: Context) => {
  const data = await c.req.json();

  try {
    const method = await admissionMethodsService.create(data);
    return c.json({ data: method }, 201);
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
 * Update admission method handler (admin only)
 */
export const updateAdmissionMethodHandler = async (c: Context) => {
  const id = c.req.param("id");
  const data = await c.req.json();

  try {
    const method = await admissionMethodsService.update(id, data);
    return c.json({ data: method }, 200);
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
 * Delete admission method handler (admin only)
 */
export const deleteAdmissionMethodHandler = async (c: Context) => {
  const id = c.req.param("id");

  try {
    await admissionMethodsService.delete(id);
    return c.json({ message: "Admission method deleted successfully" }, 200);
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
