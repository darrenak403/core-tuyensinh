-- =====================================================
-- INDEXES AND CONSTRAINTS
-- Purpose: Performance indexes and data integrity constraints
-- =====================================================

-- CRITICAL INDEXES: Foreign Keys (Performance Critical)
CREATE INDEX idx_progressive_tuition_program_id ON progressive_tuition(program_id);
CREATE INDEX idx_progressive_tuition_campus_id ON progressive_tuition(campus_id);
CREATE INDEX idx_program_campus_program_id ON program_campus_availability(program_id);
CREATE INDEX idx_program_campus_campus_id ON program_campus_availability(campus_id);

CREATE INDEX idx_programs_department_id ON programs(department_id);

-- QUERY PERFORMANCE INDEXES
CREATE INDEX idx_progressive_tuition_year ON progressive_tuition(year);
CREATE INDEX idx_scholarships_year ON scholarships(year);
CREATE INDEX idx_departments_code ON departments(code);

-- APPLICATION SYSTEM INDEXES
CREATE INDEX idx_applications_program_id ON applications(program_id);
CREATE INDEX idx_applications_campus_id ON applications(campus_id);
CREATE INDEX idx_applications_admission_method_id ON applications(admission_method_id);
CREATE INDEX idx_applications_scholarship_id ON applications(scholarship_id);
CREATE INDEX idx_applications_processed_by ON applications(processed_by);
CREATE INDEX idx_applications_email ON applications(email);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX idx_applications_source ON applications(source);
CREATE INDEX idx_applications_code ON applications(application_code);
CREATE INDEX idx_applications_chatbot_session ON applications(chatbot_session_id);
CREATE INDEX idx_applications_graduation_year ON applications(graduation_year);
CREATE INDEX idx_applications_processed_at ON applications(processed_at);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_application_documents_application_id ON application_documents(application_id);
CREATE INDEX idx_application_documents_type ON application_documents(document_type);

-- CHATBOT SYSTEM INDEXES
CREATE INDEX idx_chatbot_conversations_session_id ON chatbot_conversations(session_id);
CREATE INDEX idx_chatbot_conversations_started_at ON chatbot_conversations(started_at);
CREATE INDEX idx_chatbot_conversations_application_id ON chatbot_conversations(created_application_id);
CREATE INDEX idx_chatbot_conversations_ended_at ON chatbot_conversations(ended_at);

CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_chat_messages_type ON chat_messages(message_type);
CREATE INDEX idx_chat_messages_metadata ON chat_messages USING gin(metadata);

CREATE INDEX idx_user_intents_conversation_id ON user_intents(conversation_id);
CREATE INDEX idx_user_intents_message_id ON user_intents(message_id);
CREATE INDEX idx_user_intents_intent_name ON user_intents(intent_name);
CREATE INDEX idx_user_intents_confidence ON user_intents(confidence_score);
CREATE INDEX idx_user_intents_resolved ON user_intents(resolved);
CREATE INDEX idx_user_intents_entities ON user_intents USING gin(entities);

CREATE INDEX idx_chatbot_analytics_date ON chatbot_analytics(metric_date);
CREATE INDEX idx_chatbot_analytics_type ON chatbot_analytics(metric_type);
CREATE INDEX idx_chatbot_analytics_date_type ON chatbot_analytics(metric_date, metric_type);
CREATE INDEX idx_chatbot_analytics_metadata ON chatbot_analytics USING gin(metadata);

-- SEARCH OPTIMIZATION INDEXES
CREATE INDEX idx_programs_name_trgm ON programs USING gin(name gin_trgm_ops);
CREATE INDEX idx_programs_name_en_trgm ON programs USING gin(name_en gin_trgm_ops) WHERE name_en IS NOT NULL;
CREATE INDEX idx_departments_name_trgm ON departments USING gin(name gin_trgm_ops);
CREATE INDEX idx_programs_departments_active ON programs(department_id, is_active) WHERE is_active = true;
CREATE INDEX idx_programs_code_lower ON programs(LOWER(code));

-- DATA INTEGRITY CONSTRAINTS (Critical for Data Protection)

-- Progressive tuition constraints
ALTER TABLE progressive_tuition ADD CONSTRAINT chk_semester_fees_positive
    CHECK (semester_group_1_3_fee > 0 AND semester_group_4_6_fee > 0 AND semester_group_7_9_fee > 0);

