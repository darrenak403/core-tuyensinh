-- =====================================================
-- MATERIALIZED VIEWS AND SEARCH OPTIMIZATION
-- Purpose: Performance-optimized views and search indexes
-- Note: This file loads LAST to ensure all dependencies exist
-- =====================================================

-- Program search materialized view for full-text search
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_program_search AS
SELECT 
    p.id,
    p.code,
    p.name,
    p.name_en,
    p.department_id,
    p.duration_years,
    d.code as dept_code,
    d.name as dept_name,
    d.name_en as dept_name_en,
    -- Full-text search vector
    to_tsvector('english', 
        COALESCE(p.name, '') || ' ' || 
        COALESCE(p.name_en, '') || ' ' || 
        COALESCE(d.name, '') || ' ' || 
        COALESCE(d.name_en, '') || ' ' ||
        COALESCE(p.code, '') || ' ' ||
        COALESCE(d.code, '')
    ) as search_vector
FROM programs p
INNER JOIN departments d ON p.department_id = d.id
WHERE p.is_active = true AND d.is_active = true;

-- Campus program availability materialized view (for future use)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_campus_programs AS
SELECT 
    c.id as campus_id,
    c.code as campus_code,
    c.name as campus_name,
    c.city,
    p.id as program_id,
    p.code as program_code,
    p.name as program_name,
    d.code as dept_code,
    d.name as dept_name,
    pca.is_available,
    pca.year
FROM campuses c
INNER JOIN program_campus_availability pca ON c.id = pca.campus_id
INNER JOIN programs p ON pca.program_id = p.id
INNER JOIN departments d ON p.department_id = d.id
WHERE c.is_active = true 
  AND p.is_active = true 
  AND d.is_active = true
  AND pca.is_available = true;

-- =====================================================
-- PERFORMANCE INDEXES FOR MATERIALIZED VIEWS
-- =====================================================

-- Program search indexes
CREATE INDEX IF NOT EXISTS idx_mv_program_search_vector 
ON mv_program_search USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_mv_program_search_code 
ON mv_program_search(code);

CREATE INDEX IF NOT EXISTS idx_mv_program_search_dept 
ON mv_program_search(dept_code);

-- Campus programs indexes
CREATE INDEX IF NOT EXISTS idx_mv_campus_programs_campus 
ON mv_campus_programs(campus_code);

CREATE INDEX IF NOT EXISTS idx_mv_campus_programs_program 
ON mv_campus_programs(program_code);

CREATE INDEX IF NOT EXISTS idx_mv_campus_programs_dept 
ON mv_campus_programs(dept_code);

CREATE INDEX IF NOT EXISTS idx_mv_campus_programs_year 
ON mv_campus_programs(year);

-- =====================================================
-- REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- =====================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_program_search;
    REFRESH MATERIALIZED VIEW mv_campus_programs;
    
    -- Log refresh
    RAISE NOTICE 'All materialized views refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to refresh search views only (faster)
CREATE OR REPLACE FUNCTION refresh_search_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_program_search;
    RAISE NOTICE 'Search materialized views refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;
