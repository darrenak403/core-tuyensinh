-- =====================================================
-- TUITION VIEWS
-- Purpose: Views for tuition fee queries and calculations
-- =====================================================

-- Comprehensive tuition view with program and campus details
CREATE OR REPLACE VIEW v_tuition_summary AS
SELECT 
    pt.id,
    pt.year,
    
    -- Program information
    p.id as program_id,
    p.code as program_code,
    p.name as program_name,
    p.name_en as program_name_en,
    
    -- Department information
    d.id as department_id,
    d.code as department_code,
    d.name as department_name,
    d.name_en as department_name_en,
    
    -- Campus information
    c.id as campus_id,
    c.code as campus_code,
    c.name as campus_name,
    c.city as campus_city,
    c.discount_percentage as campus_discount,
    
    -- Progressive tuition fees
    pt.semester_group_1_3_fee,
    pt.semester_group_4_6_fee,
    pt.semester_group_7_9_fee,
    
    -- Calculated totals
    (pt.semester_group_1_3_fee * 3 + pt.semester_group_4_6_fee * 3 + pt.semester_group_7_9_fee * 3) as total_program_fee,
    
    -- Fee ranges for quick reference
    pt.semester_group_1_3_fee as min_semester_fee,
    pt.semester_group_7_9_fee as max_semester_fee,
    
    -- Status and timestamps
    pt.is_active,
    pt.created_at,
    pt.updated_at
    
FROM progressive_tuition pt
INNER JOIN programs p ON pt.program_id = p.id
INNER JOIN departments d ON p.department_id = d.id
INNER JOIN campuses c ON pt.campus_id = c.id
WHERE pt.is_active = true
  AND p.is_active = true
  AND c.is_active = true
ORDER BY d.name, p.name, c.name;

-- Tuition comparison view for easy fee comparison across campuses
CREATE OR REPLACE VIEW v_tuition_comparison AS
SELECT 
    p.code as program_code,
    p.name as program_name,
    d.name as department_name,
    pt.year,
    
    -- Campus fees grouped
    json_agg(
        json_build_object(
            'campus_code', c.code,
            'campus_name', c.name,
            'city', c.city,
            'discount_percentage', c.discount_percentage,
            'semester_1_3_fee', pt.semester_group_1_3_fee,
            'semester_4_6_fee', pt.semester_group_4_6_fee,
            'semester_7_9_fee', pt.semester_group_7_9_fee,
            'total_program_fee', (pt.semester_group_1_3_fee * 3 + pt.semester_group_4_6_fee * 3 + pt.semester_group_7_9_fee * 3)
        ) ORDER BY c.name
    ) as campus_fees,
    
    -- Min/Max fees across all campuses for this program
    min(pt.semester_group_1_3_fee) as min_semester_fee,
    max(pt.semester_group_7_9_fee) as max_semester_fee,
    min(pt.semester_group_1_3_fee * 3 + pt.semester_group_4_6_fee * 3 + pt.semester_group_7_9_fee * 3) as min_total_fee,
    max(pt.semester_group_1_3_fee * 3 + pt.semester_group_4_6_fee * 3 + pt.semester_group_7_9_fee * 3) as max_total_fee
    
FROM progressive_tuition pt
JOIN programs p ON pt.program_id = p.id
JOIN departments d ON p.department_id = d.id
JOIN campuses c ON pt.campus_id = c.id
WHERE pt.is_active = true
  AND p.is_active = true
  AND c.is_active = true
GROUP BY p.id, p.code, p.name, d.name, pt.year
ORDER BY d.name, p.name;

-- Campus tuition summary for campus-specific queries
CREATE OR REPLACE VIEW v_campus_tuition_summary AS
SELECT 
    c.id as campus_id,
    c.code as campus_code,
    c.name as campus_name,
    c.city as campus_city,
    c.discount_percentage,
    pt.year,
    
    -- Program count and fee statistics
    count(pt.id) as total_programs,
    count(DISTINCT d.id) as total_departments,
    
    -- Fee statistics
    min(pt.semester_group_1_3_fee) as min_semester_fee,
    max(pt.semester_group_7_9_fee) as max_semester_fee,
    avg(pt.semester_group_1_3_fee) as avg_semester_1_3_fee,
    avg(pt.semester_group_4_6_fee) as avg_semester_4_6_fee,
    avg(pt.semester_group_7_9_fee) as avg_semester_7_9_fee,
    
    -- Available programs
    json_agg(
        json_build_object(
            'program_code', p.code,
            'program_name', p.name,
            'department_name', d.name,
            'semester_1_3_fee', pt.semester_group_1_3_fee,
            'semester_4_6_fee', pt.semester_group_4_6_fee,
            'semester_7_9_fee', pt.semester_group_7_9_fee
        ) ORDER BY d.name, p.name
    ) as programs
    
FROM campuses c
JOIN progressive_tuition pt ON c.id = pt.campus_id
JOIN programs p ON pt.program_id = p.id
JOIN departments d ON p.department_id = d.id
WHERE pt.is_active = true
  AND p.is_active = true
  AND c.is_active = true
GROUP BY c.id, c.code, c.name, c.city, c.discount_percentage, pt.year
ORDER BY c.name;

-- =====================================================
-- TUITION FUNCTIONS (for complex queries only)
-- =====================================================

