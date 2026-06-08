-- Recreate campus mutation functions with qualified column references.
-- In PL/pgSQL RETURNS TABLE functions, output columns such as "code" are
-- variables too, so unqualified table columns can become ambiguous.

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

    IF EXISTS (
        SELECT 1
        FROM campuses existing_campus
        WHERE existing_campus.code = campus_code
    ) THEN
        RAISE EXCEPTION 'Campus with code % already exists', campus_code;
    END IF;

    INSERT INTO campuses (code, name, city, address, phone, email, discount_percentage)
    VALUES (campus_code, campus_name, campus_city, campus_address, campus_phone, campus_email, campus_discount_percentage)
    RETURNING campuses.id INTO new_campus_id;

    RETURN QUERY
    SELECT c.id, c.code, c.name, c.city, c.address, c.phone, c.email, c.discount_percentage
    FROM campuses c
    WHERE c.id = new_campus_id;
END;
$$ LANGUAGE plpgsql;

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
    IF NOT EXISTS (
        SELECT 1
        FROM campuses existing_campus
        WHERE existing_campus.id = campus_id
    ) THEN
        RAISE EXCEPTION 'Campus with ID % not found', campus_id;
    END IF;

    IF campus_discount_percentage IS NOT NULL AND (campus_discount_percentage < 0 OR campus_discount_percentage > 100) THEN
        RAISE EXCEPTION 'Discount percentage must be between 0 and 100';
    END IF;

    IF campus_code IS NOT NULL AND EXISTS (
        SELECT 1
        FROM campuses existing_campus
        WHERE existing_campus.code = campus_code AND existing_campus.id != campus_id
    ) THEN
        RAISE EXCEPTION 'Campus with code % already exists', campus_code;
    END IF;

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

    RETURN QUERY
    SELECT c.id, c.code, c.name, c.city, c.address, c.phone, c.email, c.discount_percentage
    FROM campuses c
    WHERE c.id = campus_id AND c.is_active = true;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_campus_with_validation(campus_id UUID)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM campuses existing_campus
        WHERE existing_campus.id = campus_id
    ) THEN
        RAISE EXCEPTION 'Campus with ID % not found', campus_id;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM applications a
        WHERE a.campus_id = delete_campus_with_validation.campus_id
    ) THEN
        RAISE EXCEPTION 'Cannot delete campus with existing applications. Set is_active to false instead.';
    END IF;

    UPDATE campuses SET
        is_active = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE campuses.id = delete_campus_with_validation.campus_id;
END;
$$ LANGUAGE plpgsql;
