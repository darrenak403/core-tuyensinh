-- =====================================================
-- PREPARATION FEES EXAMPLES AND SCENARIOS
-- Purpose: Sample data showing different fee scenarios
-- =====================================================

-- =====================================================
-- SAMPLE STUDENT SCENARIOS
-- =====================================================

-- Sample student fee calculations for different scenarios
INSERT INTO chatbot_analytics (metric_date, metric_type, metric_value, metadata) VALUES
('2025-01-28', 'fee_scenario_1', 1, '{
  "scenario": "student_with_ielts",
  "description": "Sinh viên có IELTS 6.0+ học SE tại Hà Nội",
  "calculation": {
    "orientation_fee": 13100000,
    "english_prep_fee": 0,
    "total_prep_cost": 13100000,
    "program_fees": [31600000, 33600000, 35800000],
    "total_program_cost": 301200000,
    "grand_total": 314300000
  }
}'),

('2025-01-28', 'fee_scenario_2', 2, '{
  "scenario": "student_without_ielts_3_levels",
  "description": "Sinh viên chưa có IELTS, cần 3 kỳ tiếng Anh, học SE tại Hà Nội",
  "calculation": {
    "orientation_fee": 13100000,
    "english_prep_fee": 39300000,
    "total_prep_cost": 52400000,
    "program_fees": [31600000, 33600000, 35800000],
    "total_program_cost": 301200000,
    "grand_total": 353600000
  }
}'),

('2025-01-28', 'fee_scenario_3', 3, '{
  "scenario": "student_quy_nhon_discount",
  "description": "Sinh viên học SE tại Quy Nhơn (giảm 50%), cần 2 kỳ tiếng Anh",
  "calculation": {
    "orientation_fee": 6550000,
    "english_prep_fee": 13100000,
    "total_prep_cost": 19650000,
    "program_fees": [15800000, 16800000, 17900000],
    "total_program_cost": 151500000,
    "grand_total": 171150000
  }
}'),

('2025-01-28', 'fee_scenario_4', 4, '{
  "scenario": "law_student_da_nang",
  "description": "Sinh viên học Luật tại Đà Nẵng (giảm 30%), có IELTS",
  "calculation": {
    "orientation_fee": 9170000,
    "english_prep_fee": 0,
    "total_prep_cost": 9170000,
    "program_fees": [15480000, 16460000, 17540000],
    "total_program_cost": 147360000,
    "grand_total": 156530000
  }
}');

-- =====================================================
-- PREPARATION FEES POLICY INFORMATION
-- =====================================================

-- Insert policy information for chatbot responses
INSERT INTO admission_policies (policy_code, name, description, year, is_active) VALUES
('ORIENT_MANDATORY', 'Kỳ định hướng bắt buộc', 'Tất cả sinh viên mới nhập học đều phải tham gia kỳ định hướng (1 học kỳ)', 2025, true),

('ENGLISH_CONDITIONAL', 'Kỳ tiếng Anh có điều kiện', 'Sinh viên có IELTS 6.0+ (hoặc tương đương) được miễn kỳ tiếng Anh. Sinh viên khác sẽ được xếp lớp theo trình độ (0-6 kỳ)', 2025, true),

('ENG_CERTS', 'Chứng chỉ tiếng Anh được công nhận', 'TOEFL iBT ≥80, IELTS ≥6.0, VSTEP bậc 4, JLPT N3+, TOPIK 4+, HSK 4+ được miễn kỳ tiếng Anh', 2025, true),

('CAMPUS_DISCOUNT', 'Chính sách giảm giá theo campus', 'Đà Nẵng/Cần Thơ: giảm 30%, Quy Nhơn: giảm 50% cho tất cả loại phí', 2025, true),

('FEE_STABILITY', 'Ổn định học phí', 'Học phí cho sinh viên nhập học 2025 không thay đổi trong suốt quá trình học', 2025, true);

-- =====================================================
-- SAMPLE CHATBOT CONVERSATIONS ABOUT FEES
-- =====================================================

-- Sample conversation about preparation fees
INSERT INTO chatbot_conversations (session_id, user_ip, started_at, ended_at, total_messages, satisfaction_rating, conversation_summary) VALUES
('PREP_FEES_20250128_001', '192.168.1.200', '2025-01-28 15:00:00', '2025-01-28 15:12:00', 10, 5, 'User inquired about preparation fees structure, explained orientation vs English prep fees');

-- Sample messages about preparation fees
INSERT INTO chat_messages (conversation_id, message_type, content, metadata) VALUES
((SELECT id FROM chatbot_conversations WHERE session_id = 'PREP_FEES_20250128_001'), 'user', 'Cho em hỏi về học phí kỳ định hướng ạ?', '{"intent": "fee_inquiry", "confidence": 0.95, "fee_type": "preparation"}'),

((SELECT id FROM chatbot_conversations WHERE session_id = 'PREP_FEES_20250128_001'), 'assistant', 'Em có 2 loại phí chuẩn bị trước khi vào chuyên ngành:

1. **Kỳ định hướng** (bắt buộc): 13.1 triệu (HN/HCM), 9.17 triệu (DN/CT), 6.55 triệu (QN)
2. **Kỳ tiếng Anh** (tùy chọn): Cùng mức phí, 0-6 kỳ tùy trình độ

Em có IELTS 6.0+ không ạ?', '{"response_type": "fee_explanation", "fee_types": ["orientation", "english_prep"]}'),

((SELECT id FROM chatbot_conversations WHERE session_id = 'PREP_FEES_20250128_001'), 'user', 'Em chưa có IELTS, dự định học tại Đà Nẵng', '{"intent": "campus_selection", "confidence": 0.92, "campus": "DN", "english_level": "no_certificate"}'),

((SELECT id FROM chatbot_conversations WHERE session_id = 'PREP_FEES_20250128_001'), 'assistant', 'Tại Đà Nẵng em sẽ có:

**Phí chuẩn bị:**
- Kỳ định hướng: 9.17 triệu (bắt buộc)
- Kỳ tiếng Anh: 9.17 triệu/kỳ × số kỳ cần học (0-6 kỳ)

**Ví dụ:** Nếu em cần 3 kỳ tiếng Anh:
- Tổng phí chuẩn bị: 9.17M + (9.17M × 3) = 36.68 triệu

Sau đó mới vào học chuyên ngành với học phí chính thức.', '{"response_type": "fee_calculation", "campus": "DN", "scenario": "3_english_levels"}');

-- Sample user intents for preparation fees
INSERT INTO user_intents (conversation_id, message_id, intent_name, confidence_score, entities, resolved) VALUES
((SELECT id FROM chatbot_conversations WHERE session_id = 'PREP_FEES_20250128_001'),
 (SELECT id FROM chat_messages WHERE content LIKE 'Cho em hỏi về học phí kỳ định hướng%' LIMIT 1),
 'preparation_fee_inquiry', 0.95, '{"fee_type": "orientation", "inquiry_type": "general"}', true),

((SELECT id FROM chatbot_conversations WHERE session_id = 'PREP_FEES_20250128_001'),
 (SELECT id FROM chat_messages WHERE content LIKE 'Em chưa có IELTS%' LIMIT 1),
 'english_level_assessment', 0.92, '{"english_certificate": "none", "campus": "DN"}', true);
