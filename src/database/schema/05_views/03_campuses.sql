-- =====================================================
-- CAMPUS VIEWS
-- Purpose: Views for campus-related queries
-- =====================================================

-- Campus summary view (for analytics/dashboard)
CREATE OR REPLACE VIEW v_campuses_summary AS
SELECT
    COUNT(*) as total_campuses,
    ROUND(AVG(discount_percentage), 2) as avg_discount,
    COUNT(*) FILTER (WHERE discount_percentage > 0) as campuses_with_discount,
    (SELECT COUNT(DISTINCT program_id) FROM program_campus_availability WHERE is_available = true) as total_available_programs,
    (SELECT COUNT(DISTINCT campus_id) FROM preparation_fees WHERE is_active = true AND year = 2025) as preparation_fees_configured
FROM campuses
WHERE is_active = true;

-- Note: v_campuses_with_foundation_fees view removed as it's not used
-- Raw queries in service provide better performance and flexibility

-- =====================================================
-- CAMPUS FUNCTIONS
-- =====================================================

-- Get total count of active campuses
-- Optimized SQL function for simple, stable count operation
CREATE OR REPLACE FUNCTION get_campuses_count()
RETURNS BIGINT
LANGUAGE SQL
STABLE
PARALLEL SAFE
AS $$
    SELECT COUNT(*)::BIGINT
    FROM campuses
    WHERE is_active = true;
$$;

