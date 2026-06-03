-- =====================================================
-- DEPARTMENT VIEWS
-- Purpose: Views for department-related queries
-- =====================================================

-- Note: v_departments_with_stats removed - unused complex statistics view

-- Departments summary view
CREATE OR REPLACE VIEW v_departments_summary AS
SELECT
    COUNT(*) as total_departments,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_departments_month,
    (SELECT COUNT(*) FROM programs WHERE is_active = true) as total_programs,
    AVG((SELECT COUNT(*) FROM programs p WHERE p.department_id = d.id AND p.is_active = true)) as avg_programs_per_dept
FROM departments d
WHERE d.is_active = true;

-- Note: v_active_departments removed - unused complex activity tracking view

-- Note: get_departments_with_stats() removed - unused function

-- Get departments with pagination (optimized for API)
CREATE OR REPLACE FUNCTION get_departments_with_pagination(
    limit_results INTEGER DEFAULT 100,
    offset_results INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    code VARCHAR(10),
    name VARCHAR(100),
    name_en VARCHAR(100),
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id, d.code, d.name, d.name_en, d.description
    FROM departments d
    WHERE d.is_active = true
    ORDER BY d.name
    LIMIT limit_results
    OFFSET offset_results;
END;
$$ LANGUAGE plpgsql;

-- Get total count of active departments
-- Optimized SQL function for simple, stable count operation
CREATE OR REPLACE FUNCTION get_departments_count()
RETURNS BIGINT
LANGUAGE SQL
STABLE
PARALLEL SAFE
AS $$
    SELECT COUNT(*)::BIGINT
    FROM departments
    WHERE is_active = true;
$$;

-- Get department by ID
CREATE OR REPLACE FUNCTION get_department_by_id(department_id UUID)
RETURNS TABLE (
    id UUID,
    code VARCHAR(10),
    name VARCHAR(100),
    name_en VARCHAR(100),
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id, d.code, d.name, d.name_en, d.description
    FROM departments d
    WHERE d.id = department_id AND d.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Get department by code
CREATE OR REPLACE FUNCTION get_department_by_code(department_code VARCHAR(10))
RETURNS TABLE (
    id UUID,
    code VARCHAR(10),
    name VARCHAR(100),
    name_en VARCHAR(100),
    description TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id, d.code, d.name, d.name_en, d.description, d.is_active, d.created_at, d.updated_at
    FROM departments d
    WHERE d.code = department_code AND d.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create department with validation
CREATE OR REPLACE FUNCTION create_department_with_validation(
    d_code VARCHAR(10),
    d_name VARCHAR(100),
    d_name_en VARCHAR(100) DEFAULT NULL,
    d_description TEXT DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    code VARCHAR(10),
    name VARCHAR(100),
    name_en VARCHAR(100),
    description TEXT
) AS $$
DECLARE
    new_department_id UUID;
BEGIN
    -- Check if department code already exists
    IF EXISTS (SELECT 1 FROM departments WHERE departments.code = d_code) THEN
        RAISE EXCEPTION 'Department with code % already exists', d_code USING ERRCODE = 'D0001';
    END IF;

    -- Insert new department
    INSERT INTO departments (code, name, name_en, description)
    VALUES (d_code, d_name, d_name_en, d_description)
    RETURNING departments.id INTO new_department_id;

    -- Return created department
    RETURN QUERY
    SELECT * FROM get_department_by_id(new_department_id);
END;
$$ LANGUAGE plpgsql;

-- Update department with validation
CREATE OR REPLACE FUNCTION update_department_with_validation(
    d_id UUID,
    d_code VARCHAR(10) DEFAULT NULL,
    d_name VARCHAR(100) DEFAULT NULL,
    d_name_en VARCHAR(100) DEFAULT NULL,
    d_description TEXT DEFAULT NULL,
    d_is_active BOOLEAN DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    code VARCHAR(10),
    name VARCHAR(100),
    name_en VARCHAR(100),
    description TEXT
) AS $$
BEGIN
    -- Check if department exists
    IF NOT EXISTS (SELECT 1 FROM departments WHERE departments.id = d_id AND is_active = true) THEN
        RAISE EXCEPTION 'Department not found' USING ERRCODE = 'D0002';
    END IF;

    -- Check if code is unique (if provided and different)
    IF d_code IS NOT NULL AND EXISTS (
        SELECT 1 FROM departments
        WHERE departments.code = d_code AND departments.id != d_id
    ) THEN
        RAISE EXCEPTION 'Department with code % already exists', d_code USING ERRCODE = 'D0001';
    END IF;

    -- Update department
    UPDATE departments
    SET
        code = COALESCE(d_code, departments.code),
        name = COALESCE(d_name, departments.name),
        name_en = COALESCE(d_name_en, departments.name_en),
        description = COALESCE(d_description, departments.description),
        is_active = COALESCE(d_is_active, departments.is_active),
        updated_at = CURRENT_TIMESTAMP
    WHERE departments.id = d_id;

    -- Return updated department
    RETURN QUERY
    SELECT * FROM get_department_by_id(d_id);
END;
$$ LANGUAGE plpgsql;

-- Delete department with validation
CREATE OR REPLACE FUNCTION delete_department_with_validation(d_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if department exists
    IF NOT EXISTS (SELECT 1 FROM departments WHERE id = d_id AND is_active = true) THEN
        RAISE EXCEPTION 'Department not found' USING ERRCODE = 'D0002';
    END IF;

    -- Check if department has active programs
    IF EXISTS (SELECT 1 FROM programs WHERE department_id = d_id AND is_active = true) THEN
        RAISE EXCEPTION 'Cannot delete department with active programs' USING ERRCODE = 'D0003';
    END IF;

    -- Soft delete department
    UPDATE departments
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = d_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
