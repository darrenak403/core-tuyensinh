/**
 * Admission Method service - Business logic for admission method operations
 */

import type {
  AdmissionMethod,
  AdmissionMethodQueryParams,
  CreateAdmissionMethodRequest,
  UpdateAdmissionMethodRequest,
} from "@app-types/admission-methods";
import { db } from "@config/database";
import {
  admissionMethodPublicSchema,
  createAdmissionMethodSchema,
  updateAdmissionMethodSchema,
} from "@schemas/admission-methods";
import { BaseService, type PaginatedResponse } from "./base.service";

export class AdmissionMethodsService extends BaseService<
  AdmissionMethod,
  CreateAdmissionMethodRequest,
  UpdateAdmissionMethodRequest
> {
  protected readonly tableName = "admission_methods";

  /**
   * Zod schemas for validation and transformation
   */
  protected readonly publicSchema = admissionMethodPublicSchema;
  protected readonly createSchema = createAdmissionMethodSchema;
  protected readonly updateSchema = updateAdmissionMethodSchema;

  /**
   * Get all admission methods with filtering and pagination
   */
  async findAll(
    params: AdmissionMethodQueryParams = {}
  ): Promise<PaginatedResponse<AdmissionMethod>> {
    const { year = 2025, limit = 50, offset = 0 } = params;

    const [dataRows, countRows] = await Promise.all([
      db`
        SELECT * FROM admission_methods
        WHERE year = ${year}
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
      db`
        SELECT COUNT(*) as total FROM admission_methods
        WHERE year = ${year}
      `,
    ]);

    const total = this.extractTotal(countRows);
    const data = this.parseMany(dataRows);

    return this.createPaginatedResponse(data, total, limit, offset);
  }

  /**
   * Create new admission method record
   */
  async create(data: CreateAdmissionMethodRequest): Promise<AdmissionMethod> {
    const validatedData = this.createSchema.parse(data);

    const [existing] = await db`
      SELECT id FROM admission_methods WHERE method_code = ${validatedData.method_code} AND year = ${validatedData.year}
    `;

    if (existing) {
      throw new Error(
        `Admission method with code '${validatedData.method_code}' already exists for year ${validatedData.year}`
      );
    }

    const [newMethod] = await db`
      INSERT INTO admission_methods ${db(
        validatedData,
        "method_code",
        "name",
        "requirements",
        "notes",
        "year"
      )}
      RETURNING *
    `;

    return this.parseOne(newMethod);
  }

  /**
   * Update admission method record
   */
  async update(
    id: string,
    data: UpdateAdmissionMethodRequest
  ): Promise<AdmissionMethod> {
    const validatedData = this.updateSchema.parse(data);

    if (Object.keys(validatedData).length === 0) {
      const currentMethod = await this.findById(id);
      if (!currentMethod) {
        throw new Error("Admission method not found");
      }
      return this.parseOne(currentMethod);
    }

    // Ensure method_code and year combination remains unique if changed
    if (validatedData.method_code || validatedData.year) {
      const current = await this.findById(id);
      if (!current) {
        throw new Error("Admission method not found");
      }
      const newCode = validatedData.method_code || current.method_code;
      const newYear = validatedData.year || current.year;

      const [existing] = await db`
        SELECT id FROM admission_methods
        WHERE method_code = ${newCode} AND year = ${newYear} AND id != ${id}
      `;
      if (existing) {
        throw new Error(
          `Admission method with code '${newCode}' already exists for year ${newYear}`
        );
      }
    }

    const [updatedMethod] = await db`
      UPDATE admission_methods SET ${db(
        validatedData,
        "method_code",
        "name",
        "requirements",
        "notes",
        "year",
        "is_active"
      )}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedMethod) {
      throw new Error("Admission method not found");
    }

    return this.parseOne(updatedMethod);
  }

  /**
   * Find a admission method by its ID.
   */
  async findById(id: string): Promise<AdmissionMethod | null> {
    const [item] = await db`
      SELECT * FROM admission_methods WHERE id = ${id}
    `;
    return item ? this.parseOne(item) : null;
  }

  /**
   * Soft delete a admission method by its ID.
   */
  async delete(id: string): Promise<void> {
    const [item] = await db`
      UPDATE admission_methods
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND is_active = true
      RETURNING id
    `;
    if (!item) {
      throw new Error("Admission method not found or already inactive");
    }
  }
}
