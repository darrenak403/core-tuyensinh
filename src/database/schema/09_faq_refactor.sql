-- =====================================================
-- FAQ REFACTOR MIGRATION
-- Changes:
--   1. Slug helper function for auto-generating codes
--   2. Add code to faq_sub_topics (auto slug uppercase)
--   3. Add code to faq_questions (TOPIC_SUBTOPIC_SEQ)
--   4. Question/Answer status → 4 states: new, approved, rejected, deleted
--   5. faq_answers.admission_year → nullable (year lives on collection)
--   6. faq_collections: remove campus_id
--   7. faq_collection_items: answer_id → question_id
--   8. Update all affected stored functions
-- =====================================================


-- ============================================================
-- 1. SLUG HELPER
-- ============================================================

CREATE OR REPLACE FUNCTION generate_faq_slug(p_text TEXT)
RETURNS TEXT AS $$
DECLARE
    v_text TEXT;
BEGIN
    v_text := LOWER(TRIM(p_text));
    -- Vietnamese d
    v_text := REPLACE(v_text, 'đ', 'd');
    -- a variants
    v_text := REGEXP_REPLACE(v_text, '[àáâãäåăắặằẳẵấậầẩẫảạ]', 'a', 'g');
    -- e variants
    v_text := REGEXP_REPLACE(v_text, '[èéêëếệềểễẻẹ]', 'e', 'g');
    -- i variants
    v_text := REGEXP_REPLACE(v_text, '[ìíîïỉịĩ]', 'i', 'g');
    -- o variants
    v_text := REGEXP_REPLACE(v_text, '[òóôõöốộồổỗọỏơớợờởỡ]', 'o', 'g');
    -- u variants
    v_text := REGEXP_REPLACE(v_text, '[ùúûüụủũưứựừửữ]', 'u', 'g');
    -- y variants
    v_text := REGEXP_REPLACE(v_text, '[ýÿỳỹỷỵ]', 'y', 'g');
    -- Replace non-alphanumeric (including spaces) with underscore
    v_text := REGEXP_REPLACE(v_text, '[^a-z0-9]+', '_', 'g');
    -- Trim leading/trailing underscores
    v_text := TRIM(BOTH '_' FROM v_text);
    RETURN UPPER(v_text);
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ============================================================
-- 2. DDL CHANGES
-- ============================================================

-- 2a-pre. Widen faq_topics.code from VARCHAR(20) to VARCHAR(100)
--         (auto-slug from long names can exceed 20 chars)
ALTER TABLE faq_topics ALTER COLUMN code TYPE VARCHAR(100);

-- 2a. Add code to faq_sub_topics
ALTER TABLE faq_sub_topics ADD COLUMN IF NOT EXISTS code VARCHAR(100);

-- 2b. Add code to faq_questions
ALTER TABLE faq_questions ADD COLUMN IF NOT EXISTS code VARCHAR(200);

-- 2c. Backfill sub_topics.code from name (for existing rows)
UPDATE faq_sub_topics SET code = generate_faq_slug(name) WHERE code IS NULL;

-- 2d. Make code unique and NOT NULL for sub_topics
ALTER TABLE faq_sub_topics ALTER COLUMN code SET NOT NULL;
ALTER TABLE faq_sub_topics DROP CONSTRAINT IF EXISTS faq_sub_topics_code_key;
ALTER TABLE faq_sub_topics ADD CONSTRAINT faq_sub_topics_code_key UNIQUE (code);

-- 2e. Backfill questions.code (best-effort: TOPIC_SUBTOPIC_SEQ)
DO $$
DECLARE
    r RECORD;
    v_seq INTEGER;
    v_code VARCHAR;
    v_counter INTEGER;
