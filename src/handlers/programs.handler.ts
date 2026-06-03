/**
 * Program handlers - Request handlers for program operations
 */

import { ProgramsService } from "@services/programs.service";
import type { Context } from "hono";

// Create service instance
const programsService = new ProgramsService();

/**
 * Get all programs handler
 */
export const getProgramsHandler = async (c: Context) => {
  const departmentCode = c.req.query("department_code");
  const limit = Number(c.req.query("limit")) || 100;
  const offset = Number(c.req.query("offset")) || 0;

  const result = await programsService.findAll(departmentCode, limit, offset);
  return c.json(result, 200);
};

/**
 * Get program by ID handler
 */
export const getProgramHandler = async (c: Context) => {
  const id = c.req.param("id");
  const program = await programsService.findById(id);

  if (!program) {
    return c.json({ error: "NOT_FOUND", message: "Program not found" }, 404);
  }

  return c.json({ data: program }, 200);
};

/**
 * Create program handler
 */
export const createProgramHandler = async (c: Context) => {
  const data = await c.req.json();
  const program = await programsService.create(data);
  return c.json({ data: program }, 201);
};

/**
 * Update program handler
 */
export const updateProgramHandler = async (c: Context) => {
  const id = c.req.param("id");
  const data = await c.req.json();
  const program = await programsService.update(id, data);
  return c.json({ data: program }, 200);
};

/**
 * Delete program handler
 */
export const deleteProgramHandler = async (c: Context) => {
  const id = c.req.param("id");
  await programsService.delete(id);
  return c.json({ message: "Program deleted successfully" }, 200);
};

/**
 * Get programs summary handler
 */
export const getProgramsSummaryHandler = async (c: Context) => {
  const summary = await programsService.getSummary();
  return c.json({ data: summary }, 200);
};
