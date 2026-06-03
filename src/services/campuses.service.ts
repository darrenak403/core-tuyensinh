/**
 * Campus service - Business logic for campus operations
 * Optimized with PostgreSQL stored functions and views
 */

import type {
  CampusPublic,
  CreateCampusRequest,
  UpdateCampusRequest,
} from "@app-types/campuses";
import { db } from "@config/database";
import { z } from "zod";
import {
  BaseService,
  type PaginatedResponse,
  commonSchemas,
} from "./base.service";

export class CampusesService extends BaseService<
  CampusPublic,
  CreateCampusRequest,
  UpdateCampusRequest
> {
  protected readonly tableName = "campuses";

  /**
   * Zod schemas for validation and transformation
   */
  protected readonly publicSchema = z
    .object({
      id: commonSchemas.uuid,
      code: z.string(),
      name: z.string(),
      city: z.string(),
      address: commonSchemas.optionalString,
      phone: commonSchemas.optionalString,
      email: commonSchemas.optionalString,
      discount_percentage: z.coerce.number(),
      year: z.coerce.number().nullable(),
      orientation_fee: z.coerce.number().nullable(),
      english_prep_fee: z.coerce.number().nullable(),
      orientation_description: z.string().nullable(),
      english_prep_description: z.string().nullable(),
      available_programs_count: z.coerce.number().nullable(),
      available_program_codes: z.array(z.string()).nullable(),
    })
    .transform(
      (row): CampusPublic => ({
        id: row.id,
        code: row.code,
        name: row.name,
        city: row.city,
        address: row.address,
        phone: row.phone,
        email: row.email,
        discount_percentage: row.discount_percentage,
        preparation_fees:
          row.year && (row.orientation_fee || row.english_prep_fee)
            ? {
                year: row.year,
                orientation: {
                  fee: row.orientation_fee || 0,
                  is_mandatory: true,
                  max_periods: 1,
                  description: row.orientation_description || undefined,
                },
                english_prep: {
                  fee: row.english_prep_fee || 0,
                  is_mandatory: false,
                  max_periods: 6,
                  description: row.english_prep_description || undefined,
                },
              }
            : undefined,
        available_programs:
          row.available_programs_count !== null
            ? {
                count: row.available_programs_count,
                codes: row.available_program_codes || [],
              }
            : undefined,
      })
    );

  protected readonly createSchema = z.object({
    code: z.string(),
    name: z.string(),
    city: z.string(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    discount_percentage: z.number().optional(),
  });

  protected readonly updateSchema = z.object({
    code: z.string().optional(),
    name: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    discount_percentage: z.number().optional(),
    is_active: z.boolean().optional(),
  });

  /**
   * Transform basic campus data to match public schema structure
   */
  private transformBasicCampus(campus: any): any {
    return {
      ...campus,
      year: null,
      orientation_fee: null,
      english_prep_fee: null,
      orientation_description: null,
      english_prep_description: null,
      available_programs_count: null,
      available_program_codes: null,
    };
  }

  async findAll(
    limit = 100,
    offset = 0,
    year = 2025
  ): Promise<PaginatedResponse<CampusPublic>> {
    const [dataRows, countRows] = await Promise.all([
      db`
        SELECT * FROM get_campuses_with_details(
          ${year},
          ${limit},
          ${offset}
        )
      `,
      db`
        SELECT get_campuses_count() as total
      `,
    ]);

    const total = this.extractTotal(countRows);
    const data = this.parseMany(dataRows);

    return this.createPaginatedResponse(data, total, limit, offset);
  }

  async findById(id: string, year = 2025): Promise<CampusPublic | null> {
    const [campus] = await db`
      SELECT * FROM get_campus_with_details_by_id(${id}, ${year})
    `;
    return campus ? this.parseOne(campus) : null;
  }

  async getSummary(): Promise<any> {
    const [summary] = await db`
      SELECT * FROM v_campuses_summary
    `;
    return summary;
  }

  async create(data: CreateCampusRequest): Promise<CampusPublic> {
    const [campus] = await db`
      SELECT * FROM create_campus_with_validation(
        ${data.code},
        ${data.name},
        ${data.city},
        ${data.address},
        ${data.phone},
        ${data.email},
        ${data.discount_percentage || 0}
      )
    `;

    return this.parseOne(this.transformBasicCampus(campus));
  }

  async update(id: string, data: UpdateCampusRequest): Promise<CampusPublic> {
    const [campus] = await db`
      SELECT * FROM update_campus_with_validation(
        ${id},
        ${data.code},
        ${data.name},
        ${data.city},
        ${data.address},
        ${data.phone},
        ${data.email},
        ${data.discount_percentage},
        ${data.is_active}
      )
    `;

    return this.parseOne(this.transformBasicCampus(campus));
  }

  async delete(id: string): Promise<void> {
    await db`
      SELECT delete_campus_with_validation(${id})
    `;
  }
}