BEGIN
    FOR r IN
        SELECT q.id, t.code AS topic_code, s.code AS sub_code
        FROM faq_questions q
        JOIN faq_sub_topics s ON s.id = q.sub_topic_id
        JOIN faq_topics t ON t.id = s.topic_id
        WHERE q.code IS NULL
        ORDER BY q.created_at
    LOOP
        SELECT COUNT(*) + 1 INTO v_seq
        FROM faq_questions q2
        JOIN faq_sub_topics s2 ON s2.id = q2.sub_topic_id
        WHERE s2.code = r.sub_code AND q2.code IS NOT NULL;

        v_code := r.topic_code || '_' || r.sub_code || '_' || LPAD(v_seq::TEXT, 3, '0');
        v_counter := 0;
        WHILE EXISTS (SELECT 1 FROM faq_questions WHERE code = v_code) LOOP
            v_seq := v_seq + 1;
            v_code := r.topic_code || '_' || r.sub_code || '_' || LPAD(v_seq::TEXT, 3, '0');
            v_counter := v_counter + 1;
            IF v_counter > 9999 THEN EXIT; END IF;
        END LOOP;

        UPDATE faq_questions SET code = v_code WHERE id = r.id;
    END LOOP;
END;
$$;

-- 2f. Make questions.code NOT NULL and unique
ALTER TABLE faq_questions ALTER COLUMN code SET NOT NULL;
ALTER TABLE faq_questions DROP CONSTRAINT IF EXISTS faq_questions_code_key;
ALTER TABLE faq_questions ADD CONSTRAINT faq_questions_code_key UNIQUE (code);

-- 2g. Question status → 4 states (migrate existing data first)
-- published → approved, deleted rows keep deleted via is_active
UPDATE faq_questions SET status = 'approved' WHERE status = 'published';
-- any other unexpected value → new
UPDATE faq_questions SET status = 'new'
    WHERE status NOT IN ('new', 'approved', 'rejected', 'deleted');
ALTER TABLE faq_questions DROP CONSTRAINT IF EXISTS faq_questions_status_check;
ALTER TABLE faq_questions ADD CONSTRAINT faq_questions_status_check
    CHECK (status IN ('new', 'approved', 'rejected', 'deleted'));

-- 2h. Answer status → 4 states (migrate existing data first)
-- published / re_approved → approved
UPDATE faq_answers SET status = 'approved'
    WHERE status IN ('published', 're_approved', 'updated');
-- any other unexpected value → new
UPDATE faq_answers SET status = 'new'
    WHERE status NOT IN ('new', 'approved', 'rejected', 'deleted');
ALTER TABLE faq_answers DROP CONSTRAINT IF EXISTS faq_answers_status_check;
ALTER TABLE faq_answers ADD CONSTRAINT faq_answers_status_check
    CHECK (status IN ('new', 'approved', 'rejected', 'deleted'));

-- 2i. faq_answers.admission_year → nullable
ALTER TABLE faq_answers ALTER COLUMN admission_year DROP NOT NULL;

-- 2j. faq_collections: remove campus_id
ALTER TABLE faq_collections DROP COLUMN IF EXISTS campus_id;

-- 2k. faq_collection_items: rename answer_id → question_id
ALTER TABLE faq_collection_items DROP CONSTRAINT IF EXISTS faq_collection_items_answer_id_fkey;
ALTER TABLE faq_collection_items DROP CONSTRAINT IF EXISTS faq_collection_items_collection_id_answer_id_key;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'faq_collection_items' AND column_name = 'answer_id'
    ) THEN
        ALTER TABLE faq_collection_items RENAME COLUMN answer_id TO question_id;
    END IF;
END;
$$;
ALTER TABLE faq_collection_items DROP CONSTRAINT IF EXISTS faq_collection_items_question_id_fkey;
ALTER TABLE faq_collection_items ADD CONSTRAINT faq_collection_items_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES faq_questions(id);
ALTER TABLE faq_collection_items DROP CONSTRAINT IF EXISTS faq_collection_items_collection_id_question_id_key;
ALTER TABLE faq_collection_items ADD CONSTRAINT faq_collection_items_collection_id_question_id_key
    UNIQUE(collection_id, question_id);

