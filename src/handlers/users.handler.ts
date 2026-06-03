/**
 * Users handlers - Request handlers for user management
 */

import { UsersService } from "@services/users.service";
import type { Context } from "hono";

// Create service instance
const usersService = new UsersService();

/**
 * Get all users handler
 */
export const getUsersHandler = async (c: Context) => {
  const role = c.req.query("role");
  const is_active = c.req.query("is_active")
    ? c.req.query("is_active") === "true"
    : undefined;
  const limit = Number(c.req.query("limit")) || 50;
  const offset = Number(c.req.query("offset")) || 0;

  const result = await usersService.findAll({
    role,
    is_active,
    limit,
    offset,
  });

  return c.json(result, 200);
};

/**
 * Get user by ID handler
 */
export const getUserByIdHandler = async (c: Context) => {
  const id = c.req.param("id");
  const user = await usersService.findById(id);

  if (!user) {
    return c.json(
      {
        error: "NOT_FOUND",
        message: "User not found",
      },
      404
    );
  }

  return c.json({ data: user }, 200);
};

/**
 * Create user handler (admin only)
 */
export const createUserHandler = async (c: Context) => {
  const data = await c.req.json();

  try {
    const user = await usersService.create(data);
    return c.json({ data: user }, 201);
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
 * Update user handler (admin only)
 */
export const updateUserHandler = async (c: Context) => {
  const id = c.req.param("id");
  const data = await c.req.json();

  try {
    const user = await usersService.update(id, data);
    return c.json({ data: user }, 200);
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return c.json({ error: "NOT_FOUND", message: error.message }, 404);
    }
    return c.json({ error: "VALIDATION_ERROR", message: error.message }, 400);
  }
};

/**
 * Delete user handler (admin only)
 */
export const deleteUserHandler = async (c: Context) => {
  const id = c.req.param("id");

  try {
    await usersService.delete(id);
    return c.json({ message: "User deleted successfully" }, 200);
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
