-- =====================================================
-- FAQ / KNOWLEDGE MANAGEMENT STORED FUNCTIONS
-- =====================================================


-- ============================================================
-- FAQ TOPICS
-- ============================================================

CREATE OR REPLACE FUNCTION get_faq_topics_with_pagination(
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    code VARCHAR,
    name VARCHAR,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.code, t.name, t.description, t.sort_order, t.is_active, t.created_at, t.updated_at
    FROM faq_topics t
    ORDER BY t.sort_order ASC, t.name ASC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_topics_count()
RETURNS BIGINT AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM faq_topics);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_topic_by_id(p_id UUID)
RETURNS TABLE (
    id UUID,
    code VARCHAR,
    name VARCHAR,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.code, t.name, t.description, t.sort_order, t.is_active, t.created_at, t.updated_at
    FROM faq_topics t
    WHERE t.id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_faq_topic(
    p_code VARCHAR,
    p_name VARCHAR,
    p_description TEXT DEFAULT NULL,
    p_sort_order INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    code VARCHAR,
    name VARCHAR,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
DECLARE
    v_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM faq_topics WHERE faq_topics.code = p_code) THEN
        RAISE EXCEPTION 'FAQ topic with code "%" already exists', p_code
            USING ERRCODE = 'unique_violation';
    END IF;

    INSERT INTO faq_topics (code, name, description, sort_order)
    VALUES (p_code, p_name, p_description, p_sort_order)
    RETURNING faq_topics.id INTO v_id;

    RETURN QUERY SELECT t.id, t.code, t.name, t.description, t.sort_order, t.is_active, t.created_at, t.updated_at
    FROM faq_topics t WHERE t.id = v_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_faq_topic(
    p_id UUID,
    p_code VARCHAR DEFAULT NULL,
    p_name VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_sort_order INTEGER DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    code VARCHAR,
    name VARCHAR,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_topics WHERE faq_topics.id = p_id) THEN
        RAISE EXCEPTION 'FAQ topic not found' USING ERRCODE = 'no_data_found';
    END IF;

    IF p_code IS NOT NULL AND EXISTS (SELECT 1 FROM faq_topics WHERE faq_topics.code = p_code AND faq_topics.id <> p_id) THEN
        RAISE EXCEPTION 'FAQ topic with code "%" already exists', p_code
            USING ERRCODE = 'unique_violation';
    END IF;

    UPDATE faq_topics SET
        code        = COALESCE(p_code, faq_topics.code),
        name        = COALESCE(p_name, faq_topics.name),
        description = COALESCE(p_description, faq_topics.description),
        sort_order  = COALESCE(p_sort_order, faq_topics.sort_order),
        is_active   = COALESCE(p_is_active, faq_topics.is_active),
        updated_at  = CURRENT_TIMESTAMP
    WHERE faq_topics.id = p_id;

    RETURN QUERY SELECT t.id, t.code, t.name, t.description, t.sort_order, t.is_active, t.created_at, t.updated_at
    FROM faq_topics t WHERE t.id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_faq_topic(p_id UUID)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_topics WHERE id = p_id) THEN
        RAISE EXCEPTION 'FAQ topic not found' USING ERRCODE = 'no_data_found';
    END IF;

    UPDATE faq_topics SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- FAQ SUB TOPICS
-- ============================================================

