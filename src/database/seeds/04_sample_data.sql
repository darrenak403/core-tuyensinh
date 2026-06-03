-- =====================================================
-- SAMPLE DATA FOR TESTING
-- Purpose: Sample tuition data and test records
-- =====================================================

-- =====================================================
-- COMPLETE PROGRESSIVE TUITION DATA FOR ALL PROGRAMS
-- Based on FPT University 2025 official fee structure
-- =====================================================

-- HIGH-TIER PROGRAMS (IT, Business, Communications)
-- Hà Nội Campus - No discount
INSERT INTO progressive_tuition (program_id, campus_id, year, semester_group_1_3_fee, semester_group_4_6_fee, semester_group_7_9_fee) VALUES
-- IT Programs
((SELECT id FROM programs WHERE code = 'SE'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'IS'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'AI'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'IA'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'DT'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'MC'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'GD'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
-- Business Programs
((SELECT id FROM programs WHERE code = 'MKT'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'IB'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'CF'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'DBF'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'FT'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'IF'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'SCM'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
-- Communications Programs
((SELECT id FROM programs WHERE code = 'MM'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'PR'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 31600000, 33600000, 35800000);

-- HCM Campus - Same as Hà Nội (No discount)
INSERT INTO progressive_tuition (program_id, campus_id, year, semester_group_1_3_fee, semester_group_4_6_fee, semester_group_7_9_fee) VALUES
-- IT Programs
((SELECT id FROM programs WHERE code = 'SE'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'IS'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'AI'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'IA'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'DT'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'MC'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'GD'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
-- Business Programs
((SELECT id FROM programs WHERE code = 'MKT'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'IB'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'CF'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'DBF'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'FT'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'IF'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'SCM'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
-- Communications Programs
((SELECT id FROM programs WHERE code = 'MM'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000),
((SELECT id FROM programs WHERE code = 'PR'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 31600000, 33600000, 35800000);

-- Đà Nẵng Campus - 30% discount applied to high-tier programs
INSERT INTO progressive_tuition (program_id, campus_id, year, semester_group_1_3_fee, semester_group_4_6_fee, semester_group_7_9_fee) VALUES
-- IT Programs
((SELECT id FROM programs WHERE code = 'SE'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'AI'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'IA'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'DT'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'MC'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'GD'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
-- Business Programs (high-tier)
((SELECT id FROM programs WHERE code = 'MKT'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'IB'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'CF'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'DBF'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'FT'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'IF'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'SCM'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
-- Business Programs (special - Hotel/Tourism with different rates)
((SELECT id FROM programs WHERE code = 'HM'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 15480000, 16460000, 17540000),
((SELECT id FROM programs WHERE code = 'TM'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 15480000, 16460000, 17540000),
-- Communications Programs
((SELECT id FROM programs WHERE code = 'MM'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'PR'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 22120000, 23520000, 25060000);

-- Cần Thơ Campus - 30% discount applied (same as Đà Nẵng)
INSERT INTO progressive_tuition (program_id, campus_id, year, semester_group_1_3_fee, semester_group_4_6_fee, semester_group_7_9_fee) VALUES
-- IT Programs
((SELECT id FROM programs WHERE code = 'SE'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'AI'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'IA'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'DT'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'MC'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'GD'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
-- Business Programs (high-tier)
((SELECT id FROM programs WHERE code = 'MKT'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'IB'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'CF'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'DBF'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'FT'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'IF'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'SCM'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
-- Business Programs (special - Hotel/Tourism)
((SELECT id FROM programs WHERE code = 'HM'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 15480000, 16460000, 17540000),
((SELECT id FROM programs WHERE code = 'TM'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 15480000, 16460000, 17540000),
-- Communications Programs
((SELECT id FROM programs WHERE code = 'MM'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'PR'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 22120000, 23520000, 25060000);

-- Quy Nhơn Campus - 50% discount applied (limited programs)
INSERT INTO progressive_tuition (program_id, campus_id, year, semester_group_1_3_fee, semester_group_4_6_fee, semester_group_7_9_fee) VALUES
-- IT Programs
((SELECT id FROM programs WHERE code = 'SE'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 15800000, 16800000, 17900000),
((SELECT id FROM programs WHERE code = 'AI'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 15800000, 16800000, 17900000),
((SELECT id FROM programs WHERE code = 'IA'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 15800000, 16800000, 17900000),
((SELECT id FROM programs WHERE code = 'DT'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 15800000, 16800000, 17900000),
((SELECT id FROM programs WHERE code = 'MC'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 15800000, 16800000, 17900000),
((SELECT id FROM programs WHERE code = 'GD'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 15800000, 16800000, 17900000),
-- Business Programs (limited selection)
((SELECT id FROM programs WHERE code = 'MKT'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 15800000, 16800000, 17900000),
((SELECT id FROM programs WHERE code = 'IB'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 15800000, 16800000, 17900000),
((SELECT id FROM programs WHERE code = 'FT'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 15800000, 16800000, 17900000),
((SELECT id FROM programs WHERE code = 'SCM'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 15800000, 16800000, 17900000),
-- Communications Programs
((SELECT id FROM programs WHERE code = 'MM'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 15800000, 16800000, 17900000),
((SELECT id FROM programs WHERE code = 'PR'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 15800000, 16800000, 17900000);

-- LAW AND LANGUAGE PROGRAMS (Lower fee tier)
-- Hà Nội Campus - Law and Language programs
INSERT INTO progressive_tuition (program_id, campus_id, year, semester_group_1_3_fee, semester_group_4_6_fee, semester_group_7_9_fee) VALUES
((SELECT id FROM programs WHERE code = 'BL'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'IL'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'EN'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'CN'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'JP'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'KR'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, 22120000, 23520000, 25060000);

-- HCM Campus - Law and Language programs
INSERT INTO progressive_tuition (program_id, campus_id, year, semester_group_1_3_fee, semester_group_4_6_fee, semester_group_7_9_fee) VALUES
((SELECT id FROM programs WHERE code = 'BL'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'IL'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'EN'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'CN'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'JP'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 22120000, 23520000, 25060000),
((SELECT id FROM programs WHERE code = 'KR'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, 22120000, 23520000, 25060000);

-- Đà Nẵng Campus - Law and Language programs (30% discount)
INSERT INTO progressive_tuition (program_id, campus_id, year, semester_group_1_3_fee, semester_group_4_6_fee, semester_group_7_9_fee) VALUES
((SELECT id FROM programs WHERE code = 'BL'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 15480000, 16460000, 17540000),
((SELECT id FROM programs WHERE code = 'IL'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 15480000, 16460000, 17540000),
((SELECT id FROM programs WHERE code = 'EN'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 15480000, 16460000, 17540000),
((SELECT id FROM programs WHERE code = 'CN'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 15480000, 16460000, 17540000),
((SELECT id FROM programs WHERE code = 'JP'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 15480000, 16460000, 17540000),
((SELECT id FROM programs WHERE code = 'KR'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, 15480000, 16460000, 17540000);

-- Cần Thơ Campus - Law and Language programs (30% discount)
INSERT INTO progressive_tuition (program_id, campus_id, year, semester_group_1_3_fee, semester_group_4_6_fee, semester_group_7_9_fee) VALUES
((SELECT id FROM programs WHERE code = 'BL'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 15480000, 16460000, 17540000),
((SELECT id FROM programs WHERE code = 'IL'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 15480000, 16460000, 17540000),
((SELECT id FROM programs WHERE code = 'EN'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 15480000, 16460000, 17540000),
((SELECT id FROM programs WHERE code = 'CN'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 15480000, 16460000, 17540000),
((SELECT id FROM programs WHERE code = 'JP'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 15480000, 16460000, 17540000),
((SELECT id FROM programs WHERE code = 'KR'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, 15480000, 16460000, 17540000);

-- Quy Nhơn Campus - Limited Law and Language programs (50% discount)
INSERT INTO progressive_tuition (program_id, campus_id, year, semester_group_1_3_fee, semester_group_4_6_fee, semester_group_7_9_fee) VALUES
((SELECT id FROM programs WHERE code = 'BL'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 11060000, 11760000, 12530000),
((SELECT id FROM programs WHERE code = 'EN'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, 11060000, 11760000, 12530000);

-- Sample chatbot conversations for testing
INSERT INTO chatbot_conversations (session_id, user_ip, started_at, ended_at, total_messages, satisfaction_rating, conversation_summary) VALUES
('CHAT_20250127120000_ABC123DEF0', '192.168.1.100', '2025-01-27 12:00:00', '2025-01-27 12:15:00', 8, 5, 'User inquired about SE program at HN campus, provided tuition info'),
('CHAT_20250127130000_XYZ789GHI0', '192.168.1.101', '2025-01-27 13:00:00', '2025-01-27 13:10:00', 6, 4, 'User asked about scholarships and admission methods'),
('CHAT_20250127140000_DEF456JKL0', '192.168.1.102', '2025-01-27 14:00:00', NULL, 3, NULL, NULL);

-- Sample chat messages
INSERT INTO chat_messages (conversation_id, message_type, content, metadata) VALUES
((SELECT id FROM chatbot_conversations WHERE session_id = 'CHAT_20250127120000_ABC123DEF0'), 'user', 'Chào bạn, tôi muốn tìm hiểu về ngành Kỹ thuật phần mềm', '{"intent": "program_inquiry", "confidence": 0.95}'),
((SELECT id FROM chatbot_conversations WHERE session_id = 'CHAT_20250127120000_ABC123DEF0'), 'assistant', 'Xin chào! Tôi có thể giúp bạn tìm hiểu về ngành Kỹ thuật phần mềm (SE). Bạn muốn biết thông tin gì cụ thể?', '{"response_type": "greeting", "suggested_actions": ["tuition", "campus", "admission"]}'),
((SELECT id FROM chatbot_conversations WHERE session_id = 'CHAT_20250127120000_ABC123DEF0'), 'user', 'Học phí như thế nào ạ?', '{"intent": "fee_inquiry", "confidence": 0.92}'),
((SELECT id FROM chatbot_conversations WHERE session_id = 'CHAT_20250127120000_ABC123DEF0'), 'assistant', 'Học phí ngành SE tại FPT University như sau: Kỳ 1-3: 31.6 triệu/kỳ, Kỳ 4-6: 33.6 triệu/kỳ, Kỳ 7-9: 35.8 triệu/kỳ', '{"response_type": "tuition_info", "program_code": "SE"}');

-- Sample user intents
INSERT INTO user_intents (conversation_id, message_id, intent_name, confidence_score, entities, resolved) VALUES
((SELECT id FROM chatbot_conversations WHERE session_id = 'CHAT_20250127120000_ABC123DEF0'),
 (SELECT id FROM chat_messages WHERE content = 'Chào bạn, tôi muốn tìm hiểu về ngành Kỹ thuật phần mềm' LIMIT 1),
 'program_inquiry', 0.95, '{"program": "SE", "program_name": "Kỹ thuật phần mềm"}', true),
((SELECT id FROM chatbot_conversations WHERE session_id = 'CHAT_20250127120000_ABC123DEF0'),
 (SELECT id FROM chat_messages WHERE content = 'Học phí như thế nào ạ?' LIMIT 1),
 'fee_inquiry', 0.92, '{"inquiry_type": "tuition", "program": "SE"}', true);

-- Sample chatbot analytics
INSERT INTO chatbot_analytics (metric_date, metric_type, metric_value, metadata) VALUES
('2025-01-27', 'daily_conversations', 25, '{"completed": 20, "ongoing": 5}'),
('2025-01-27', 'popular_intents', 15, '{"program_inquiry": 8, "fee_inquiry": 4, "campus_info": 3}'),
('2025-01-27', 'conversion_rate', 0.15, '{"conversations_to_applications": 15, "total_conversations": 100}'),
('2025-01-26', 'daily_conversations', 30, '{"completed": 25, "ongoing": 5}'),
('2025-01-26', 'popular_intents', 18, '{"program_inquiry": 10, "fee_inquiry": 5, "campus_info": 3}');
