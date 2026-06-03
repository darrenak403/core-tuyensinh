-- =====================================================
-- PROGRAM VIEWS
-- Purpose: Views for program-related queries
-- =====================================================

-- Note: v_programs_with_department removed - replaced by SQL functions for better performance

-- Programs summary view for quick stats
CREATE OR REPLACE VIEW v_programs_summary AS
SELECT
    COUNT(*) as total_programs,
    COUNT(DISTINCT department_id) as departments_count,
    AVG(duration_years) as avg_duration,
    COUNT(*) FILTER (WHERE duration_years = 4) as four_year_programs,
    COUNT(*) FILTER (WHERE duration_years = 3) as three_year_programs,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_programs_month
FROM programs
WHERE is_active = true;

-- Programs by department view
CREATE OR REPLACE VIEW v_programs_by_department AS
SELECT
    d.id as department_id,
    d.code as department_code,
    d.name as department_name,
    COUNT(p.id) as program_count,
    AVG(p.duration_years) as avg_duration,
    array_agg(p.code ORDER BY p.name) as program_codes
FROM departments d
LEFT JOIN programs p ON d.id = p.department_id AND p.is_active = true
WHERE d.is_active = true
GROUP BY d.id, d.code, d.name
ORDER BY d.name;

-- Note: v_recent_programs removed - unused feature, can be implemented with simple query if needed

