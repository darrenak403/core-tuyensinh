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
  });

  protected readonly createSchema = z.object({
    code: z.string(),
    name: z.string(),
    name_en: z.string().optional(),
    description: z.string().optional(),
  });

  protected readonly updateSchema = z.object({
    code: z.string().optional(),
    name: z.string().optional(),
    name_en: z.string().optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
  });

  async findAll(
    limit = 100,
    offset = 0
  ): Promise<PaginatedResponse<DepartmentPublic>> {
    const [dataRows, countRows] = await Promise.all([
      db`
        SELECT * FROM get_departments_with_pagination(
          ${limit},
          ${offset}
        )
      `,
      db`
        SELECT get_departments_count() as total
      `,
    ]);

    const total = this.extractTotal(countRows);
    const data = this.parseMany(dataRows);

    return this.createPaginatedResponse(data, total, limit, offset);
  }

  async findById(id: string): Promise<DepartmentPublic | null> {
    const [department] = await db`
      SELECT * FROM get_department_by_id(${id})
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
    const [department] = await db`
      SELECT * FROM create_department_with_validation(
        ${data.code},
        ${data.name},
        ${data.name_en},
        ${data.description}
      )
    `;

    return this.parseOne(department);
  }

  async update(
    id: string,
    data: UpdateDepartmentRequest
  ): Promise<DepartmentPublic> {
    const [department] = await db`
      SELECT * FROM update_department_with_validation(
        ${id},
        ${data.code},
        ${data.name},
        ${data.name_en},
        ${data.description},
        ${data.is_active}
      )
    `;

    return this.parseOne(department);
  }

  async delete(id: string): Promise<void> {
    await db`
      SELECT delete_department_with_validation(${id})
    `;
  }
}
