/**
 * Scholarship service - Business logic for scholarship operations
 */

import type {
  CreateScholarshipRequest,
  Scholarship,
  ScholarshipQueryParams,
  UpdateScholarshipRequest,
} from "@app-types/scholarships";
import { db } from "@config/database";
import {
  createScholarshipSchema,
  scholarshipPublicSchema,
  updateScholarshipSchema,
} from "@schemas/scholarships";
import { BaseService, type PaginatedResponse } from "./base.service";

export class ScholarshipService extends BaseService<
  Scholarship,
  CreateScholarshipRequest,
  UpdateScholarshipRequest
> {
  protected readonly tableName = "scholarships";

  /**
   * Zod schemas for validation and transformation
   */
  protected readonly publicSchema = scholarshipPublicSchema;
  protected readonly createSchema = createScholarshipSchema;
  protected readonly updateSchema = updateScholarshipSchema;

  /**
   * Get all scholarships with filtering and pagination
   */
  async findAll(
    params: ScholarshipQueryParams = {}
  ): Promise<PaginatedResponse<Scholarship>> {
    const { type, year = 2025, limit = 50, offset = 0 } = params;

    const [dataRows, countRows] = await Promise.all([
      db`
        SELECT * FROM scholarships
        WHERE (${type}::text IS NULL OR type = ${type})
          AND year = ${year}
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
      db`
        SELECT COUNT(*) as total FROM scholarships
        WHERE (${type}::text IS NULL OR type = ${type})
          AND year = ${year}
      `,
    ]);

    const total = this.extractTotal(countRows);
    const data = this.parseMany(dataRows);

    return this.createPaginatedResponse(data, total, limit, offset);
  }

  /**
   * Create new scholarship record
   */
  async create(data: CreateScholarshipRequest): Promise<Scholarship> {
    const validatedData = this.createSchema.parse(data);

    const [existing] = await db`
      SELECT id FROM scholarships WHERE code = ${validatedData.code} AND year = ${validatedData.year}
    `;

    if (existing) {
      throw new Error(
        `Scholarship with code '${validatedData.code}' already exists for year ${validatedData.year}`
      );
    }

    const [newScholarship] = await db`
      INSERT INTO scholarships ${db(
        validatedData,
        "code",
        "name",
        "type",
        "recipients",
        "percentage",
        "requirements",
        "year",
        "notes"
      )}
      RETURNING *
    `;

    return this.parseOne(newScholarship);
  }

  /**
   * Update scholarship record
   */
  async update(
    id: string,
    data: UpdateScholarshipRequest
  ): Promise<Scholarship> {
    const validatedData = this.updateSchema.parse(data);

    if (Object.keys(validatedData).length === 0) {
      const currentScholarship = await this.findById(id);
      if (!currentScholarship) {
        throw new Error("Scholarship not found");
      }
      return this.parseOne(currentScholarship);
    }

    // Ensure code and year combination remains unique if changed
    if (validatedData.code || validatedData.year) {
      const current = await this.findById(id);
      if (!current) {
        throw new Error("Scholarship not found");
      }
      const newCode = validatedData.code || current.code;
      const newYear = validatedData.year || current.year;

      const [existing] = await db`
        SELECT id FROM scholarships
        WHERE code = ${newCode} AND year = ${newYear} AND id != ${id}
      `;
      if (existing) {
        throw new Error(
          `Scholarship with code '${newCode}' already exists for year ${newYear}`
        );
      }
    }

    const [updatedScholarship] = await db`
      UPDATE scholarships SET ${db(
        validatedData,
        "code",
        "name",
        "type",
        "recipients",
        "percentage",
        "requirements",
        "year",
        "notes",
        "is_active"
      )}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedScholarship) {
      throw new Error("Scholarship not found");
    }

    return this.parseOne(updatedScholarship);
  }

  /**
   * Find a scholarship by its ID.
   */
  async findById(id: string): Promise<Scholarship | null> {
    const [item] = await db`
      SELECT * FROM scholarships WHERE id = ${id}
    `;
    return item ? this.parseOne(item) : null;
  }

  /**
   * Soft delete a scholarship by its ID.
   */
  async delete(id: string): Promise<void> {
    const [item] = await db`
      UPDATE scholarships
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND is_active = true
      RETURNING id
    `;
    if (!item) {
      throw new Error("Scholarship not found or already inactive");
    }
  }
}