-- Program functions
CREATE OR REPLACE FUNCTION get_programs_with_department(
    department_code_filter VARCHAR(10) DEFAULT NULL,
    limit_results INTEGER DEFAULT 100,
    offset_results INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    code VARCHAR(20),
    name VARCHAR(255),
    name_en VARCHAR(255),
    department_id UUID,
    duration_years INTEGER,
    dept_id UUID,
    dept_code VARCHAR(10),
    dept_name VARCHAR(100),
    dept_name_en VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id, p.code, p.name, p.name_en, p.department_id, p.duration_years,
        d.id as dept_id, d.code as dept_code, d.name as dept_name, d.name_en as dept_name_en
    FROM programs p
    INNER JOIN departments d ON p.department_id = d.id
    WHERE p.is_active = true
      AND d.is_active = true
      AND (department_code_filter IS NULL OR d.code = department_code_filter)
    ORDER BY p.name
    LIMIT limit_results
    OFFSET offset_results;
END;
$$ LANGUAGE plpgsql;

-- Get program by ID with department information
CREATE OR REPLACE FUNCTION get_program_by_id_with_department(program_id UUID)
RETURNS TABLE (
    id UUID,
    code VARCHAR(20),
    name VARCHAR(255),
    name_en VARCHAR(255),
    department_id UUID,
    duration_years INTEGER,
    dept_id UUID,
    dept_code VARCHAR(10),
    dept_name VARCHAR(100),
    dept_name_en VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id, p.code, p.name, p.name_en, p.department_id, p.duration_years,
        d.id as dept_id, d.code as dept_code, d.name as dept_name, d.name_en as dept_name_en
    FROM programs p
    INNER JOIN departments d ON p.department_id = d.id
    WHERE p.id = program_id
      AND p.is_active = true
      AND d.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Get program by code
CREATE OR REPLACE FUNCTION get_program_by_code(program_code VARCHAR(20))
RETURNS TABLE (
    id UUID,
    code VARCHAR(20),
    name VARCHAR(255),
    name_en VARCHAR(255),
    department_id UUID,
    duration_years INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id, p.code, p.name, p.name_en, p.department_id, p.duration_years, p.is_active, p.created_at, p.updated_at
    FROM programs p
    WHERE p.code = program_code AND p.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create program with validation
CREATE OR REPLACE FUNCTION create_program_with_validation(
    p_code VARCHAR(20),
    p_name VARCHAR(255),
    p_name_en VARCHAR(255) DEFAULT NULL,
    p_department_id UUID,
    p_duration_years INTEGER
) RETURNS TABLE (
    id UUID,
    code VARCHAR(20),
    name VARCHAR(255),
    name_en VARCHAR(255),
    department_id UUID,
    duration_years INTEGER,
    dept_id UUID,
    dept_code VARCHAR(10),
    dept_name VARCHAR(100),
    dept_name_en VARCHAR(100)
) AS $$
DECLARE
    new_program_id UUID;
BEGIN
    -- Check if department exists and is active
    IF NOT EXISTS (SELECT 1 FROM departments WHERE departments.id = p_department_id AND is_active = true) THEN
        RAISE EXCEPTION 'Department not found or inactive' USING ERRCODE = 'P0001';
    END IF;

    -- Check if program code already exists
    IF EXISTS (SELECT 1 FROM programs WHERE programs.code = p_code) THEN
        RAISE EXCEPTION 'Program with code % already exists', p_code USING ERRCODE = 'P0002';
    END IF;

    -- Insert new program
    INSERT INTO programs (code, name, name_en, department_id, duration_years)
    VALUES (p_code, p_name, p_name_en, p_department_id, p_duration_years)
    RETURNING programs.id INTO new_program_id;

    -- Return program with department info
    RETURN QUERY
    SELECT * FROM get_program_by_id_with_department(new_program_id);
END;
$$ LANGUAGE plpgsql;

-- Update program with validation
CREATE OR REPLACE FUNCTION update_program_with_validation(
    p_id UUID,
    p_code VARCHAR(20) DEFAULT NULL,
    p_name VARCHAR(255) DEFAULT NULL,
    p_name_en VARCHAR(255) DEFAULT NULL,
    p_department_id UUID DEFAULT NULL,
    p_duration_years INTEGER DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    code VARCHAR(20),
    name VARCHAR(255),
    name_en VARCHAR(255),
    department_id UUID,
    duration_years INTEGER,
    dept_id UUID,
    dept_code VARCHAR(10),
    dept_name VARCHAR(100),
    dept_name_en VARCHAR(100)
) AS $$
BEGIN
    -- Check if program exists
    IF NOT EXISTS (SELECT 1 FROM programs WHERE programs.id = p_id AND is_active = true) THEN
        RAISE EXCEPTION 'Program not found' USING ERRCODE = 'P0003';
    END IF;

    -- Check if department exists (if provided)
    IF p_department_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM departments WHERE departments.id = p_department_id AND is_active = true) THEN
        RAISE EXCEPTION 'Department not found or inactive' USING ERRCODE = 'P0001';
    END IF;

    -- Check if code is unique (if provided and different)
    IF p_code IS NOT NULL AND EXISTS (
        SELECT 1 FROM programs
        WHERE programs.code = p_code AND programs.id != p_id
    ) THEN
        RAISE EXCEPTION 'Program with code % already exists', p_code USING ERRCODE = 'P0002';
    END IF;

    -- Update program
    UPDATE programs
    SET
        code = COALESCE(p_code, programs.code),
        name = COALESCE(p_name, programs.name),
        name_en = COALESCE(p_name_en, programs.name_en),
        department_id = COALESCE(p_department_id, programs.department_id),
        duration_years = COALESCE(p_duration_years, programs.duration_years),
        is_active = COALESCE(p_is_active, programs.is_active),
        updated_at = CURRENT_TIMESTAMP
    WHERE programs.id = p_id;

    -- Return updated program with department info
    RETURN QUERY
    SELECT * FROM get_program_by_id_with_department(p_id);
END;
$$ LANGUAGE plpgsql;

-- Delete program with validation
CREATE OR REPLACE FUNCTION delete_program_with_validation(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if program exists
    IF NOT EXISTS (SELECT 1 FROM programs WHERE id = p_id AND is_active = true) THEN
        RAISE EXCEPTION 'Program not found' USING ERRCODE = 'P0003';
    END IF;

    -- Soft delete program
    UPDATE programs
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Get total count of active programs (with optional department filter)
-- Optimized SQL function for simple, stable count operation
CREATE OR REPLACE FUNCTION get_programs_count(
    department_code_filter VARCHAR(10) DEFAULT NULL
) RETURNS BIGINT
LANGUAGE SQL
STABLE
PARALLEL SAFE
AS $$
    SELECT COUNT(*)::BIGINT
    FROM programs p
    INNER JOIN departments d ON p.department_id = d.id
    WHERE p.is_active = true
      AND d.is_active = true
      AND (department_code_filter IS NULL OR d.code = department_code_filter);
$$;
