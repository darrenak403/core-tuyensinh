import { describe, expect, it } from "bun:test";

describe("Departments year-scoped CRUD contract", () => {
  it("qualifies department columns in update statements", async () => {
    const service = await Bun.file(
      "src/services/departments.service.ts"
    ).text();

    expect(service).toContain("COALESCE(${data.code}, departments.code)");
    expect(service).toContain("WHERE departments.id = ${id}");
    expect(service).toContain("departments.admission_year");
  });

  it("migrates global code uniqueness to year-scoped uniqueness", async () => {
    const migration = await Bun.file(
      "src/database/schema/11_year_scoped_uniques.sql"
    ).text();

    expect(migration).toContain(
      "ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_code_key"
    );
    expect(migration).toContain("departments_code_admission_year_key");
    expect(migration).toContain(
      "ON departments (code, (COALESCE(admission_year, 0)))"
    );
  });

  it("maps Postgres unique violations to conflict responses", async () => {
    const middleware = await Bun.file(
      "src/middleware/error.middleware.ts"
    ).text();

    expect(middleware).toContain('err.code === "23505"');
    expect(middleware).toContain('code: "CONFLICT"');
    expect(middleware).toContain("Resource already exists");
  });
});
