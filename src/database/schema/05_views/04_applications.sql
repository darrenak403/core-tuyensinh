-- =====================================================
-- APPLICATION VIEWS
-- Purpose: Views for application-related queries
-- =====================================================

-- Applications with program and campus info
CREATE OR REPLACE VIEW v_applications_with_details AS
SELECT
    a.id,
    a.application_code,
    a.student_name,
    a.email,
    a.phone,
    a.status,
    a.source,
    a.submitted_at,
    a.processed_at,
    -- Program info
    jsonb_build_object(
        'id', p.id,
        'code', p.code,
        'name', p.name,
        'name_en', p.name_en,
        'department', jsonb_build_object(
            'code', d.code,
            'name', d.name
        )
    ) as program,
    -- Campus info
    jsonb_build_object(
        'id', c.id,
        'code', c.code,
        'name', c.name,
        'city', c.city
    ) as campus
FROM applications a
INNER JOIN programs p ON a.program_id = p.id
INNER JOIN departments d ON p.department_id = d.id
INNER JOIN campuses c ON a.campus_id = c.id;

-- Application statistics view
CREATE OR REPLACE VIEW v_applications_stats AS
SELECT
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
    COUNT(*) FILTER (WHERE source = 'chatbot') as chatbot_applications,
    COUNT(*) FILTER (WHERE submitted_at >= CURRENT_DATE - INTERVAL '7 days') as recent_applications
FROM applications;

-- TODO: Add more application views as needed
-- - Applications by program
-- - Applications by campus  
-- - Applications by time period
-- - Conversion funnel analysis