-- Update indexes
DROP INDEX IF EXISTS idx_faq_collection_items_answer_id;
CREATE INDEX IF NOT EXISTS idx_faq_collection_items_question_id ON faq_collection_items(question_id);


-- ============================================================
-- 3. UPDATED STORED FUNCTIONS
-- ============================================================


-- ──────────────────────────────────────────────────────────
-- FAQ TOPICS (make code optional → auto-generate from name)
-- ──────────────────────────────────────────────────────────

-- Must drop first because parameter order changed (p_code was 1st, now 2nd with default)
DROP FUNCTION IF EXISTS create_faq_topic(VARCHAR, VARCHAR, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION create_faq_topic(
    p_name VARCHAR,
    p_code VARCHAR DEFAULT NULL,
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
    v_code VARCHAR;
    v_counter INTEGER := 1;
BEGIN
    -- Auto-generate code from name if not provided
    IF p_code IS NULL OR TRIM(p_code) = '' THEN
        v_code := generate_faq_slug(p_name);
        WHILE EXISTS (SELECT 1 FROM faq_topics WHERE faq_topics.code = v_code) LOOP
            v_code := generate_faq_slug(p_name) || '_' || v_counter;
            v_counter := v_counter + 1;
        END LOOP;
    ELSE
        v_code := UPPER(TRIM(p_code));
        IF EXISTS (SELECT 1 FROM faq_topics WHERE faq_topics.code = v_code) THEN
            RAISE EXCEPTION 'FAQ topic with code "%" already exists', v_code
                USING ERRCODE = 'unique_violation';
        END IF;
    END IF;

    INSERT INTO faq_topics (code, name, description, sort_order)
    VALUES (v_code, p_name, p_description, p_sort_order)
    RETURNING faq_topics.id INTO v_id;

    RETURN QUERY SELECT t.id, t.code, t.name, t.description, t.sort_order, t.is_active, t.created_at, t.updated_at
    FROM faq_topics t WHERE t.id = v_id;
END;
$$ LANGUAGE plpgsql;


-- ──────────────────────────────────────────────────────────
-- FAQ SUB TOPICS (add code field)
-- ──────────────────────────────────────────────────────────

-- RETURNS TABLE changed (added code column) → must drop
DROP FUNCTION IF EXISTS get_faq_sub_topics_with_pagination(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_faq_sub_topic_by_id(UUID);
DROP FUNCTION IF EXISTS create_faq_sub_topic(UUID, VARCHAR, TEXT, INTEGER);
DROP FUNCTION IF EXISTS update_faq_sub_topic(UUID, UUID, VARCHAR, TEXT, INTEGER, BOOLEAN);

CREATE OR REPLACE FUNCTION get_faq_sub_topics_with_pagination(
    p_topic_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    topic_id UUID,
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
    SELECT s.id, s.topic_id, s.code, s.name, s.description, s.sort_order, s.is_active, s.created_at, s.updated_at
    FROM faq_sub_topics s
    WHERE (p_topic_id IS NULL OR s.topic_id = p_topic_id)
    ORDER BY s.sort_order ASC, s.name ASC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_sub_topic_by_id(p_id UUID)
RETURNS TABLE (
    id UUID,
    topic_id UUID,
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
    SELECT s.id, s.topic_id, s.code, s.name, s.description, s.sort_order, s.is_active, s.created_at, s.updated_at
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
    v_code VARCHAR;
    v_counter INTEGER := 1;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_topics WHERE faq_topics.id = p_topic_id AND faq_topics.is_active = true) THEN
        RAISE EXCEPTION 'FAQ topic not found or inactive' USING ERRCODE = 'no_data_found';
    END IF;

    -- Auto-generate code from name
    v_code := generate_faq_slug(p_name);
    WHILE EXISTS (SELECT 1 FROM faq_sub_topics WHERE faq_sub_topics.code = v_code) LOOP
        v_code := generate_faq_slug(p_name) || '_' || v_counter;
        v_counter := v_counter + 1;
    END LOOP;

    INSERT INTO faq_sub_topics (topic_id, code, name, description, sort_order)
    VALUES (p_topic_id, v_code, p_name, p_description, p_sort_order)
    RETURNING faq_sub_topics.id INTO v_id;

    RETURN QUERY SELECT s.id, s.topic_id, s.code, s.name, s.description, s.sort_order, s.is_active, s.created_at, s.updated_at
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
    code VARCHAR,
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

    RETURN QUERY SELECT s.id, s.topic_id, s.code, s.name, s.description, s.sort_order, s.is_active, s.created_at, s.updated_at
    FROM faq_sub_topics s WHERE s.id = p_id;
END;
$$ LANGUAGE plpgsql;


-- ──────────────────────────────────────────────────────────
-- FAQ QUESTIONS (add code, more filters, new status flow)
-- ──────────────────────────────────────────────────────────

-- Signature changed (new params, RETURNS TABLE changed) → must drop
DROP FUNCTION IF EXISTS get_faq_questions_with_pagination(UUID, VARCHAR, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_faq_questions_count(UUID, VARCHAR);
DROP FUNCTION IF EXISTS get_faq_question_by_id(UUID);
DROP FUNCTION IF EXISTS create_faq_question(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS update_faq_question(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS transition_faq_question_status(UUID, VARCHAR, UUID, TEXT);

CREATE OR REPLACE FUNCTION get_faq_questions_with_pagination(
    p_sub_topic_id UUID DEFAULT NULL,
    p_topic_id UUID DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_content TEXT DEFAULT NULL,
    p_code VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    code VARCHAR,
    sub_topic_id UUID,
    content TEXT,
    status VARCHAR,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.code, q.sub_topic_id, q.content, q.status,
           q.created_by, q.approved_by, q.approved_at,
           q.rejected_by, q.rejected_at, q.rejection_reason,
           q.is_active, q.created_at, q.updated_at
    FROM faq_questions q
    JOIN faq_sub_topics s ON s.id = q.sub_topic_id
    WHERE (p_sub_topic_id IS NULL OR q.sub_topic_id = p_sub_topic_id)
      AND (p_topic_id IS NULL OR s.topic_id = p_topic_id)
      AND (p_status IS NULL OR q.status = p_status)
      AND (p_content IS NULL OR q.content ILIKE '%' || p_content || '%')
      AND (p_code IS NULL OR q.code ILIKE '%' || p_code || '%')
      AND q.is_active = true
    ORDER BY q.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_questions_count(
    p_sub_topic_id UUID DEFAULT NULL,
    p_topic_id UUID DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_content TEXT DEFAULT NULL,
    p_code VARCHAR DEFAULT NULL
)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM faq_questions q
        JOIN faq_sub_topics s ON s.id = q.sub_topic_id
        WHERE (p_sub_topic_id IS NULL OR q.sub_topic_id = p_sub_topic_id)
          AND (p_topic_id IS NULL OR s.topic_id = p_topic_id)
          AND (p_status IS NULL OR q.status = p_status)
          AND (p_content IS NULL OR q.content ILIKE '%' || p_content || '%')
          AND (p_code IS NULL OR q.code ILIKE '%' || p_code || '%')
          AND q.is_active = true
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_question_by_id(p_id UUID)
RETURNS TABLE (
    id UUID,
    code VARCHAR,
    sub_topic_id UUID,
    content TEXT,
    status VARCHAR,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.code, q.sub_topic_id, q.content, q.status,
           q.created_by, q.approved_by, q.approved_at,
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
    code VARCHAR,
    sub_topic_id UUID,
    content TEXT,
    status VARCHAR,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
DECLARE
    v_id UUID;
    v_topic_code VARCHAR;
    v_sub_code VARCHAR;
    v_seq INTEGER;
    v_code VARCHAR;
    v_counter INTEGER;
BEGIN
    -- Get topic code and subtopic code
    SELECT t.code, s.code INTO v_topic_code, v_sub_code
    FROM faq_sub_topics s
    JOIN faq_topics t ON t.id = s.topic_id
    WHERE s.id = p_sub_topic_id AND s.is_active = true;

    IF v_topic_code IS NULL THEN
        RAISE EXCEPTION 'FAQ sub topic not found or inactive' USING ERRCODE = 'no_data_found';
    END IF;

    -- Determine next sequence number for this subtopic
    SELECT COUNT(*) + 1 INTO v_seq
    FROM faq_questions q2
    WHERE q2.sub_topic_id = p_sub_topic_id;

    v_code := v_topic_code || '_' || v_sub_code || '_' || LPAD(v_seq::TEXT, 3, '0');
    v_counter := 0;
    WHILE EXISTS (SELECT 1 FROM faq_questions WHERE faq_questions.code = v_code) LOOP
        v_seq := v_seq + 1;
        v_code := v_topic_code || '_' || v_sub_code || '_' || LPAD(v_seq::TEXT, 3, '0');
        v_counter := v_counter + 1;
        IF v_counter > 9999 THEN
            RAISE EXCEPTION 'Could not generate unique question code';
        END IF;
    END LOOP;

    INSERT INTO faq_questions (code, sub_topic_id, content, created_by)
    VALUES (v_code, p_sub_topic_id, p_content, p_created_by)
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
    code VARCHAR,
    sub_topic_id UUID,
    content TEXT,
    status VARCHAR,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
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

-- Status workflow: new→approved | new→rejected | approved→deleted | rejected→new
CREATE OR REPLACE FUNCTION transition_faq_question_status(
    p_id UUID,
    p_new_status VARCHAR,
    p_user_id UUID DEFAULT NULL,
    p_rejection_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    code VARCHAR,
    sub_topic_id UUID,
    content TEXT,
    status VARCHAR,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
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

    IF NOT (
        (v_current_status = 'new'      AND p_new_status IN ('approved', 'rejected')) OR
        (v_current_status = 'approved' AND p_new_status = 'deleted') OR
        (v_current_status = 'rejected' AND p_new_status = 'new')
    ) THEN
        RAISE EXCEPTION 'Invalid status transition from "%" to "%"', v_current_status, p_new_status
            USING ERRCODE = 'check_violation';
    END IF;

    UPDATE faq_questions SET
        status           = p_new_status,
        approved_by      = CASE WHEN p_new_status = 'approved'  THEN p_user_id ELSE faq_questions.approved_by END,
        approved_at      = CASE WHEN p_new_status = 'approved'  THEN CURRENT_TIMESTAMP ELSE faq_questions.approved_at END,
        rejected_by      = CASE WHEN p_new_status = 'rejected'  THEN p_user_id ELSE faq_questions.rejected_by END,
        rejected_at      = CASE WHEN p_new_status = 'rejected'  THEN CURRENT_TIMESTAMP ELSE faq_questions.rejected_at END,
        rejection_reason = CASE WHEN p_new_status = 'rejected'  THEN p_rejection_reason ELSE faq_questions.rejection_reason END,
        is_active        = CASE WHEN p_new_status = 'deleted'   THEN false ELSE faq_questions.is_active END,
        updated_at       = CURRENT_TIMESTAMP
    WHERE faq_questions.id = p_id;

    RETURN QUERY SELECT * FROM get_faq_question_by_id(p_id);
END;
$$ LANGUAGE plpgsql;


-- ──────────────────────────────────────────────────────────
-- FAQ ANSWERS (admission_year nullable, simplified status)
-- ──────────────────────────────────────────────────────────

-- RETURNS TABLE changed (removed admission_year) + params changed → must drop
DROP FUNCTION IF EXISTS get_faq_answer_by_id(UUID);
DROP FUNCTION IF EXISTS get_faq_answers_with_pagination(UUID, UUID, INTEGER, VARCHAR, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_faq_answers_count(UUID, UUID, INTEGER, VARCHAR);
DROP FUNCTION IF EXISTS create_faq_answer(UUID, INTEGER, TEXT, TEXT[], TEXT[], TEXT[], UUID, UUID[]);
DROP FUNCTION IF EXISTS update_faq_answer(UUID, TEXT, TEXT[], TEXT[], TEXT[], INTEGER);
DROP FUNCTION IF EXISTS set_faq_answer_campuses(UUID, UUID[]);
DROP FUNCTION IF EXISTS transition_faq_answer_status(UUID, VARCHAR, UUID, TEXT);

CREATE OR REPLACE FUNCTION create_faq_answer(
    p_question_id UUID,
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

    INSERT INTO faq_answers (question_id, content, tags, keywords, synonyms, created_by)
    VALUES (p_question_id, p_content, p_tags, p_keywords, p_synonyms, p_created_by)
    RETURNING faq_answers.id INTO v_id;

    IF p_campus_ids IS NOT NULL AND array_length(p_campus_ids, 1) > 0 THEN
        FOREACH v_campus_id IN ARRAY p_campus_ids LOOP
            INSERT INTO faq_answer_campuses (answer_id, campus_id) VALUES (v_id, v_campus_id);
        END LOOP;
    END IF;

    RETURN QUERY SELECT * FROM get_faq_answer_by_id(v_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_answer_by_id(p_id UUID)
RETURNS TABLE (
    id UUID,
    question_id UUID,
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

CREATE OR REPLACE FUNCTION get_faq_answers_with_pagination(
    p_question_id UUID DEFAULT NULL,
    p_campus_id UUID DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    question_id UUID,
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
    p_status VARCHAR DEFAULT NULL
)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM faq_answers a
        WHERE (p_question_id IS NULL OR a.question_id = p_question_id)
          AND (p_status IS NULL OR a.status = p_status)
          AND a.is_active = true
          AND (
              p_campus_id IS NULL OR
              NOT EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id) OR
              EXISTS (SELECT 1 FROM faq_answer_campuses WHERE answer_id = a.id AND faq_answer_campuses.campus_id = p_campus_id)
          )
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_faq_answer(
    p_id UUID,
    p_content TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_keywords TEXT[] DEFAULT NULL,
    p_synonyms TEXT[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    question_id UUID,
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
        content    = COALESCE(p_content, faq_answers.content),
        tags       = COALESCE(p_tags, faq_answers.tags),
        keywords   = COALESCE(p_keywords, faq_answers.keywords),
        synonyms   = COALESCE(p_synonyms, faq_answers.synonyms),
        updated_at = CURRENT_TIMESTAMP
    WHERE faq_answers.id = p_id;

    RETURN QUERY SELECT * FROM get_faq_answer_by_id(p_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_faq_answer_campuses(
    p_answer_id UUID,
    p_campus_ids UUID[]
)
RETURNS TABLE (
    id UUID,
    question_id UUID,
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

-- Status workflow: new→approved | new→rejected | approved→deleted | rejected→new
CREATE OR REPLACE FUNCTION transition_faq_answer_status(
    p_id UUID,
    p_new_status VARCHAR,
    p_user_id UUID DEFAULT NULL,
    p_rejection_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    question_id UUID,
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
        (v_current_status = 'new'      AND p_new_status IN ('approved', 'rejected')) OR
        (v_current_status = 'approved' AND p_new_status = 'deleted') OR
        (v_current_status = 'rejected' AND p_new_status = 'new')
    ) THEN
        RAISE EXCEPTION 'Invalid status transition from "%" to "%"', v_current_status, p_new_status
            USING ERRCODE = 'check_violation';
    END IF;

    UPDATE faq_answers SET
        status           = p_new_status,
        approved_by      = CASE WHEN p_new_status = 'approved'  THEN p_user_id ELSE faq_answers.approved_by END,
        approved_at      = CASE WHEN p_new_status = 'approved'  THEN CURRENT_TIMESTAMP ELSE faq_answers.approved_at END,
        rejected_by      = CASE WHEN p_new_status = 'rejected'  THEN p_user_id ELSE faq_answers.rejected_by END,
        rejected_at      = CASE WHEN p_new_status = 'rejected'  THEN CURRENT_TIMESTAMP ELSE faq_answers.rejected_at END,
        rejection_reason = CASE WHEN p_new_status = 'rejected'  THEN p_rejection_reason ELSE faq_answers.rejection_reason END,
        is_active        = CASE WHEN p_new_status = 'deleted'   THEN false ELSE faq_answers.is_active END,
        updated_at       = CURRENT_TIMESTAMP
    WHERE faq_answers.id = p_id;

    RETURN QUERY SELECT * FROM get_faq_answer_by_id(p_id);
END;
$$ LANGUAGE plpgsql;


-- ──────────────────────────────────────────────────────────
-- FAQ COLLECTIONS (no campus_id, items link to questions)
-- ──────────────────────────────────────────────────────────

-- RETURNS TABLE changed (removed campus_id) + params changed → must drop
DROP FUNCTION IF EXISTS get_faq_collections_with_pagination(VARCHAR, INTEGER, UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_faq_collections_count(VARCHAR, INTEGER, UUID);
DROP FUNCTION IF EXISTS get_faq_collection_by_id(UUID);
DROP FUNCTION IF EXISTS create_faq_collection(VARCHAR, INTEGER, TEXT, UUID);
DROP FUNCTION IF EXISTS update_faq_collection(UUID, VARCHAR, TEXT, INTEGER, UUID);
DROP FUNCTION IF EXISTS transition_faq_collection_status(UUID, VARCHAR, UUID);
DROP FUNCTION IF EXISTS add_faq_collection_items(UUID, UUID[]);
DROP FUNCTION IF EXISTS remove_faq_collection_item(UUID, UUID);

CREATE OR REPLACE FUNCTION get_faq_collections_with_pagination(
    p_status VARCHAR DEFAULT NULL,
    p_admission_year INTEGER DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    admission_year INTEGER,
    status VARCHAR,
    published_by UUID,
    published_at TIMESTAMP,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name, c.description, c.admission_year, c.status,
           c.published_by, c.published_at, c.is_active, c.created_at, c.updated_at
    FROM faq_collections c
    WHERE (p_status IS NULL OR c.status = p_status)
      AND (p_admission_year IS NULL OR c.admission_year = p_admission_year)
      AND c.is_active = true
    ORDER BY c.admission_year DESC, c.name ASC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_faq_collections_count(
    p_status VARCHAR DEFAULT NULL,
    p_admission_year INTEGER DEFAULT NULL
)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM faq_collections c
        WHERE (p_status IS NULL OR c.status = p_status)
          AND (p_admission_year IS NULL OR c.admission_year = p_admission_year)
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
    status VARCHAR,
    published_by UUID,
    published_at TIMESTAMP,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name, c.description, c.admission_year, c.status,
           c.published_by, c.published_at, c.is_active, c.created_at, c.updated_at
    FROM faq_collections c
    WHERE c.id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_faq_collection(
    p_name VARCHAR,
    p_admission_year INTEGER,
    p_description TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    admission_year INTEGER,
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
    INSERT INTO faq_collections (name, description, admission_year)
    VALUES (p_name, p_description, p_admission_year)
    RETURNING faq_collections.id INTO v_id;

    RETURN QUERY SELECT * FROM get_faq_collection_by_id(v_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_faq_collection(
    p_id UUID,
    p_name VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_admission_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    admission_year INTEGER,
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

-- Items now reference question_id (not answer_id)
CREATE OR REPLACE FUNCTION add_faq_collection_items(
    p_collection_id UUID,
    p_question_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
    v_question_id UUID;
    v_inserted INTEGER := 0;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_collections WHERE id = p_collection_id AND is_active = true) THEN
        RAISE EXCEPTION 'FAQ collection not found' USING ERRCODE = 'no_data_found';
    END IF;

    FOREACH v_question_id IN ARRAY p_question_ids LOOP
        IF NOT EXISTS (SELECT 1 FROM faq_questions WHERE id = v_question_id AND is_active = true) THEN
            RAISE EXCEPTION 'FAQ question % not found or inactive', v_question_id
                USING ERRCODE = 'no_data_found';
        END IF;

        INSERT INTO faq_collection_items (collection_id, question_id)
        VALUES (p_collection_id, v_question_id)
        ON CONFLICT (collection_id, question_id) DO NOTHING;

        IF FOUND THEN v_inserted := v_inserted + 1; END IF;
    END LOOP;

    RETURN v_inserted;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_faq_collection_item(
    p_collection_id UUID,
    p_question_id UUID
)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM faq_collection_items
        WHERE collection_id = p_collection_id AND question_id = p_question_id
    ) THEN
        RAISE EXCEPTION 'Collection item not found' USING ERRCODE = 'no_data_found';
    END IF;

    DELETE FROM faq_collection_items
    WHERE collection_id = p_collection_id AND question_id = p_question_id;
END;
$$ LANGUAGE plpgsql;

-- Copy a collection to a new admission year (creates draft with same questions)
CREATE OR REPLACE FUNCTION copy_faq_collection(
    p_source_id UUID,
    p_new_admission_year INTEGER,
    p_new_name VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    admission_year INTEGER,
    status VARCHAR,
    published_by UUID,
    published_at TIMESTAMP,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
DECLARE
    v_new_id UUID;
    v_source faq_collections%ROWTYPE;
BEGIN
    SELECT * INTO v_source FROM faq_collections WHERE faq_collections.id = p_source_id AND faq_collections.is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'FAQ collection not found' USING ERRCODE = 'no_data_found';
    END IF;

    INSERT INTO faq_collections (name, description, admission_year)
    VALUES (
        COALESCE(p_new_name, v_source.name),
        v_source.description,
        p_new_admission_year
    )
    RETURNING faq_collections.id INTO v_new_id;

    -- Copy all question items
    INSERT INTO faq_collection_items (collection_id, question_id, sort_order)
    SELECT v_new_id, question_id, sort_order
    FROM faq_collection_items
    WHERE collection_id = p_source_id;

    RETURN QUERY SELECT * FROM get_faq_collection_by_id(v_new_id);
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────────────────
-- SEARCH (remove admission_year, simplified status)
-- ──────────────────────────────────────────────────────────

-- RETURNS TABLE changed (removed admission_year) + params changed → must drop
DROP FUNCTION IF EXISTS search_faq(UUID, UUID, UUID, INTEGER, TEXT, VARCHAR, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS search_faq_count(UUID, UUID, UUID, INTEGER, TEXT, VARCHAR);

CREATE OR REPLACE FUNCTION search_faq(
    p_topic_id UUID DEFAULT NULL,
    p_sub_topic_id UUID DEFAULT NULL,
    p_campus_id UUID DEFAULT NULL,
    p_keyword TEXT DEFAULT NULL,
    p_status VARCHAR DEFAULT 'approved',
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
    ORDER BY a.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_faq_count(
    p_topic_id UUID DEFAULT NULL,
    p_sub_topic_id UUID DEFAULT NULL,
    p_campus_id UUID DEFAULT NULL,
    p_keyword TEXT DEFAULT NULL,
    p_status VARCHAR DEFAULT 'approved'
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


CREATE OR REPLACE FUNCTION delete_faq_collection(p_id UUID)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM faq_collections WHERE id = p_id AND is_active = true) THEN
        RAISE EXCEPTION 'FAQ collection not found' USING ERRCODE = 'no_data_found';
    END IF;

    UPDATE faq_collections SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
