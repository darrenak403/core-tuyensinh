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
import { AdmissionYearsService } from "@services/admission-years.service";
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
      admission_year: z
        .number()
        .nullable()
        .optional()
        .transform((val) => val ?? undefined),
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
        admission_year: row.admission_year,
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
    admission_year: z.number().optional(),
  });

  protected readonly updateSchema = z.object({
    code: z.string().optional(),
    name: z.string().optional(),
    name_en: z.string().optional(),
    department_id: z.string().uuid().optional(),
    duration_years: z.number().optional(),
    admission_year: z.number().optional(),
    is_active: z.boolean().optional(),
  });

  async findAll(
    departmentCode?: string,
    limit = 100,
    offset = 0,
    admissionYear?: number
  ): Promise<PaginatedResponse<ProgramPublic>> {
    const [dataRows, countRows] = await Promise.all([
      db`
        SELECT
          p.id, p.code, p.name, p.name_en, p.department_id, p.duration_years, p.admission_year,
          d.id as dept_id, d.code as dept_code, d.name as dept_name, d.name_en as dept_name_en
        FROM programs p
        INNER JOIN departments d ON p.department_id = d.id
        WHERE p.is_active = true
          AND d.is_active = true
          AND (${departmentCode ?? null}::varchar IS NULL OR d.code = ${departmentCode ?? null})
          AND (${admissionYear ?? null}::integer IS NULL OR p.admission_year = ${admissionYear ?? null})
        ORDER BY p.name
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      db`
        SELECT COUNT(*)::int as total
        FROM programs p
        INNER JOIN departments d ON p.department_id = d.id
        WHERE p.is_active = true
          AND d.is_active = true
          AND (${departmentCode ?? null}::varchar IS NULL OR d.code = ${departmentCode ?? null})
          AND (${admissionYear ?? null}::integer IS NULL OR p.admission_year = ${admissionYear ?? null})
      `,
    ]);

    const total = this.extractTotal(countRows);
    const data = this.parseMany(dataRows);

    return this.createPaginatedResponse(data, total, limit, offset);
  }

  async findById(id: string): Promise<ProgramPublic | null> {
    const [program] = await db`
      SELECT
        p.id, p.code, p.name, p.name_en, p.department_id, p.duration_years, p.admission_year,
        d.id as dept_id, d.code as dept_code, d.name as dept_name, d.name_en as dept_name_en
      FROM programs p
      INNER JOIN departments d ON p.department_id = d.id
      WHERE p.id = ${id}
        AND p.is_active = true
        AND d.is_active = true
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
    if (data.admission_year !== undefined) {
      await new AdmissionYearsService().ensureActive(data.admission_year);
    }
    const [program] = await db`
      INSERT INTO programs (code, name, name_en, department_id, duration_years, admission_year)
      VALUES (${data.code}, ${data.name}, ${data.name_en}, ${data.department_id}, ${data.duration_years}, ${data.admission_year})
      RETURNING
        id, code, name, name_en, department_id, duration_years, admission_year,
        (SELECT id FROM departments WHERE id = ${data.department_id}) as dept_id,
        (SELECT code FROM departments WHERE id = ${data.department_id}) as dept_code,
        (SELECT name FROM departments WHERE id = ${data.department_id}) as dept_name,
        (SELECT name_en FROM departments WHERE id = ${data.department_id}) as dept_name_en
    `;

    return this.parseOne(program);
  }

  async update(id: string, data: UpdateProgramRequest): Promise<ProgramPublic> {
    if (data.admission_year !== undefined) {
      await new AdmissionYearsService().ensureActive(data.admission_year);
    }
    const [program] = await db`
      UPDATE programs
      SET
        code = COALESCE(${data.code}, code),
        name = COALESCE(${data.name}, name),
        name_en = COALESCE(${data.name_en}, name_en),
        department_id = COALESCE(${data.department_id}, department_id),
        duration_years = COALESCE(${data.duration_years}, duration_years),
        admission_year = COALESCE(${data.admission_year}, admission_year),
        is_active = COALESCE(${data.is_active}, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND is_active = true
      RETURNING
        id, code, name, name_en, department_id, duration_years, admission_year,
        (SELECT id FROM departments WHERE id = programs.department_id) as dept_id,
        (SELECT code FROM departments WHERE id = programs.department_id) as dept_code,
        (SELECT name FROM departments WHERE id = programs.department_id) as dept_name,
        (SELECT name_en FROM departments WHERE id = programs.department_id) as dept_name_en
    `;

    return this.parseOne(program);
  }

  async delete(id: string): Promise<void> {
    await db`
      SELECT delete_program_with_validation(${id})
    `;
  }
}