CREATE OR REPLACE FUNCTION get_faq_sub_topics_with_pagination(
    p_topic_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    topic_id UUID,
    name VARCHAR,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.topic_id, s.name, s.description, s.sort_order, s.is_active, s.created_at, s.updated_at
    FROM faq_sub_topics s
    WHERE (p_topic_id IS NULL OR s.topic_id = p_topic_id)
    ORDER BY s.sort_order ASC, s.name ASC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_sub_topics_count(p_topic_id UUID DEFAULT NULL)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM faq_sub_topics s
        WHERE (p_topic_id IS NULL OR s.topic_id = p_topic_id)
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_sub_topic_by_id(p_id UUID)
RETURNS TABLE (
    id UUID,
    topic_id UUID,
    name VARCHAR,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.topic_id, s.name, s.description, s.sort_order, s.is_active, s.created_at, s.updated_at
    FROM faq_sub_topics s
    WHERE s.id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_faq_sub_topic(
    p_topic_id UUID,
    p_name VARCHAR,
    p_description TEXT DEFAULT NULL,
    p_sort_order INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    topic_id UUID,
    name VARCHAR,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
DECLARE
    v_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_topics WHERE faq_topics.id = p_topic_id AND faq_topics.is_active = true) THEN
        RAISE EXCEPTION 'FAQ topic not found or inactive' USING ERRCODE = 'no_data_found';
    END IF;

    INSERT INTO faq_sub_topics (topic_id, name, description, sort_order)
    VALUES (p_topic_id, p_name, p_description, p_sort_order)
    RETURNING faq_sub_topics.id INTO v_id;

    RETURN QUERY SELECT s.id, s.topic_id, s.name, s.description, s.sort_order, s.is_active, s.created_at, s.updated_at
    FROM faq_sub_topics s WHERE s.id = v_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_faq_sub_topic(
    p_id UUID,
    p_topic_id UUID DEFAULT NULL,
    p_name VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_sort_order INTEGER DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    topic_id UUID,
    name VARCHAR,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_sub_topics WHERE faq_sub_topics.id = p_id) THEN
        RAISE EXCEPTION 'FAQ sub topic not found' USING ERRCODE = 'no_data_found';
    END IF;

    UPDATE faq_sub_topics SET
        topic_id    = COALESCE(p_topic_id, faq_sub_topics.topic_id),
        name        = COALESCE(p_name, faq_sub_topics.name),
        description = COALESCE(p_description, faq_sub_topics.description),
        sort_order  = COALESCE(p_sort_order, faq_sub_topics.sort_order),
        is_active   = COALESCE(p_is_active, faq_sub_topics.is_active),
        updated_at  = CURRENT_TIMESTAMP
    WHERE faq_sub_topics.id = p_id;

    RETURN QUERY SELECT s.id, s.topic_id, s.name, s.description, s.sort_order, s.is_active, s.created_at, s.updated_at
    FROM faq_sub_topics s WHERE s.id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_faq_sub_topic(p_id UUID)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_sub_topics WHERE id = p_id) THEN
        RAISE EXCEPTION 'FAQ sub topic not found' USING ERRCODE = 'no_data_found';
    END IF;

    UPDATE faq_sub_topics SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- FAQ QUESTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION get_faq_questions_with_pagination(
    p_sub_topic_id UUID DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    sub_topic_id UUID,
    content TEXT,
    status VARCHAR,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    published_by UUID,
    published_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.sub_topic_id, q.content, q.status,
           q.created_by, q.approved_by, q.approved_at,
           q.published_by, q.published_at,
           q.rejected_by, q.rejected_at, q.rejection_reason,
           q.is_active, q.created_at, q.updated_at
    FROM faq_questions q
    WHERE (p_sub_topic_id IS NULL OR q.sub_topic_id = p_sub_topic_id)
      AND (p_status IS NULL OR q.status = p_status)
      AND q.is_active = true
    ORDER BY q.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_questions_count(
    p_sub_topic_id UUID DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL
)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM faq_questions q
        WHERE (p_sub_topic_id IS NULL OR q.sub_topic_id = p_sub_topic_id)
          AND (p_status IS NULL OR q.status = p_status)
          AND q.is_active = true
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_question_by_id(p_id UUID)
RETURNS TABLE (
    id UUID,
    sub_topic_id UUID,
    content TEXT,
    status VARCHAR,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    published_by UUID,
    published_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.sub_topic_id, q.content, q.status,
           q.created_by, q.approved_by, q.approved_at,
           q.published_by, q.published_at,
           q.rejected_by, q.rejected_at, q.rejection_reason,
           q.is_active, q.created_at, q.updated_at
    FROM faq_questions q
    WHERE q.id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_faq_question(
    p_sub_topic_id UUID,
    p_content TEXT,
    p_created_by UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    sub_topic_id UUID,
    content TEXT,
    status VARCHAR,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    published_by UUID,
    published_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
DECLARE
    v_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_sub_topics st WHERE st.id = p_sub_topic_id AND st.is_active = true) THEN
        RAISE EXCEPTION 'FAQ sub topic not found or inactive' USING ERRCODE = 'no_data_found';
    END IF;

    INSERT INTO faq_questions (sub_topic_id, content, created_by)
    VALUES (p_sub_topic_id, p_content, p_created_by)
    RETURNING faq_questions.id INTO v_id;

    RETURN QUERY SELECT * FROM get_faq_question_by_id(v_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_faq_question(
    p_id UUID,
    p_content TEXT DEFAULT NULL,
    p_sub_topic_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    sub_topic_id UUID,
    content TEXT,
    status VARCHAR,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    published_by UUID,
    published_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_questions WHERE faq_questions.id = p_id AND faq_questions.is_active = true) THEN
        RAISE EXCEPTION 'FAQ question not found' USING ERRCODE = 'no_data_found';
    END IF;

    UPDATE faq_questions SET
        content      = COALESCE(p_content, faq_questions.content),
        sub_topic_id = COALESCE(p_sub_topic_id, faq_questions.sub_topic_id),
        updated_at   = CURRENT_TIMESTAMP
    WHERE faq_questions.id = p_id;

    RETURN QUERY SELECT * FROM get_faq_question_by_id(p_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION transition_faq_question_status(
    p_id UUID,
    p_new_status VARCHAR,
    p_user_id UUID DEFAULT NULL,
    p_rejection_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    sub_topic_id UUID,
    content TEXT,
    status VARCHAR,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    published_by UUID,
    published_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
DECLARE
    v_current_status VARCHAR;
BEGIN
    SELECT q.status INTO v_current_status FROM faq_questions q WHERE q.id = p_id AND q.is_active = true;

    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'FAQ question not found' USING ERRCODE = 'no_data_found';
    END IF;

    -- Validate workflow transitions
    IF NOT (
        (v_current_status = 'new'      AND p_new_status IN ('approved', 'rejected')) OR
        (v_current_status = 'approved' AND p_new_status IN ('published', 'deleted')) OR
        (v_current_status = 'rejected' AND p_new_status = 'new')  -- allow re-submission
    ) THEN
        RAISE EXCEPTION 'Invalid status transition from "%" to "%"', v_current_status, p_new_status
            USING ERRCODE = 'check_violation';
    END IF;

    UPDATE faq_questions SET
        status           = p_new_status,
        approved_by      = CASE WHEN p_new_status = 'approved'   THEN p_user_id ELSE faq_questions.approved_by END,
        approved_at      = CASE WHEN p_new_status = 'approved'   THEN CURRENT_TIMESTAMP ELSE faq_questions.approved_at END,
        published_by     = CASE WHEN p_new_status = 'published'  THEN p_user_id ELSE faq_questions.published_by END,
        published_at     = CASE WHEN p_new_status = 'published'  THEN CURRENT_TIMESTAMP ELSE faq_questions.published_at END,
        rejected_by      = CASE WHEN p_new_status = 'rejected'   THEN p_user_id ELSE faq_questions.rejected_by END,
        rejected_at      = CASE WHEN p_new_status = 'rejected'   THEN CURRENT_TIMESTAMP ELSE faq_questions.rejected_at END,
        rejection_reason = CASE WHEN p_new_status = 'rejected'   THEN p_rejection_reason ELSE faq_questions.rejection_reason END,
        is_active        = CASE WHEN p_new_status = 'deleted'    THEN false ELSE faq_questions.is_active END,
        updated_at       = CURRENT_TIMESTAMP
    WHERE faq_questions.id = p_id;

    RETURN QUERY SELECT * FROM get_faq_question_by_id(p_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_faq_question(p_id UUID)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_questions WHERE id = p_id AND is_active = true) THEN
        RAISE EXCEPTION 'FAQ question not found' USING ERRCODE = 'no_data_found';
    END IF;

    UPDATE faq_questions SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- FAQ ANSWERS
-- ============================================================

CREATE OR REPLACE FUNCTION get_faq_answers_with_pagination(
    p_question_id UUID DEFAULT NULL,
    p_campus_id UUID DEFAULT NULL,
    p_admission_year INTEGER DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    question_id UUID,
    admission_year INTEGER,
    content TEXT,
    status VARCHAR,
    tags TEXT[],
    keywords TEXT[],
    synonyms TEXT[],
    campus_ids UUID[],
    applies_to_all_campuses BOOLEAN,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    published_by UUID,
    published_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    version INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.question_id,
        a.admission_year,
        a.content,
        a.status,
        a.tags,
        a.keywords,
        a.synonyms,
        COALESCE(ARRAY_AGG(ac.campus_id) FILTER (WHERE ac.campus_id IS NOT NULL), ARRAY[]::UUID[]) AS campus_ids,
        NOT EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id) AS applies_to_all_campuses,
        a.created_by,
        a.approved_by,
        a.approved_at,
        a.published_by,
        a.published_at,
        a.rejected_by,
        a.rejected_at,
        a.rejection_reason,
        a.version,
        a.is_active,
        a.created_at,
        a.updated_at
    FROM faq_answers a
    LEFT JOIN faq_answer_campuses ac ON ac.answer_id = a.id
    WHERE (p_question_id IS NULL OR a.question_id = p_question_id)
      AND (p_status IS NULL OR a.status = p_status)
      AND (p_admission_year IS NULL OR a.admission_year = p_admission_year)
      AND a.is_active = true
      AND (
          p_campus_id IS NULL OR
          NOT EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id) OR
          EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id AND faq_answer_campuses.campus_id = p_campus_id)
      )
    GROUP BY a.id
    ORDER BY a.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_answers_count(
    p_question_id UUID DEFAULT NULL,
    p_campus_id UUID DEFAULT NULL,
    p_admission_year INTEGER DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL
)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM faq_answers a
        WHERE (p_question_id IS NULL OR a.question_id = p_question_id)
          AND (p_status IS NULL OR a.status = p_status)
          AND (p_admission_year IS NULL OR a.admission_year = p_admission_year)
          AND a.is_active = true
          AND (
              p_campus_id IS NULL OR
              NOT EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id) OR
              EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id AND faq_answer_campuses.campus_id = p_campus_id)
          )
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_answer_by_id(p_id UUID)
RETURNS TABLE (
    id UUID,
    question_id UUID,
    admission_year INTEGER,
    content TEXT,
    status VARCHAR,
    tags TEXT[],
    keywords TEXT[],
    synonyms TEXT[],
    campus_ids UUID[],
    applies_to_all_campuses BOOLEAN,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    published_by UUID,
    published_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    version INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.question_id,
        a.admission_year,
        a.content,
        a.status,
        a.tags,
        a.keywords,
        a.synonyms,
        COALESCE(ARRAY_AGG(ac.campus_id) FILTER (WHERE ac.campus_id IS NOT NULL), ARRAY[]::UUID[]) AS campus_ids,
        NOT EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id) AS applies_to_all_campuses,
        a.created_by,
        a.approved_by,
        a.approved_at,
        a.published_by,
        a.published_at,
        a.rejected_by,
        a.rejected_at,
        a.rejection_reason,
        a.version,
        a.is_active,
        a.created_at,
        a.updated_at
    FROM faq_answers a
    LEFT JOIN faq_answer_campuses ac ON ac.answer_id = a.id
    WHERE a.id = p_id
    GROUP BY a.id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_faq_answer(
    p_question_id UUID,
    p_admission_year INTEGER,
    p_content TEXT,
    p_tags TEXT[] DEFAULT NULL,
    p_keywords TEXT[] DEFAULT NULL,
    p_synonyms TEXT[] DEFAULT NULL,
    p_created_by UUID DEFAULT NULL,
    p_campus_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    question_id UUID,
    admission_year INTEGER,
    content TEXT,
    status VARCHAR,
    tags TEXT[],
    keywords TEXT[],
    synonyms TEXT[],
    campus_ids UUID[],
    applies_to_all_campuses BOOLEAN,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    published_by UUID,
    published_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    version INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
DECLARE
    v_id UUID;
    v_campus_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_questions WHERE faq_questions.id = p_question_id AND faq_questions.is_active = true) THEN
        RAISE EXCEPTION 'FAQ question not found or inactive' USING ERRCODE = 'no_data_found';
    END IF;

    INSERT INTO faq_answers (question_id, admission_year, content, tags, keywords, synonyms, created_by)
    VALUES (p_question_id, p_admission_year, p_content, p_tags, p_keywords, p_synonyms, p_created_by)
    RETURNING faq_answers.id INTO v_id;

    -- Insert campus assignments if specified (empty/null = all campuses)
    IF p_campus_ids IS NOT NULL AND array_length(p_campus_ids, 1) > 0 THEN
        FOREACH v_campus_id IN ARRAY p_campus_ids LOOP
            INSERT INTO faq_answer_campuses (answer_id, campus_id) VALUES (v_id, v_campus_id);
        END LOOP;
    END IF;

    RETURN QUERY SELECT * FROM get_faq_answer_by_id(v_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_faq_answer(
    p_id UUID,
    p_content TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_keywords TEXT[] DEFAULT NULL,
    p_synonyms TEXT[] DEFAULT NULL,
    p_admission_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    question_id UUID,
    admission_year INTEGER,
    content TEXT,
    status VARCHAR,
    tags TEXT[],
    keywords TEXT[],
    synonyms TEXT[],
    campus_ids UUID[],
    applies_to_all_campuses BOOLEAN,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    published_by UUID,
    published_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    version INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_answers WHERE faq_answers.id = p_id AND faq_answers.is_active = true) THEN
        RAISE EXCEPTION 'FAQ answer not found' USING ERRCODE = 'no_data_found';
    END IF;

    UPDATE faq_answers SET
        content        = COALESCE(p_content, faq_answers.content),
        tags           = COALESCE(p_tags, faq_answers.tags),
        keywords       = COALESCE(p_keywords, faq_answers.keywords),
        synonyms       = COALESCE(p_synonyms, faq_answers.synonyms),
        admission_year = COALESCE(p_admission_year, faq_answers.admission_year),
        updated_at     = CURRENT_TIMESTAMP
    WHERE faq_answers.id = p_id;

    RETURN QUERY SELECT * FROM get_faq_answer_by_id(p_id);
END;
$$ LANGUAGE plpgsql;

-- Replace all campus assignments for an answer
-- Pass empty array to set "all campuses"
CREATE OR REPLACE FUNCTION set_faq_answer_campuses(
    p_answer_id UUID,
    p_campus_ids UUID[]
)
RETURNS TABLE (
    id UUID,
    question_id UUID,
    admission_year INTEGER,
    content TEXT,
    status VARCHAR,
    tags TEXT[],
    keywords TEXT[],
    synonyms TEXT[],
    campus_ids UUID[],
    applies_to_all_campuses BOOLEAN,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    published_by UUID,
    published_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    version INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
DECLARE
    v_campus_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_answers WHERE faq_answers.id = p_answer_id AND faq_answers.is_active = true) THEN
        RAISE EXCEPTION 'FAQ answer not found' USING ERRCODE = 'no_data_found';
    END IF;

    DELETE FROM faq_answer_campuses WHERE answer_id = p_answer_id;

    IF p_campus_ids IS NOT NULL AND array_length(p_campus_ids, 1) > 0 THEN
        FOREACH v_campus_id IN ARRAY p_campus_ids LOOP
            INSERT INTO faq_answer_campuses (answer_id, campus_id) VALUES (p_answer_id, v_campus_id);
        END LOOP;
    END IF;

    RETURN QUERY SELECT * FROM get_faq_answer_by_id(p_answer_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION transition_faq_answer_status(
    p_id UUID,
    p_new_status VARCHAR,
    p_user_id UUID DEFAULT NULL,
    p_rejection_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    question_id UUID,
    admission_year INTEGER,
    content TEXT,
    status VARCHAR,
    tags TEXT[],
    keywords TEXT[],
    synonyms TEXT[],
    campus_ids UUID[],
    applies_to_all_campuses BOOLEAN,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    published_by UUID,
    published_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    version INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
DECLARE
    v_current_status VARCHAR;
BEGIN
    SELECT a.status INTO v_current_status FROM faq_answers a WHERE a.id = p_id AND a.is_active = true;

    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'FAQ answer not found' USING ERRCODE = 'no_data_found';
    END IF;

    IF NOT (
        (v_current_status = 'new'        AND p_new_status IN ('approved', 'rejected')) OR
        (v_current_status = 'approved'   AND p_new_status IN ('published', 'updated')) OR
        (v_current_status = 'updated'    AND p_new_status IN ('re_approved', 'rejected')) OR
        (v_current_status = 're_approved' AND p_new_status = 'published') OR
        (v_current_status = 'rejected'   AND p_new_status = 'new')
    ) THEN
        RAISE EXCEPTION 'Invalid status transition from "%" to "%"', v_current_status, p_new_status
            USING ERRCODE = 'check_violation';
    END IF;

    UPDATE faq_answers SET
        status           = p_new_status,
        approved_by      = CASE WHEN p_new_status = 'approved'    THEN p_user_id ELSE faq_answers.approved_by END,
        approved_at      = CASE WHEN p_new_status = 'approved'    THEN CURRENT_TIMESTAMP ELSE faq_answers.approved_at END,
        published_by     = CASE WHEN p_new_status = 'published'   THEN p_user_id ELSE faq_answers.published_by END,
        published_at     = CASE WHEN p_new_status = 'published'   THEN CURRENT_TIMESTAMP ELSE faq_answers.published_at END,
        rejected_by      = CASE WHEN p_new_status = 'rejected'    THEN p_user_id ELSE faq_answers.rejected_by END,
        rejected_at      = CASE WHEN p_new_status = 'rejected'    THEN CURRENT_TIMESTAMP ELSE faq_answers.rejected_at END,
        rejection_reason = CASE WHEN p_new_status = 'rejected'    THEN p_rejection_reason ELSE faq_answers.rejection_reason END,
        version          = CASE WHEN p_new_status = 'updated'     THEN faq_answers.version + 1 ELSE faq_answers.version END,
        updated_at       = CURRENT_TIMESTAMP
    WHERE faq_answers.id = p_id;

    RETURN QUERY SELECT * FROM get_faq_answer_by_id(p_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_faq_answer(p_id UUID)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_answers WHERE id = p_id AND is_active = true) THEN
        RAISE EXCEPTION 'FAQ answer not found' USING ERRCODE = 'no_data_found';
    END IF;

    UPDATE faq_answers SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- FAQ COLLECTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION get_faq_collections_with_pagination(
    p_status VARCHAR DEFAULT NULL,
    p_admission_year INTEGER DEFAULT NULL,
    p_campus_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    admission_year INTEGER,
    campus_id UUID,
    status VARCHAR,
    published_by UUID,
    published_at TIMESTAMP,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name, c.description, c.admission_year, c.campus_id, c.status,
           c.published_by, c.published_at, c.is_active, c.created_at, c.updated_at
    FROM faq_collections c
    WHERE (p_status IS NULL OR c.status = p_status)
      AND (p_admission_year IS NULL OR c.admission_year = p_admission_year)
      AND (p_campus_id IS NULL OR c.campus_id = p_campus_id OR c.campus_id IS NULL)
      AND c.is_active = true
    ORDER BY c.admission_year DESC, c.name ASC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_collections_count(
    p_status VARCHAR DEFAULT NULL,
    p_admission_year INTEGER DEFAULT NULL,
    p_campus_id UUID DEFAULT NULL
)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM faq_collections c
        WHERE (p_status IS NULL OR c.status = p_status)
          AND (p_admission_year IS NULL OR c.admission_year = p_admission_year)
          AND (p_campus_id IS NULL OR c.campus_id = p_campus_id OR c.campus_id IS NULL)
          AND c.is_active = true
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_collection_by_id(p_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    admission_year INTEGER,
    campus_id UUID,
    status VARCHAR,
    published_by UUID,
    published_at TIMESTAMP,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name, c.description, c.admission_year, c.campus_id, c.status,
           c.published_by, c.published_at, c.is_active, c.created_at, c.updated_at
    FROM faq_collections c
    WHERE c.id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_faq_collection(
    p_name VARCHAR,
    p_admission_year INTEGER,
    p_description TEXT DEFAULT NULL,
    p_campus_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    admission_year INTEGER,
    campus_id UUID,
    status VARCHAR,
    published_by UUID,
    published_at TIMESTAMP,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO faq_collections (name, description, admission_year, campus_id)
    VALUES (p_name, p_description, p_admission_year, p_campus_id)
    RETURNING faq_collections.id INTO v_id;

    RETURN QUERY SELECT * FROM get_faq_collection_by_id(v_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_faq_collection(
    p_id UUID,
    p_name VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_admission_year INTEGER DEFAULT NULL,
    p_campus_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    admission_year INTEGER,
    campus_id UUID,
    status VARCHAR,
    published_by UUID,
    published_at TIMESTAMP,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_collections WHERE faq_collections.id = p_id AND faq_collections.is_active = true) THEN
        RAISE EXCEPTION 'FAQ collection not found' USING ERRCODE = 'no_data_found';
    END IF;

    UPDATE faq_collections SET
        name           = COALESCE(p_name, faq_collections.name),
        description    = COALESCE(p_description, faq_collections.description),
        admission_year = COALESCE(p_admission_year, faq_collections.admission_year),
        campus_id      = COALESCE(p_campus_id, faq_collections.campus_id),
        updated_at     = CURRENT_TIMESTAMP
    WHERE faq_collections.id = p_id;

    RETURN QUERY SELECT * FROM get_faq_collection_by_id(p_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION transition_faq_collection_status(
    p_id UUID,
    p_new_status VARCHAR,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    admission_year INTEGER,
    campus_id UUID,
    status VARCHAR,
    published_by UUID,
    published_at TIMESTAMP,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
DECLARE
    v_current_status VARCHAR;
BEGIN
    SELECT c.status INTO v_current_status FROM faq_collections c WHERE c.id = p_id AND c.is_active = true;

    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'FAQ collection not found' USING ERRCODE = 'no_data_found';
    END IF;

    IF NOT (
        (v_current_status = 'draft'     AND p_new_status = 'published') OR
        (v_current_status = 'published' AND p_new_status = 'archived') OR
        (v_current_status = 'archived'  AND p_new_status = 'draft')
    ) THEN
        RAISE EXCEPTION 'Invalid status transition from "%" to "%"', v_current_status, p_new_status
            USING ERRCODE = 'check_violation';
    END IF;

    UPDATE faq_collections SET
        status       = p_new_status,
        published_by = CASE WHEN p_new_status = 'published' THEN p_user_id ELSE faq_collections.published_by END,
        published_at = CASE WHEN p_new_status = 'published' THEN CURRENT_TIMESTAMP ELSE faq_collections.published_at END,
        updated_at   = CURRENT_TIMESTAMP
    WHERE faq_collections.id = p_id;

    RETURN QUERY SELECT * FROM get_faq_collection_by_id(p_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_faq_collection_items(
    p_collection_id UUID,
    p_answer_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
    v_answer_id UUID;
    v_inserted INTEGER := 0;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_collections WHERE id = p_collection_id AND is_active = true) THEN
        RAISE EXCEPTION 'FAQ collection not found' USING ERRCODE = 'no_data_found';
    END IF;

    FOREACH v_answer_id IN ARRAY p_answer_ids LOOP
        INSERT INTO faq_collection_items (collection_id, answer_id)
        VALUES (p_collection_id, v_answer_id)
        ON CONFLICT (collection_id, answer_id) DO NOTHING;

        IF FOUND THEN v_inserted := v_inserted + 1; END IF;
    END LOOP;

    RETURN v_inserted;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_faq_collection_item(
    p_collection_id UUID,
    p_answer_id UUID
)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM faq_collection_items
        WHERE collection_id = p_collection_id AND answer_id = p_answer_id
    ) THEN
        RAISE EXCEPTION 'Collection item not found' USING ERRCODE = 'no_data_found';
    END IF;

    DELETE FROM faq_collection_items
    WHERE collection_id = p_collection_id AND answer_id = p_answer_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_faq_collection(p_id UUID)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_collections WHERE id = p_id AND is_active = true) THEN
        RAISE EXCEPTION 'FAQ collection not found' USING ERRCODE = 'no_data_found';
    END IF;

    UPDATE faq_collections SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- SEARCH
-- ============================================================

CREATE OR REPLACE FUNCTION search_faq(
    p_topic_id UUID DEFAULT NULL,
    p_sub_topic_id UUID DEFAULT NULL,
    p_campus_id UUID DEFAULT NULL,
    p_admission_year INTEGER DEFAULT NULL,
    p_keyword TEXT DEFAULT NULL,
    p_status VARCHAR DEFAULT 'published',
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    answer_id UUID,
    question_id UUID,
    question_content TEXT,
    question_status VARCHAR,
    sub_topic_id UUID,
    sub_topic_name VARCHAR,
    topic_id UUID,
    topic_name VARCHAR,
    answer_content TEXT,
    answer_status VARCHAR,
    admission_year INTEGER,
    campus_ids UUID[],
    applies_to_all_campuses BOOLEAN,
    tags TEXT[],
    keywords TEXT[],
    synonyms TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id AS answer_id,
        q.id AS question_id,
        q.content AS question_content,
        q.status AS question_status,
        s.id AS sub_topic_id,
        s.name AS sub_topic_name,
        t.id AS topic_id,
        t.name AS topic_name,
        a.content AS answer_content,
        a.status AS answer_status,
        a.admission_year,
        COALESCE(ARRAY_AGG(ac.campus_id) FILTER (WHERE ac.campus_id IS NOT NULL), ARRAY[]::UUID[]) AS campus_ids,
        NOT EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id) AS applies_to_all_campuses,
        a.tags,
        a.keywords,
        a.synonyms
    FROM faq_answers a
    JOIN faq_questions q ON q.id = a.question_id
    JOIN faq_sub_topics s ON s.id = q.sub_topic_id
    JOIN faq_topics t ON t.id = s.topic_id
    LEFT JOIN faq_answer_campuses ac ON ac.answer_id = a.id
    WHERE a.is_active = true
      AND q.is_active = true
      AND s.is_active = true
      AND t.is_active = true
      AND (p_topic_id IS NULL OR t.id = p_topic_id)
      AND (p_sub_topic_id IS NULL OR s.id = p_sub_topic_id)
      AND (p_admission_year IS NULL OR a.admission_year = p_admission_year)
      AND (p_status IS NULL OR a.status = p_status)
      AND (
          p_campus_id IS NULL OR
          NOT EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id) OR
          EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id AND faq_answer_campuses.campus_id = p_campus_id)
      )
      AND (
          p_keyword IS NULL OR
          q.content ILIKE '%' || p_keyword || '%' OR
          a.content ILIKE '%' || p_keyword || '%' OR
          p_keyword = ANY(a.keywords) OR
          p_keyword = ANY(a.tags)
      )
    GROUP BY a.id, q.id, s.id, t.id
    ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_faq_count(
    p_topic_id UUID DEFAULT NULL,
    p_sub_topic_id UUID DEFAULT NULL,
    p_campus_id UUID DEFAULT NULL,
    p_admission_year INTEGER DEFAULT NULL,
    p_keyword TEXT DEFAULT NULL,
    p_status VARCHAR DEFAULT 'published'
)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT a.id)
        FROM faq_answers a
        JOIN faq_questions q ON q.id = a.question_id
        JOIN faq_sub_topics s ON s.id = q.sub_topic_id
        JOIN faq_topics t ON t.id = s.topic_id
        WHERE a.is_active = true
          AND q.is_active = true
          AND s.is_active = true
          AND t.is_active = true
          AND (p_topic_id IS NULL OR t.id = p_topic_id)
          AND (p_sub_topic_id IS NULL OR s.id = p_sub_topic_id)
          AND (p_admission_year IS NULL OR a.admission_year = p_admission_year)
          AND (p_status IS NULL OR a.status = p_status)
          AND (
              p_campus_id IS NULL OR
              NOT EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id) OR
              EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id AND faq_answer_campuses.campus_id = p_campus_id)
          )
          AND (
              p_keyword IS NULL OR
              q.content ILIKE '%' || p_keyword || '%' OR
              a.content ILIKE '%' || p_keyword || '%' OR
              p_keyword = ANY(a.keywords) OR
              p_keyword = ANY(a.tags)
          )
    );
END;
$$ LANGUAGE plpgsql;
