/**
 * Campus handlers - Request handlers for campus operations
 */

import { CampusesService } from "@services/campuses.service";
import type { Context } from "hono";

// Create service instance
const campusesService = new CampusesService();

/**
 * Get all campuses handler
 */
export const getCampusesHandler = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 100;
  const offset = Number(c.req.query("offset")) || 0;
  const year = Number(c.req.query("year")) || 2025;

  const result = await campusesService.findAll(limit, offset, year);
  return c.json(result, 200);
};

/**
 * Get campus by ID handler
 */
export const getCampusHandler = async (c: Context) => {
  const id = c.req.param("id");
  const year = Number(c.req.query("year")) || 2025;
  const campus = await campusesService.findById(id, year);

  if (!campus) {
    return c.json({ error: "NOT_FOUND", message: "Campus not found" }, 404);
  }

  return c.json({ data: campus }, 200);
};

/**
 * Create campus handler
 */
export const createCampusHandler = async (c: Context) => {
  const data = await c.req.json();
  const campus = await campusesService.create(data);
  return c.json({ data: campus }, 201);
};

/**
 * Update campus handler
 */
export const updateCampusHandler = async (c: Context) => {
  const id = c.req.param("id");
  const data = await c.req.json();
  const campus = await campusesService.update(id, data);
  return c.json({ data: campus }, 200);
};

/**
 * Delete campus handler
 */
export const deleteCampusHandler = async (c: Context) => {
  const id = c.req.param("id");
  await campusesService.delete(id);
  return c.json({ message: "Campus deleted successfully" }, 200);
};

/**
 * Get campuses summary handler
 */
export const getCampusesSummaryHandler = async (c: Context) => {
  const summary = await campusesService.getSummary();
  return c.json({ data: summary }, 200);
};
