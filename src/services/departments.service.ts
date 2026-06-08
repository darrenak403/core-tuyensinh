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
import { ConflictError } from "@app-types/errors";
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
    await this.ensureCodeAvailable(data.code, data.admission_year);
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
    if (data.code !== undefined || data.admission_year !== undefined) {
      await this.ensureUpdatedCodeAvailable(id, data);
    }
    const [department] = await db`
      UPDATE departments
      SET
        code = COALESCE(${data.code}, departments.code),
        name = COALESCE(${data.name}, departments.name),
        name_en = COALESCE(${data.name_en}, departments.name_en),
        description = COALESCE(${data.description}, departments.description),
        admission_year = COALESCE(${data.admission_year}, departments.admission_year),
        is_active = COALESCE(${data.is_active}, departments.is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE departments.id = ${id} AND departments.is_active = true
      RETURNING
        departments.id,
        departments.code,
        departments.name,
        departments.name_en,
        departments.description,
        departments.admission_year
    `;

    return this.parseOne(department);
  }

  async delete(id: string): Promise<void> {
    await db`
      SELECT delete_department_with_validation(${id})
    `;
  }

  private async ensureCodeAvailable(
    code: string,
    admissionYear?: number,
    excludeId?: string
  ): Promise<void> {
    const [existing] = await db`
      SELECT id
      FROM departments
      WHERE code = ${code}
        AND admission_year IS NOT DISTINCT FROM ${admissionYear ?? null}
        AND (${excludeId ?? null}::uuid IS NULL OR id != ${excludeId ?? null})
      LIMIT 1
    `;

    if (existing) {
      throw new ConflictError(
        `Department with code '${code}' already exists for admission year ${admissionYear ?? "unspecified"}`
      );
    }
  }

  private async ensureUpdatedCodeAvailable(
    id: string,
    data: UpdateDepartmentRequest
  ): Promise<void> {
    const [current] = await db`
      SELECT code, admission_year
      FROM departments
      WHERE id = ${id} AND is_active = true
    `;
    if (!current) return;

    await this.ensureCodeAvailable(
      data.code ?? current.code,
      data.admission_year ?? current.admission_year ?? undefined,
      id
    );
  }
}
