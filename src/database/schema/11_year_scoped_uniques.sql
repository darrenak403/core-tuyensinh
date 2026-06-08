ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_code_key;
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_code_key;
ALTER TABLE scholarships DROP CONSTRAINT IF EXISTS scholarships_code_key;
ALTER TABLE admission_methods DROP CONSTRAINT IF EXISTS admission_methods_method_code_key;

CREATE UNIQUE INDEX IF NOT EXISTS departments_code_admission_year_key
ON departments (code, (COALESCE(admission_year, 0)));

CREATE UNIQUE INDEX IF NOT EXISTS programs_code_admission_year_key
ON programs (code, (COALESCE(admission_year, 0)));

CREATE UNIQUE INDEX IF NOT EXISTS scholarships_code_year_key
ON scholarships (code, year);

CREATE UNIQUE INDEX IF NOT EXISTS admission_methods_method_code_year_key
ON admission_methods (method_code, year);
