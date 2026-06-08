CREATE TABLE IF NOT EXISTS admission_years (
    year INTEGER PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admission_years (year, label, is_active)
VALUES
    (2024, 'Năm tuyển sinh 2024', false),
    (2025, 'Năm tuyển sinh 2025', true),
    (2026, 'Năm tuyển sinh 2026', true)
ON CONFLICT (year) DO NOTHING;

ALTER TABLE departments
    ADD COLUMN IF NOT EXISTS admission_year INTEGER REFERENCES admission_years(year);

ALTER TABLE programs
    ADD COLUMN IF NOT EXISTS admission_year INTEGER REFERENCES admission_years(year);

ALTER TABLE faq_topics
    ADD COLUMN IF NOT EXISTS admission_year INTEGER REFERENCES admission_years(year);

ALTER TABLE faq_sub_topics
    ADD COLUMN IF NOT EXISTS admission_year INTEGER REFERENCES admission_years(year);

ALTER TABLE faq_questions
    ADD COLUMN IF NOT EXISTS admission_year INTEGER REFERENCES admission_years(year);

CREATE INDEX IF NOT EXISTS idx_departments_admission_year ON departments(admission_year);
CREATE INDEX IF NOT EXISTS idx_programs_admission_year ON programs(admission_year);
CREATE INDEX IF NOT EXISTS idx_faq_topics_admission_year ON faq_topics(admission_year);
CREATE INDEX IF NOT EXISTS idx_faq_sub_topics_admission_year ON faq_sub_topics(admission_year);
CREATE INDEX IF NOT EXISTS idx_faq_questions_admission_year ON faq_questions(admission_year);