ALTER TABLE progressive_tuition ADD CONSTRAINT chk_semester_fee_progression
    CHECK (semester_group_1_3_fee <= semester_group_4_6_fee AND semester_group_4_6_fee <= semester_group_7_9_fee);

-- Campus constraints
ALTER TABLE campuses ADD CONSTRAINT chk_discount_valid
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Preparation fees constraints
ALTER TABLE preparation_fees ADD CONSTRAINT chk_preparation_fees_positive
    CHECK (fee > 0);

ALTER TABLE preparation_fees ADD CONSTRAINT chk_preparation_max_periods_valid
    CHECK (max_periods > 0 AND max_periods <= 10);

ALTER TABLE preparation_fees ADD CONSTRAINT chk_preparation_year_valid
    CHECK (year >= 2020 AND year <= 2035);

-- Preparation fees indexes
CREATE INDEX idx_preparation_fees_campus_year ON preparation_fees(campus_id, year) WHERE is_active = true;
CREATE INDEX idx_preparation_fees_type ON preparation_fees(fee_type) WHERE is_active = true;
CREATE INDEX idx_preparation_fees_year ON preparation_fees(year) WHERE is_active = true;

-- Scholarship constraints
ALTER TABLE scholarships ADD CONSTRAINT chk_percentage_valid
    CHECK (percentage >= 0 AND percentage <= 100);

-- Program constraints
ALTER TABLE programs ADD CONSTRAINT chk_duration_valid
    CHECK (duration_years BETWEEN 1 AND 6);

-- Year validation constraints
ALTER TABLE progressive_tuition ADD CONSTRAINT chk_year_valid
    CHECK (year >= 2020 AND year <= 2035);

ALTER TABLE admission_methods ADD CONSTRAINT chk_year_valid_admission
    CHECK (year >= 2020 AND year <= 2035);

-- CHATBOT SYSTEM CONSTRAINTS

-- Chatbot conversations constraints
ALTER TABLE chatbot_conversations ADD CONSTRAINT chk_satisfaction_rating_valid
    CHECK (satisfaction_rating IS NULL OR (satisfaction_rating >= 1 AND satisfaction_rating <= 5));

ALTER TABLE chatbot_conversations ADD CONSTRAINT chk_total_messages_positive
    CHECK (total_messages >= 0);

ALTER TABLE chatbot_conversations ADD CONSTRAINT chk_conversation_duration
    CHECK (ended_at IS NULL OR ended_at >= started_at);

-- User intents constraints
ALTER TABLE user_intents ADD CONSTRAINT chk_confidence_score_valid
    CHECK (confidence_score IS NULL OR (confidence_score >= 0.00 AND confidence_score <= 1.00));

-- Chatbot analytics constraints
ALTER TABLE chatbot_analytics ADD CONSTRAINT chk_metric_value_valid
    CHECK (metric_value >= 0);

-- ADMISSION SYSTEM CONSTRAINTS

-- Admission quotas constraints
ALTER TABLE admission_quotas ADD CONSTRAINT chk_year_valid_quotas
    CHECK (year >= 2020 AND year <= 2035);

ALTER TABLE admission_quotas ADD CONSTRAINT chk_quota_positive
    CHECK (total_quota > 0);

-- Admission policies constraints
ALTER TABLE admission_policies ADD CONSTRAINT chk_year_valid_policies
    CHECK (year >= 2020 AND year <= 2035);

-- Admission timeline constraints
ALTER TABLE admission_timeline ADD CONSTRAINT chk_year_valid_timeline
    CHECK (year >= 2020 AND year <= 2035);

-- ADMISSION SYSTEM INDEXES

-- Admission quotas indexes
CREATE INDEX idx_admission_quotas_program_year ON admission_quotas(program_id, year);
CREATE INDEX idx_admission_quotas_year ON admission_quotas(year) WHERE is_active = true;
CREATE INDEX idx_admission_quotas_program ON admission_quotas(program_id) WHERE is_active = true;

-- Admission policies indexes
CREATE INDEX idx_admission_policies_year ON admission_policies(year) WHERE is_active = true;
CREATE INDEX idx_admission_policies_code ON admission_policies(policy_code);

-- Admission timeline indexes
CREATE INDEX idx_admission_timeline_year ON admission_timeline(year) WHERE is_active = true;
CREATE INDEX idx_admission_timeline_dates ON admission_timeline(start_date, end_date) WHERE is_active = true;
