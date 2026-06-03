/**
 * Tuition service - Business logic for tuition operations
 * Optimized with PostgreSQL views and functions
 */

import type {
  CampusTuitionParams,
  CampusTuitionSummary,
  CreateTuitionRequest,
  TuitionCalculateParams,
  TuitionCalculation,
  TuitionComparison,
  TuitionComparisonParams,
  TuitionQueryParams,
  TuitionSummary,
  UpdateTuitionRequest,
} from "@app-types/tuition";
import { db } from "@config/database";
import {
  campusTuitionSummarySchema,
  createTuitionSchema,
  tuitionCalculationSchema,
  tuitionComparisonSchema,
  tuitionSummarySchema,
  updateTuitionSchema,
} from "@schemas/tuition";
import { z } from "zod";
import { BaseService, type PaginatedResponse } from "./base.service";

export class TuitionService extends BaseService<
  TuitionSummary,
  CreateTuitionRequest,
  UpdateTuitionRequest
> {
  protected readonly tableName = "progressive_tuition";

  /**
   * Zod schemas for validation and transformation
   */
  protected readonly publicSchema = tuitionSummarySchema;
  protected readonly createSchema = createTuitionSchema;
  protected readonly updateSchema = updateTuitionSchema;

  /**
   * Get all tuition fees with filtering and pagination
   * Uses v_tuition_summary view for optimized performance
   */
  async findAll(
    params: TuitionQueryParams = {}
  ): Promise<PaginatedResponse<TuitionSummary>> {
    const {
      program_code,
      campus_code,
      year = 2025,
      limit = 50,
      offset = 0,
    } = params;

    const [dataRows, countRows] = await Promise.all([
      db`
        SELECT * FROM v_tuition_summary 
        WHERE (${program_code}::text IS NULL OR program_code = ${program_code})
          AND (${campus_code}::text IS NULL OR campus_code = ${campus_code})
          AND year = ${year}
        ORDER BY department_name, program_name, campus_name
        LIMIT ${limit} OFFSET ${offset}
      `,
      db`
        SELECT COUNT(*) as total FROM v_tuition_summary 
        WHERE (${program_code}::text IS NULL OR program_code = ${program_code})
          AND (${campus_code}::text IS NULL OR campus_code = ${campus_code})
          AND year = ${year}
      `,
    ]);

    const total = this.extractTotal(countRows);
    const data = this.parseMany(dataRows);

    return this.createPaginatedResponse(data, total, limit, offset);
  }

  /**
   * Get tuition by ID
   * Uses v_tuition_summary view
   */
  async findById(id: string): Promise<TuitionSummary | null> {
    const [tuition] = await db`
      SELECT * FROM v_tuition_summary 
      WHERE id = ${id}
    `;
    return tuition ? this.parseOne(tuition) : null;
  }

  /**
   * Get tuition comparison across campuses
   * Uses v_tuition_comparison view
   */
  async getComparison(
    params: TuitionComparisonParams = {}
  ): Promise<TuitionComparison[]> {
    const { program_code, year = 2025 } = params;

    const rows = await db`
      SELECT * FROM v_tuition_comparison 
      WHERE (${program_code}::text IS NULL OR program_code = ${program_code})
        AND year = ${year}
      ORDER BY department_name, program_name
    `;

    return z.array(tuitionComparisonSchema).parse(rows);
  }

  /**
   * Get campus tuition summary
   * Uses v_campus_tuition_summary view
   */
  async getCampusSummary(
    params: CampusTuitionParams
  ): Promise<CampusTuitionSummary | null> {
    const { campus_code, year = 2025 } = params;

    const [campus] = await db`
      SELECT * FROM v_campus_tuition_summary 
      WHERE campus_code = ${campus_code}
        AND year = ${year}
    `;

    return campus ? campusTuitionSummarySchema.parse(campus) : null;
  }

  /**
   * Calculate total program cost including preparation fees
   * Uses calculate_total_program_cost function
   */
  async calculateTotalCost(
    params: TuitionCalculateParams
  ): Promise<TuitionCalculation | null> {
    const {
      program_code,
      campus_code,
      has_ielts = false,
      year = 2025,
    } = params;

    const [result] = await db`
      SELECT * FROM calculate_total_program_cost(
        ${program_code}, 
        ${campus_code}, 
        ${year}, 
        ${has_ielts}
      )
    `;

    return result ? tuitionCalculationSchema.parse(result) : null;
  }

  /**
   * Get tuition with custom filters
   * Uses get_tuition_with_filters function for complex queries
   */
  async findWithFilters(
    programCodes?: string[],
    campusCodes?: string[],
    year = 2025,
    includeInactive = false
  ): Promise<TuitionSummary[]> {
    const rows = await db`
      SELECT * FROM get_tuition_with_filters(
        ${programCodes || null}, 
        ${campusCodes || null}, 
        ${year}, 
        ${includeInactive}
      )
    `;

    return this.parseMany(rows);
  }

  /**
   * Create new tuition record using validation function
   */
  async create(data: CreateTuitionRequest): Promise<TuitionSummary> {
    const validatedData = this.createSchema.parse(data);

    return db.begin(async (tx) => {
      // 1. Validate program exists and is active
      const [program] = await tx`
        SELECT id FROM programs WHERE id = ${validatedData.program_id} AND is_active = true
      `;
      if (!program) {
        throw new Error("Program not found or inactive");
      }

      // 2. Validate campus exists and is active
      const [campus] = await tx`
        SELECT id FROM campuses WHERE id = ${validatedData.campus_id} AND is_active = true
      `;
      if (!campus) {
        throw new Error("Campus not found or inactive");
      }

      // 3. Check for existing tuition record
      const [existing] = await tx`
        SELECT id FROM progressive_tuition
        WHERE program_id = ${validatedData.program_id}
          AND campus_id = ${validatedData.campus_id}
          AND year = ${validatedData.year}
          AND is_active = true
      `;
      if (existing) {
        throw new Error(
          `Tuition already exists for this program and campus in year ${validatedData.year}`
        );
      }

      // 4. Insert new record
      const [newTuition] = await tx`
        INSERT INTO progressive_tuition (
          program_id, campus_id, year,
          semester_group_1_3_fee, semester_group_4_6_fee, semester_group_7_9_fee
        ) VALUES (
          ${validatedData.program_id}, ${validatedData.campus_id}, ${validatedData.year},
          ${validatedData.semester_group_1_3_fee}, ${validatedData.semester_group_4_6_fee}, ${validatedData.semester_group_7_9_fee}
        )
        RETURNING id
      `;

      // 5. Fetch and return the full summary from the view
      const [result] = await tx`
        SELECT * FROM v_tuition_summary WHERE id = ${newTuition.id}
      `;

      return this.parseOne(result);
    });
  }

  /**
   * Update tuition record with in-app validation
   */
  async update(
    id: string,
    data: UpdateTuitionRequest
  ): Promise<TuitionSummary> {
    const validatedData = this.updateSchema.parse(data);

    // Prevent updating with an empty object
    if (Object.keys(validatedData).length === 0) {
      const currentTuition = await this.findById(id);
      if (!currentTuition) {
        throw new Error("Tuition record not found");
      }
      return currentTuition;
    }

    return db.begin(async (tx) => {
      // 1. Ensure the record exists
      const [currentTarget] = await tx`
        SELECT program_id, campus_id, year FROM progressive_tuition WHERE id = ${id}
      `;
      if (!currentTarget) {
        throw new Error("Tuition record not found");
      }

      // 2. Validate foreign keys if they are being changed
      if (validatedData.program_id) {
        const [program] =
          await tx`SELECT id FROM programs WHERE id = ${validatedData.program_id} AND is_active = true`;
        if (!program) throw new Error("Program not found or inactive");
      }
      if (validatedData.campus_id) {
        const [campus] =
          await tx`SELECT id FROM campuses WHERE id = ${validatedData.campus_id} AND is_active = true`;
        if (!campus) throw new Error("Campus not found or inactive");
      }

      // 3. Check for uniqueness constraint violation if identifiers are changed
      const programId = validatedData.program_id || currentTarget.program_id;
      const campusId = validatedData.campus_id || currentTarget.campus_id;
      const year = validatedData.year || currentTarget.year;

      if (
        validatedData.program_id ||
        validatedData.campus_id ||
        validatedData.year
      ) {
        const [existing] = await tx`
          SELECT id FROM progressive_tuition
          WHERE program_id = ${programId}
            AND campus_id = ${campusId}
            AND year = ${year}
            AND id != ${id}
            AND is_active = true
        `;
        if (existing) {
          throw new Error(
            `Tuition already exists for this program and campus in year ${year}`
          );
        }
      }

      // 4. Build and execute the update query
      const [updated] = await tx`
        UPDATE progressive_tuition SET ${tx(
          validatedData,
          "program_id",
          "campus_id",
          "year",
          "semester_group_1_3_fee",
          "semester_group_4_6_fee",
          "semester_group_7_9_fee",
          "is_active"
        )}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id
      `;

      // 5. Fetch and return the full summary from the view
      const [result] = await tx`
        SELECT * FROM v_tuition_summary WHERE id = ${updated.id}
      `;

      return this.parseOne(result);
    });
  }

  /**
   * Soft delete tuition record with in-app validation
   */
  async delete(id: string): Promise<void> {
    await db.begin(async (tx) => {
      // 1. Ensure the record exists and is active
      const [target] = await tx`
        SELECT id FROM progressive_tuition WHERE id = ${id} AND is_active = true
      `;
      if (!target) {
        throw new Error("Tuition record not found or already inactive");
      }

      // 2. Soft delete the record
      await tx`
        UPDATE progressive_tuition
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
    });
  }

  /**
   * Check if tuition exists for program and campus
   */
  async existsForProgramAndCampus(
    programId: string,
    campusId: string,
    year: number
  ): Promise<boolean> {
    const [result] = await db`
      SELECT EXISTS(
        SELECT 1 FROM progressive_tuition 
        WHERE program_id = ${programId} 
          AND campus_id = ${campusId} 
          AND year = ${year}
          AND is_active = true
      ) as exists
    `;

    return result.exists;
  }
}