-- Get campuses with details (preparation fees + programs) for pagination
-- Using PL/pgSQL for maintainability and future extensibility
CREATE OR REPLACE FUNCTION get_campuses_with_details(
    year_filter INTEGER DEFAULT 2025,
    limit_results INTEGER DEFAULT 100,
    offset_results INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    code VARCHAR(10),
    name VARCHAR(255),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    discount_percentage DECIMAL(5,2),
    year INTEGER,
    orientation_fee DECIMAL(15,2),
    english_prep_fee DECIMAL(15,2),
    orientation_description TEXT,
    english_prep_description TEXT,
    available_programs_count BIGINT,
    available_program_codes VARCHAR[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id, c.code, c.name, c.city, c.address, c.phone, c.email, c.discount_percentage,
        year_filter as year,
        pf_orient.fee as orientation_fee,
        pf_english.fee as english_prep_fee,
        pf_orient.description as orientation_description,
        pf_english.description as english_prep_description,
        COALESCE(COUNT(pca.program_id), 0) as available_programs_count,
        COALESCE(array_agg(DISTINCT p.code ORDER BY p.code) FILTER (WHERE pca.is_available = true AND p.code IS NOT NULL), ARRAY[]::varchar[]) as available_program_codes
    FROM campuses c
    LEFT JOIN preparation_fees pf_orient ON c.id = pf_orient.campus_id
        AND pf_orient.year = year_filter
        AND pf_orient.fee_type = 'orientation'
        AND pf_orient.is_active = true
    LEFT JOIN preparation_fees pf_english ON c.id = pf_english.campus_id
        AND pf_english.year = year_filter
        AND pf_english.fee_type = 'english_prep'
        AND pf_english.is_active = true
    LEFT JOIN program_campus_availability pca ON c.id = pca.campus_id AND pca.is_available = true AND pca.year = year_filter
    LEFT JOIN programs p ON pca.program_id = p.id AND p.is_active = true
    WHERE c.is_active = true
    GROUP BY c.id, c.code, c.name, c.city, c.address, c.phone, c.email, c.discount_percentage,
             pf_orient.fee, pf_english.fee, pf_orient.description, pf_english.description
    ORDER BY c.name
    LIMIT limit_results
    OFFSET offset_results;
END;
$$ LANGUAGE plpgsql;

-- Get single campus with details by ID
-- Using PL/pgSQL for maintainability and future extensibility
CREATE OR REPLACE FUNCTION get_campus_with_details_by_id(
    input_campus_id UUID,
    year_filter INTEGER DEFAULT 2025
) RETURNS TABLE (
    id UUID,
    code VARCHAR(10),
    name VARCHAR(255),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    discount_percentage DECIMAL(5,2),
    year INTEGER,
    orientation_fee DECIMAL(15,2),
    english_prep_fee DECIMAL(15,2),
    orientation_description TEXT,
    english_prep_description TEXT,
    available_programs_count BIGINT,
    available_program_codes VARCHAR[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id, c.code, c.name, c.city, c.address, c.phone, c.email, c.discount_percentage,
        year_filter as year,
        pf_orient.fee as orientation_fee,
        pf_english.fee as english_prep_fee,
        pf_orient.description as orientation_description,
        pf_english.description as english_prep_description,
        COALESCE(COUNT(pca.program_id), 0) as available_programs_count,
        COALESCE(array_agg(DISTINCT p.code ORDER BY p.code) FILTER (WHERE pca.is_available = true AND p.code IS NOT NULL), ARRAY[]::varchar[]) as available_program_codes
    FROM campuses c
    LEFT JOIN preparation_fees pf_orient ON c.id = pf_orient.campus_id
        AND pf_orient.year = year_filter
        AND pf_orient.fee_type = 'orientation'
        AND pf_orient.is_active = true
    LEFT JOIN preparation_fees pf_english ON c.id = pf_english.campus_id
        AND pf_english.year = year_filter
        AND pf_english.fee_type = 'english_prep'
        AND pf_english.is_active = true
    LEFT JOIN program_campus_availability pca ON c.id = pca.campus_id AND pca.is_available = true AND pca.year = year_filter
    LEFT JOIN programs p ON pca.program_id = p.id AND p.is_active = true
    WHERE c.id = input_campus_id AND c.is_active = true
    GROUP BY c.id, c.code, c.name, c.city, c.address, c.phone, c.email, c.discount_percentage,
             pf_orient.fee, pf_english.fee, pf_orient.description, pf_english.description;
END;
$$ LANGUAGE plpgsql;

-- Create campus with validation
CREATE OR REPLACE FUNCTION create_campus_with_validation(
    campus_code VARCHAR(10),
    campus_name VARCHAR(255),
    campus_city VARCHAR(100),
    campus_address TEXT DEFAULT NULL,
    campus_phone VARCHAR(20) DEFAULT NULL,
    campus_email VARCHAR(100) DEFAULT NULL,
    campus_discount_percentage DECIMAL(5,2) DEFAULT 0
) RETURNS TABLE (
    id UUID,
    code VARCHAR(10),
    name VARCHAR(255),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    discount_percentage DECIMAL(5,2)
) AS $$
DECLARE
    new_campus_id UUID;
BEGIN
    -- Validate inputs
    IF campus_code IS NULL OR LENGTH(TRIM(campus_code)) = 0 THEN
        RAISE EXCEPTION 'Campus code cannot be empty';
    END IF;

    IF campus_name IS NULL OR LENGTH(TRIM(campus_name)) = 0 THEN
        RAISE EXCEPTION 'Campus name cannot be empty';
    END IF;

    IF campus_city IS NULL OR LENGTH(TRIM(campus_city)) = 0 THEN
        RAISE EXCEPTION 'Campus city cannot be empty';
    END IF;

    IF campus_discount_percentage < 0 OR campus_discount_percentage > 100 THEN
        RAISE EXCEPTION 'Discount percentage must be between 0 and 100';
    END IF;

    -- Check for duplicate code
    IF EXISTS (SELECT 1 FROM campuses WHERE code = campus_code) THEN
        RAISE EXCEPTION 'Campus with code % already exists', campus_code;
    END IF;

    -- Insert new campus
    INSERT INTO campuses (code, name, city, address, phone, email, discount_percentage)
    VALUES (campus_code, campus_name, campus_city, campus_address, campus_phone, campus_email, campus_discount_percentage)
    RETURNING campuses.id INTO new_campus_id;

    -- Return the created campus
    RETURN QUERY
    SELECT c.id, c.code, c.name, c.city, c.address, c.phone, c.email, c.discount_percentage
    FROM campuses c
    WHERE c.id = new_campus_id;
END;
$$ LANGUAGE plpgsql;

-- Update campus with validation
CREATE OR REPLACE FUNCTION update_campus_with_validation(
    campus_id UUID,
    campus_code VARCHAR(10) DEFAULT NULL,
    campus_name VARCHAR(255) DEFAULT NULL,
    campus_city VARCHAR(100) DEFAULT NULL,
    campus_address TEXT DEFAULT NULL,
    campus_phone VARCHAR(20) DEFAULT NULL,
    campus_email VARCHAR(100) DEFAULT NULL,
    campus_discount_percentage DECIMAL(5,2) DEFAULT NULL,
    campus_is_active BOOLEAN DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    code VARCHAR(10),
    name VARCHAR(255),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    discount_percentage DECIMAL(5,2)
) AS $$
BEGIN
    -- Check if campus exists
    IF NOT EXISTS (SELECT 1 FROM campuses WHERE campuses.id = campus_id) THEN
        RAISE EXCEPTION 'Campus with ID % not found', campus_id;
    END IF;

    -- Validate inputs if provided
    IF campus_discount_percentage IS NOT NULL AND (campus_discount_percentage < 0 OR campus_discount_percentage > 100) THEN
        RAISE EXCEPTION 'Discount percentage must be between 0 and 100';
    END IF;

    -- Check for duplicate code if updating code
    IF campus_code IS NOT NULL AND EXISTS (
        SELECT 1 FROM campuses
        WHERE code = campus_code AND campuses.id != campus_id
    ) THEN
        RAISE EXCEPTION 'Campus with code % already exists', campus_code;
    END IF;

    -- Update campus
    UPDATE campuses SET
        code = COALESCE(campus_code, campuses.code),
        name = COALESCE(campus_name, campuses.name),
        city = COALESCE(campus_city, campuses.city),
        address = COALESCE(campus_address, campuses.address),
        phone = COALESCE(campus_phone, campuses.phone),
        email = COALESCE(campus_email, campuses.email),
        discount_percentage = COALESCE(campus_discount_percentage, campuses.discount_percentage),
        is_active = COALESCE(campus_is_active, campuses.is_active),
        updated_at = CURRENT_TIMESTAMP
    WHERE campuses.id = campus_id;

    -- Return the updated campus
    RETURN QUERY
    SELECT c.id, c.code, c.name, c.city, c.address, c.phone, c.email, c.discount_percentage
    FROM campuses c
    WHERE c.id = campus_id AND c.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Delete campus with validation
CREATE OR REPLACE FUNCTION delete_campus_with_validation(campus_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Check if campus exists
    IF NOT EXISTS (SELECT 1 FROM campuses WHERE id = campus_id) THEN
        RAISE EXCEPTION 'Campus with ID % not found', campus_id;
    END IF;

    -- Check if campus has applications
    IF EXISTS (SELECT 1 FROM applications WHERE applications.campus_id = campus_id) THEN
        RAISE EXCEPTION 'Cannot delete campus with existing applications. Set is_active to false instead.';
    END IF;

    -- Soft delete by setting is_active to false
    UPDATE campuses SET
        is_active = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = campus_id;
END;
$$ LANGUAGE plpgsql;
