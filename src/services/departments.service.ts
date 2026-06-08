/**
 * Department service - Business logic for department operations
 * Optimized with PostgreSQL stored functions and views
 */

import type {
  CreateDepartmentRequest,
  Department,
  DepartmentPublic,
  UpdateDepartmentRequest,
} from "@app-types/departments";
import { db } from "@config/database";
import { AdmissionYearsService } from "@services/admission-years.service";
import { z } from "zod";
import {
  BaseService,
  type PaginatedResponse,
  commonSchemas,
} from "./base.service";

export class DepartmentsService extends BaseService<
  DepartmentPublic,
  CreateDepartmentRequest,
  UpdateDepartmentRequest
> {
  protected readonly tableName = "departments";

  /**
   * Zod schemas for validation and transformation
   */
  protected readonly publicSchema = z.object({
    id: commonSchemas.uuid,
    code: z.string(),
    name: z.string(),
    name_en: commonSchemas.optionalString,
    description: commonSchemas.optionalString,
    admission_year: z
      .number()
      .nullable()
      .optional()
      .transform((val) => val ?? undefined),
  });

  protected readonly createSchema = z.object({
    code: z.string(),
    name: z.string(),
    name_en: z.string().optional(),
    description: z.string().optional(),
    admission_year: z.number().optional(),
  });

  protected readonly updateSchema = z.object({
    code: z.string().optional(),
    name: z.string().optional(),
    name_en: z.string().optional(),
    description: z.string().optional(),
    admission_year: z.number().optional(),
    is_active: z.boolean().optional(),
  });

  async findAll(
    limit = 100,
    offset = 0,
    admissionYear?: number
  ): Promise<PaginatedResponse<DepartmentPublic>> {
    const [dataRows, countRows] = await Promise.all([
      db`
        SELECT id, code, name, name_en, description, admission_year
        FROM departments
        WHERE is_active = true
          AND (${admissionYear ?? null}::integer IS NULL OR admission_year = ${admissionYear ?? null})
        ORDER BY name
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      db`
        SELECT COUNT(*)::int as total
        FROM departments
        WHERE is_active = true
          AND (${admissionYear ?? null}::integer IS NULL OR admission_year = ${admissionYear ?? null})
      `,
    ]);

    const total = this.extractTotal(countRows);
    const data = this.parseMany(dataRows);

    return this.createPaginatedResponse(data, total, limit, offset);
  }

  async findById(id: string): Promise<DepartmentPublic | null> {
    const [department] = await db`
      SELECT id, code, name, name_en, description, admission_year
      FROM departments
      WHERE id = ${id} AND is_active = true
    `;
    return department ? this.parseOne(department) : null;
  }

  async findByCode(code: string): Promise<Department | undefined> {
    const [department] = await db`
      SELECT * FROM get_department_by_code(${code})
    `;
    return department;
  }

  async getSummary(): Promise<any> {
    const [summary] = await db`
      SELECT * FROM v_departments_summary
    `;
    return summary;
  }

  async create(data: CreateDepartmentRequest): Promise<DepartmentPublic> {
    if (data.admission_year !== undefined) {
      await new AdmissionYearsService().ensureActive(data.admission_year);
    }
    const [department] = await db`
      INSERT INTO departments (code, name, name_en, description, admission_year)
      VALUES (${data.code}, ${data.name}, ${data.name_en}, ${data.description}, ${data.admission_year})
      RETURNING id, code, name, name_en, description, admission_year
    `;

    return this.parseOne(department);
  }

  async update(
    id: string,
    data: UpdateDepartmentRequest
  ): Promise<DepartmentPublic> {
    if (data.admission_year !== undefined) {
      await new AdmissionYearsService().ensureActive(data.admission_year);
    }
    const [department] = await db`
      UPDATE departments
      SET
        code = COALESCE(${data.code}, code),
        name = COALESCE(${data.name}, name),
        name_en = COALESCE(${data.name_en}, name_en),
        description = COALESCE(${data.description}, description),
        admission_year = COALESCE(${data.admission_year}, admission_year),
        is_active = COALESCE(${data.is_active}, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND is_active = true
      RETURNING id, code, name, name_en, description, admission_year
    `;

    return this.parseOne(department);
  }

  async delete(id: string): Promise<void> {
    await db`
      SELECT delete_department_with_validation(${id})
    `;
  }
}