-- Function to get tuition with custom filters and calculations
-- Returns full v_tuition_summary record for consistency
CREATE OR REPLACE FUNCTION get_tuition_with_filters(
    p_program_codes text[] DEFAULT NULL,
    p_campus_codes text[] DEFAULT NULL,
    p_year integer DEFAULT 2025,
    p_include_inactive boolean DEFAULT false
)
RETURNS SETOF v_tuition_summary -- Return type is the view itself
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM v_tuition_summary vts
    WHERE vts.year = p_year
      AND (p_include_inactive OR vts.is_active = true)
      AND (p_program_codes IS NULL OR vts.program_code = ANY(p_program_codes))
      AND (p_campus_codes IS NULL OR vts.campus_code = ANY(p_campus_codes))
    ORDER BY vts.department_name, vts.program_name, vts.campus_name;
END;
$$;

-- Function to calculate total cost including preparation fees
CREATE OR REPLACE FUNCTION calculate_total_program_cost(
    p_program_code text,
    p_campus_code text,
    p_year integer DEFAULT 2025,
    p_has_ielts boolean DEFAULT false
)
RETURNS TABLE (
    program_fee numeric,
    preparation_fees numeric,
    total_cost numeric,
    cost_breakdown jsonb
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_program_id uuid;
    v_campus_id uuid;
    v_tuition_total numeric;
    v_orientation_fee numeric := 0;
    v_english_prep_fee numeric := 0;
    v_english_periods integer := 0;
BEGIN
    -- Get IDs
    SELECT p.id INTO v_program_id FROM programs p WHERE p.code = p_program_code;
    SELECT c.id INTO v_campus_id FROM campuses c WHERE c.code = p_campus_code;

    IF v_program_id IS NULL OR v_campus_id IS NULL THEN
        RAISE EXCEPTION 'Program or campus not found';
    END IF;

    -- Get tuition total
    SELECT (semester_group_1_3_fee * 3 + semester_group_4_6_fee * 3 + semester_group_7_9_fee * 3)
    INTO v_tuition_total
    FROM progressive_tuition
    WHERE program_id = v_program_id AND campus_id = v_campus_id AND year = p_year;

    -- Get preparation fees
    SELECT fee INTO v_orientation_fee
    FROM preparation_fees
    WHERE campus_id = v_campus_id AND year = p_year AND fee_type = 'orientation';

    -- English prep fee (if no IELTS 6.0+)
    IF NOT p_has_ielts THEN
        SELECT fee INTO v_english_prep_fee
        FROM preparation_fees
        WHERE campus_id = v_campus_id AND year = p_year AND fee_type = 'english_prep';

        v_english_periods := 6; -- Maximum periods
        v_english_prep_fee := COALESCE(v_english_prep_fee, 0) * v_english_periods;
    END IF;

    RETURN QUERY
    SELECT
        COALESCE(v_tuition_total, 0),
        COALESCE(v_orientation_fee, 0) + COALESCE(v_english_prep_fee, 0),
        COALESCE(v_tuition_total, 0) + COALESCE(v_orientation_fee, 0) + COALESCE(v_english_prep_fee, 0),
        jsonb_build_object(
            'tuition_total', COALESCE(v_tuition_total, 0),
            'orientation_fee', COALESCE(v_orientation_fee, 0),
            'english_prep_fee', COALESCE(v_english_prep_fee, 0),
            'english_periods', v_english_periods,
            'has_ielts_exemption', p_has_ielts
        );
END;
$$;

-- =====================================================
-- TUITION VALIDATION FUNCTIONS (for CRUD operations)
-- =====================================================

-- Get tuition by ID with full details
CREATE OR REPLACE FUNCTION get_tuition_by_id_with_details(tuition_id UUID)
RETURNS TABLE (
    id UUID,
    year INTEGER,
    program_id UUID,
    program_code TEXT,
    program_name TEXT,
    program_name_en TEXT,
    department_id UUID,
    department_code TEXT,
    department_name TEXT,
    department_name_en TEXT,
    campus_id UUID,
    campus_code TEXT,
    campus_name TEXT,
    campus_city TEXT,
    campus_discount NUMERIC,
    semester_group_1_3_fee NUMERIC,
    semester_group_4_6_fee NUMERIC,
    semester_group_7_9_fee NUMERIC,
    total_program_fee NUMERIC,
    min_semester_fee NUMERIC,
    max_semester_fee NUMERIC,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vs.id,
        vs.year,
        vs.program_id,
        vs.program_code::TEXT,
        vs.program_name::TEXT,
        vs.program_name_en::TEXT,
        vs.department_id,
        vs.department_code::TEXT,
        vs.department_name::TEXT,
        vs.department_name_en::TEXT,
        vs.campus_id,
        vs.campus_code::TEXT,
        vs.campus_name::TEXT,
        vs.campus_city::TEXT,
        vs.campus_discount,
        vs.semester_group_1_3_fee,
        vs.semester_group_4_6_fee,
        vs.semester_group_7_9_fee,
        vs.total_program_fee,
        vs.min_semester_fee,
        vs.max_semester_fee,
        vs.is_active,
        vs.created_at,
        vs.updated_at
    FROM v_tuition_summary vs
    WHERE vs.id = tuition_id;
END;
$$;
