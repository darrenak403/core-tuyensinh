/**
 * Department handlers - Request handlers for department operations
 */

import { DepartmentsService } from "@services/departments.service";
import type { Context } from "hono";

// Create service instance
const departmentsService = new DepartmentsService();

export const getDepartmentsHandler = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 100;
  const offset = Number(c.req.query("offset")) || 0;

  const result = await departmentsService.findAll(limit, offset);
  return c.json(result, 200);
};

/**
 * Get department by ID handler
 */
export const getDepartmentHandler = async (c: Context) => {
  const id = c.req.param("id");
  const department = await departmentsService.findById(id);

  if (!department) {
    return c.json({ error: "NOT_FOUND", message: "Department not found" }, 404);
  }

  return c.json({ data: department }, 200);
};

/**
 * Create department handler
 */
export const createDepartmentHandler = async (c: Context) => {
  const data = await c.req.json();
  const department = await departmentsService.create(data);
  return c.json({ data: department }, 201);
};

/**
 * Update department handler
 */
export const updateDepartmentHandler = async (c: Context) => {
  const id = c.req.param("id");
  const data = await c.req.json();
  const department = await departmentsService.update(id, data);
  return c.json({ data: department }, 200);
};

/**
 * Delete department handler
 */
export const deleteDepartmentHandler = async (c: Context) => {
  const id = c.req.param("id");
  await departmentsService.delete(id);
  return c.json({ message: "Department deleted successfully" }, 200);
};

/**
 * Get departments summary handler
 */
export const getDepartmentsSummaryHandler = async (c: Context) => {
  const summary = await departmentsService.getSummary();
  return c.json({ data: summary }, 200);
};
