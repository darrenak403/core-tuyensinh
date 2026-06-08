import type {
  AdmissionYear,
  CreateAdmissionYearRequest,
  UpdateAdmissionYearRequest,
} from "@app-types/admission-years";
import { db } from "@config/database";
import {
  admissionYearNumberSchema,
  createAdmissionYearSchema,
  updateAdmissionYearSchema,
} from "@schemas/admission-years";

export class AdmissionYearsService {
  async findAll(): Promise<AdmissionYear[]> {
    return db<AdmissionYear[]>`
      SELECT year, label, is_active, created_at
      FROM admission_years
      ORDER BY year DESC
    `;
  }

  async findByYear(year: number): Promise<AdmissionYear | null> {
    const [row] = await db<AdmissionYear[]>`
      SELECT year, label, is_active, created_at
      FROM admission_years
      WHERE year = ${year}
    `;
    return row ?? null;
  }

  async ensureActive(year: number): Promise<void> {
    const row = await this.findByYear(year);
    if (!row) {
      throw new Error(
        `Năm ${year} không tồn tại trong hệ thống. Vui lòng tạo năm trước.`
      );
    }
    if (!row.is_active) {
      throw new Error(`Năm ${year} đã bị vô hiệu hóa, không thể thêm dữ liệu`);
    }
  }

  async create(data: CreateAdmissionYearRequest): Promise<AdmissionYear> {
    const validated = createAdmissionYearSchema.parse(data);
    const existing = await this.findByYear(validated.year);
    if (existing) {
      throw new Error(`Năm ${validated.year} đã tồn tại`);
    }

    const [row] = await db<AdmissionYear[]>`
      INSERT INTO admission_years (year, label, is_active)
      VALUES (
        ${validated.year},
        ${validated.label ?? `Năm tuyển sinh ${validated.year}`},
        ${validated.is_active ?? true}
      )
      RETURNING year, label, is_active, created_at
    `;
    return row;
  }

  async update(
    yearParam: number,
    data: UpdateAdmissionYearRequest
  ): Promise<AdmissionYear> {
    const year = admissionYearNumberSchema.parse(yearParam);
    const validated = updateAdmissionYearSchema.parse(data);
    const existing = await this.findByYear(year);
    if (!existing) {
      throw new Error(`Năm ${year} không tồn tại`);
    }

    const [row] = await db<AdmissionYear[]>`
      UPDATE admission_years
      SET
        label = COALESCE(${validated.label}, label),
        is_active = COALESCE(${validated.is_active}, is_active)
      WHERE year = ${year}
      RETURNING year, label, is_active, created_at
    `;
    return row;
  }

  async delete(yearParam: number): Promise<void> {
    const year = admissionYearNumberSchema.parse(yearParam);
    const existing = await this.findByYear(year);
    if (!existing) {
      throw new Error(`Năm ${year} không tồn tại`);
    }

    const relatedChecks = await Promise.all([
      db`SELECT 1 FROM departments WHERE admission_year = ${year} LIMIT 1`,
      db`SELECT 1 FROM programs WHERE admission_year = ${year} LIMIT 1`,
      db`SELECT 1 FROM scholarships WHERE year = ${year} LIMIT 1`,
      db`SELECT 1 FROM admission_methods WHERE year = ${year} LIMIT 1`,
      db`SELECT 1 FROM faq_topics WHERE admission_year = ${year} LIMIT 1`,
      db`SELECT 1 FROM faq_sub_topics WHERE admission_year = ${year} LIMIT 1`,
      db`SELECT 1 FROM faq_questions WHERE admission_year = ${year} LIMIT 1`,
      db`SELECT 1 FROM progressive_tuition WHERE year = ${year} LIMIT 1`,
    ]);

    if (relatedChecks.some((rows) => rows.length > 0)) {
      throw new Error(`Không thể xóa năm ${year} vì đang có dữ liệu liên quan`);
    }

    await db`DELETE FROM admission_years WHERE year = ${year}`;
  }
}
