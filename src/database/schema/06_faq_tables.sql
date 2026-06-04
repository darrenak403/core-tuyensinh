-- =====================================================
-- FAQ / KNOWLEDGE MANAGEMENT TABLES
-- Purpose: Admission FAQ system as Single Source of Truth
-- =====================================================

-- FAQ Main Topics (Chủ đề chính)
CREATE TABLE IF NOT EXISTS faq_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v8(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Sub Topics (Chủ đề con)
CREATE TABLE IF NOT EXISTS faq_sub_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v8(),
    topic_id UUID NOT NULL REFERENCES faq_topics(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Questions (Câu hỏi)
-- Workflow: new → approved → published | new → rejected | approved → deleted
CREATE TABLE IF NOT EXISTS faq_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v8(),
    sub_topic_id UUID NOT NULL REFERENCES faq_sub_topics(id),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new'
        CHECK (status IN ('new', 'approved', 'published', 'rejected', 'deleted')),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    published_by UUID REFERENCES users(id),
    published_at TIMESTAMP,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Answers (Câu trả lời chính thức)
-- Workflow: new → approved → published | new → rejected | approved → updated → re_approved
-- Campus scope managed via faq_answer_campuses junction table
CREATE TABLE IF NOT EXISTS faq_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v8(),
    question_id UUID NOT NULL REFERENCES faq_questions(id),
    admission_year INTEGER NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new'
        CHECK (status IN ('new', 'approved', 'published', 'rejected', 'updated', 're_approved')),
    tags TEXT[],        -- Tags for AI/chatbot categorization
    keywords TEXT[],    -- Keywords for full-text search
    synonyms TEXT[],    -- Question variants for chatbot matching
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    published_by UUID REFERENCES users(id),
    published_at TIMESTAMP,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table: answer ↔ campus
-- No rows for an answer = applies to ALL campuses
-- Has rows = applies only to listed campuses
CREATE TABLE IF NOT EXISTS faq_answer_campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v8(),
    answer_id UUID NOT NULL REFERENCES faq_answers(id) ON DELETE CASCADE,
    campus_id UUID NOT NULL REFERENCES campuses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(answer_id, campus_id)
);

-- FAQ Collections (Tập hợp FAQ theo đợt tuyển sinh)
-- e.g. FAQ Admissions 2026, FAQ International Students 2026
CREATE TABLE IF NOT EXISTS faq_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v8(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    admission_year INTEGER NOT NULL,
    campus_id UUID REFERENCES campuses(id), -- NULL = applies to all campuses
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'archived')),
    published_by UUID REFERENCES users(id),
    published_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table: collection ↔ answer
CREATE TABLE IF NOT EXISTS faq_collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v8(),
    collection_id UUID NOT NULL REFERENCES faq_collections(id) ON DELETE CASCADE,
    answer_id UUID NOT NULL REFERENCES faq_answers(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, answer_id)
);
