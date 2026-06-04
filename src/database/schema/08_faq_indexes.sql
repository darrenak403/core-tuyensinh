-- =====================================================
-- FAQ / KNOWLEDGE MANAGEMENT INDEXES
-- =====================================================

-- faq_sub_topics
CREATE INDEX IF NOT EXISTS idx_faq_sub_topics_topic_id ON faq_sub_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_faq_sub_topics_is_active ON faq_sub_topics(is_active);

-- faq_questions
CREATE INDEX IF NOT EXISTS idx_faq_questions_sub_topic_id ON faq_questions(sub_topic_id);
CREATE INDEX IF NOT EXISTS idx_faq_questions_status ON faq_questions(status);
CREATE INDEX IF NOT EXISTS idx_faq_questions_is_active ON faq_questions(is_active);

-- faq_answers
CREATE INDEX IF NOT EXISTS idx_faq_answers_question_id ON faq_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_faq_answers_status ON faq_answers(status);
CREATE INDEX IF NOT EXISTS idx_faq_answers_admission_year ON faq_answers(admission_year);
CREATE INDEX IF NOT EXISTS idx_faq_answers_is_active ON faq_answers(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_answers_keywords ON faq_answers USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_faq_answers_tags ON faq_answers USING GIN(tags);

-- faq_answer_campuses
CREATE INDEX IF NOT EXISTS idx_faq_answer_campuses_answer_id ON faq_answer_campuses(answer_id);
CREATE INDEX IF NOT EXISTS idx_faq_answer_campuses_campus_id ON faq_answer_campuses(campus_id);

-- faq_collections
CREATE INDEX IF NOT EXISTS idx_faq_collections_status ON faq_collections(status);
CREATE INDEX IF NOT EXISTS idx_faq_collections_admission_year ON faq_collections(admission_year);
CREATE INDEX IF NOT EXISTS idx_faq_collections_campus_id ON faq_collections(campus_id);

-- faq_collection_items
CREATE INDEX IF NOT EXISTS idx_faq_collection_items_collection_id ON faq_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_faq_collection_items_answer_id ON faq_collection_items(answer_id);
