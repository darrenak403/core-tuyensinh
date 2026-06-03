/**
 * Program service - Business logic for program operations
 * Optimized with PostgreSQL stored functions and views
 */

import type {
  CreateProgramRequest,
  Program,
  ProgramPublic,
  UpdateProgramRequest,
} from "@app-types/programs";
import { db } from "@config/database";
import { z } from "zod";
import {
  BaseService,
  type PaginatedResponse,
  commonSchemas,
} from "./base.service";

export class ProgramsService extends BaseService<
  ProgramPublic,
  CreateProgramRequest,
  UpdateProgramRequest
> {
  protected readonly tableName = "programs";
  /**
   * Zod schemas for validation and transformation
   */
  protected readonly publicSchema = z
    .object({
      id: commonSchemas.uuid,
      code: z.string(),
      name: z.string(),
      name_en: commonSchemas.optionalString,
      department_id: commonSchemas.uuid,
      duration_years: z.number(),
      dept_id: commonSchemas.uuid,
      dept_code: z.string(),
      dept_name: z.string(),
      dept_name_en: commonSchemas.optionalString,
    })
    .transform(
      (row): ProgramPublic => ({
        id: row.id,
        code: row.code,
        name: row.name,
        name_en: row.name_en,
        department_id: row.department_id,
        duration_years: row.duration_years,
        department: {
          id: row.dept_id,
          code: row.dept_code,
          name: row.dept_name,
          name_en: row.dept_name_en,
        },
      })
    );

  protected readonly createSchema = z.object({
    code: z.string(),
    name: z.string(),
    name_en: z.string().optional(),
    department_id: z.string().uuid(),
    duration_years: z.number(),
  });

  protected readonly updateSchema = z.object({
    code: z.string().optional(),
    name: z.string().optional(),
    name_en: z.string().optional(),
    department_id: z.string().uuid().optional(),
    duration_years: z.number().optional(),
    is_active: z.boolean().optional(),
  });

  async findAll(
    departmentCode?: string,
    limit = 100,
    offset = 0
  ): Promise<PaginatedResponse<ProgramPublic>> {
    const [dataRows, countRows] = await Promise.all([
      db`
        SELECT * FROM get_programs_with_department(
          ${departmentCode},
          ${limit},
          ${offset}
        )
      `,
      db`
        SELECT get_programs_count(${departmentCode}) as total
      `,
    ]);

    const total = this.extractTotal(countRows);
    const data = this.parseMany(dataRows);

    return this.createPaginatedResponse(data, total, limit, offset);
  }

  async findById(id: string): Promise<ProgramPublic | null> {
    const [program] = await db`
      SELECT * FROM get_program_by_id_with_department(${id})
    `;

    if (!program) return null;

    return this.parseOne(program);
  }

  async findByCode(code: string): Promise<Program | null> {
    const [program] = await db`
      SELECT * FROM get_program_by_code(${code})
    `;
    return program || null;
  }

  async getSummary(): Promise<any> {
    const [summary] = await db`
      SELECT * FROM v_programs_summary
    `;
    return summary;
  }

  async create(data: CreateProgramRequest): Promise<ProgramPublic> {
    const [program] = await db`
      SELECT * FROM create_program_with_validation(
        ${data.code},
        ${data.name},
        ${data.name_en},
        ${data.department_id},
        ${data.duration_years}
      )
    `;

    return this.parseOne(program);
  }

  async update(id: string, data: UpdateProgramRequest): Promise<ProgramPublic> {
    const [program] = await db`
      SELECT * FROM update_program_with_validation(
        ${id},
        ${data.code},
        ${data.name},
        ${data.name_en},
        ${data.department_id},
        ${data.duration_years},
        ${data.is_active}
      )
    `;

    return this.parseOne(program);
  }

  async delete(id: string): Promise<void> {
    await db`
      SELECT delete_program_with_validation(${id})
    `;
  }
}
