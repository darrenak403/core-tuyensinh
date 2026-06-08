-- Recreate campus delete function with a qualified parameter reference.
-- applications.campus_id conflicts with the campus_id argument in PL/pgSQL.

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
