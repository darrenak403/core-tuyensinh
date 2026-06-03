/**
 * Users service - Business logic for user management
 */

import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserPublic,
  UserQueryParams,
} from "@app-types/users";
import { db } from "@config/database";
import {
  createUserSchema,
  updateUserSchema,
  userPublicSchema,
} from "@schemas/users";
import { PasswordUtils } from "@utils/password.utils";
import { BaseService, type PaginatedResponse } from "./base.service";

export class UsersService extends BaseService<
  UserPublic,
  CreateUserRequest,
  UpdateUserRequest
> {
  protected readonly tableName = "users";

  /**
   * Zod schemas for validation and transformation
   */
  protected readonly publicSchema = userPublicSchema;
  protected readonly createSchema = createUserSchema;
  protected readonly updateSchema = updateUserSchema;

  /**
   * Get all users with filtering and pagination
   */
  async findAll(
    params: UserQueryParams = {}
  ): Promise<PaginatedResponse<UserPublic>> {
    const { role, is_active, limit = 50, offset = 0 } = params;

    const [dataRows, countRows] = await Promise.all([
      db`
        SELECT id, username, email, role, is_active, last_login_at, created_at, updated_at
        FROM users
        WHERE (${role}::text IS NULL OR role = ${role})
          AND (${is_active}::boolean IS NULL OR is_active = ${is_active})
        ORDER BY username ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
      db`
        SELECT COUNT(*) as total FROM users
        WHERE (${role}::text IS NULL OR role = ${role})
          AND (${is_active}::boolean IS NULL OR is_active = ${is_active})
      `,
    ]);

    const total = this.extractTotal(countRows);
    const data = this.parseMany(dataRows);

    return this.createPaginatedResponse(data, total, limit, offset);
  }

  /**
   * Create a new user record (for admins)
   */
  async create(data: CreateUserRequest): Promise<UserPublic> {
    const { password, ...restData } = this.createSchema.parse(data);

    // Check for existing username or email
    const [existing] = await db`
      SELECT id FROM users WHERE username = ${restData.username} OR email = ${restData.email}
    `;
    if (existing) {
      throw new Error("Username or email already exists");
    }

    const password_hash = await PasswordUtils.hash(password);

    const [newUser] = await db`
      INSERT INTO users ${db({ ...restData, password_hash }, "username", "email", "password_hash", "role")}
      RETURNING id, username, email, role, is_active, last_login_at, created_at, updated_at
    `;

    return this.parseOne(newUser);
  }

  /**
   * Update a user record (for admins)
   */
  async update(id: string, data: UpdateUserRequest): Promise<UserPublic> {
    const { password, ...restData } = this.updateSchema.parse(data);

    if (Object.keys(restData).length === 0 && !password) {
      const currentUser = await this.findById(id);
      if (!currentUser) {
        throw new Error("User not found");
      }
      return this.parseOne(currentUser);
    }

    const updatePayload: Record<string, any> = { ...restData };

    if (password) {
      updatePayload.password_hash = await PasswordUtils.hash(password);
    }

    const [updatedUser] = await db`
      UPDATE users SET ${db(updatePayload)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, username, email, role, is_active, last_login_at, created_at, updated_at
    `;

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return this.parseOne(updatedUser);
  }

  /**
   * Find a user by its ID.
   */
  async findById(id: string): Promise<UserPublic | null> {
    const [item] = await db`
      SELECT id, username, email, role, is_active, last_login_at, created_at, updated_at
      FROM users WHERE id = ${id}
    `;
    return item ? this.parseOne(item) : null;
  }

  /**
   * Soft delete a user by its ID.
   */
  async delete(id: string): Promise<void> {
    const [item] = await db`
      UPDATE users
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND is_active = true
      RETURNING id
    `;
    if (!item) {
      throw new Error("User not found or already inactive");
    }
  }
}
