-- =====================================================
-- CAMPUSES AND FOUNDATION FEES SEED DATA
-- Purpose: FPT University campuses and fee structure
-- =====================================================

-- Campuses data (Real FPT campuses with correct discount policies)
INSERT INTO campuses (code, name, city, address, phone, email, discount_percentage) VALUES
('HN', 'FPT University Hà Nội', 'Hà Nội', 'Khu Giáo dục và Đào tạo - Khu Công nghệ cao Hòa Lạc - Km29 Đại lộ Thăng Long, H. Thạch Thất, TP. Hà Nội', '024 7300 5588', 'tuyensinhhanoi@fpt.edu.vn', 0),
('HCM', 'FPT University TP.HCM', 'TP. Hồ Chí Minh', 'Lô E2a-7, Đường D1 Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh', '028 7300 5588', 'tuyensinhhcm@fpt.edu.vn', 0),
('DN', 'FPT University Đà Nẵng', 'Đà Nẵng', 'Khu đô thị công nghệ FPT Đà Nẵng, P. Hoà Hải, Q. Ngũ Hành Sơn, TP. Đà Nẵng', '0236 730 0999', 'tuyensinhdanang@fpt.edu.vn', 30),
('CT', 'FPT University Cần Thơ', 'Cần Thơ', 'Số 600 Đường Nguyễn Văn Cừ (nối dài), P. An Bình, Q. Ninh Kiều, TP. Cần Thơ', '0292 730 3636', 'tuyensinhcantho@fpt.edu.vn', 30),
('QN', 'FPT University Quy Nhơn', 'Quy Nhơn', 'Khu đô thị mới An Phú Thịnh, Phường Nhơn Bình & Phường Đống Đa, TP. Quy Nhơn, Bình Định', '0256 7300 999', 'tuyensinhquynhon@fpt.edu.vn', 50);



-- =====================================================
-- PREPARATION FEES DATA (NEW STRUCTURE)
-- Purpose: Separate orientation and English preparation fees
-- =====================================================

-- Orientation fees (Kỳ định hướng - bắt buộc cho tất cả sinh viên)
INSERT INTO preparation_fees (campus_id, year, fee_type, fee, is_mandatory, max_periods, description) VALUES
-- Hà Nội Campus
((SELECT id FROM campuses WHERE code = 'HN'), 2025, 'orientation', 13100000, true, 1, 'Kỳ định hướng bắt buộc cho tất cả sinh viên mới nhập học'),
-- TP.HCM Campus
((SELECT id FROM campuses WHERE code = 'HCM'), 2025, 'orientation', 13100000, true, 1, 'Kỳ định hướng bắt buộc cho tất cả sinh viên mới nhập học'),
-- Đà Nẵng Campus (30% discount)
((SELECT id FROM campuses WHERE code = 'DN'), 2025, 'orientation', 9170000, true, 1, 'Kỳ định hướng bắt buộc cho tất cả sinh viên mới nhập học (đã giảm 30%)'),
-- Cần Thơ Campus (30% discount)
((SELECT id FROM campuses WHERE code = 'CT'), 2025, 'orientation', 9170000, true, 1, 'Kỳ định hướng bắt buộc cho tất cả sinh viên mới nhập học (đã giảm 30%)'),
-- Quy Nhơn Campus (50% discount)
((SELECT id FROM campuses WHERE code = 'QN'), 2025, 'orientation', 6550000, true, 1, 'Kỳ định hướng bắt buộc cho tất cả sinh viên mới nhập học (đã giảm 50%)');

-- English preparation fees (Kỳ tiếng Anh - tùy chọn theo trình độ)
INSERT INTO preparation_fees (campus_id, year, fee_type, fee, is_mandatory, max_periods, description) VALUES
-- Hà Nội Campus
((SELECT id FROM campuses WHERE code = 'HN'), 2025, 'english_prep', 13100000, false, 6, 'Kỳ tiếng Anh cho sinh viên chưa đạt IELTS 6.0+ (0-6 kỳ tùy trình độ)'),
-- TP.HCM Campus
((SELECT id FROM campuses WHERE code = 'HCM'), 2025, 'english_prep', 13100000, false, 6, 'Kỳ tiếng Anh cho sinh viên chưa đạt IELTS 6.0+ (0-6 kỳ tùy trình độ)'),
-- Đà Nẵng Campus (30% discount)
((SELECT id FROM campuses WHERE code = 'DN'), 2025, 'english_prep', 9170000, false, 6, 'Kỳ tiếng Anh cho sinh viên chưa đạt IELTS 6.0+ (0-6 kỳ tùy trình độ, đã giảm 30%)'),
-- Cần Thơ Campus (30% discount)
((SELECT id FROM campuses WHERE code = 'CT'), 2025, 'english_prep', 9170000, false, 6, 'Kỳ tiếng Anh cho sinh viên chưa đạt IELTS 6.0+ (0-6 kỳ tùy trình độ, đã giảm 30%)'),
-- Quy Nhơn Campus (50% discount)
((SELECT id FROM campuses WHERE code = 'QN'), 2025, 'english_prep', 6550000, false, 6, 'Kỳ tiếng Anh cho sinh viên chưa đạt IELTS 6.0+ (0-6 kỳ tùy trình độ, đã giảm 50%)');

-- Scholarships data (Real FPT 2025 scholarships)
INSERT INTO scholarships (code, name, type, recipients, percentage, requirements, year) VALUES
('EXPERT_GLOBAL', 'Học bổng Chuyên gia Toàn cầu', 'Toàn phần + Sinh hoạt phí', 100, 100, 'Giải Nhất/Nhì/Ba HSG cấp quốc gia ngành CNTT + Phỏng vấn', 2025),
('SCHOOL_PATH', 'Học bổng Học đường', 'Toàn phần', 900, 100, 'Top 10 SchoolRank tại trường THPT Khu vực 1', 2025),
('FULL_SCHOLARSHIP', 'Học bổng Toàn phần', 'Toàn phần', 300, 100, 'Olympic quốc tế hoặc HSG Nhất quốc gia hoặc ĐGNL >= 90%', 2025),
('TWO_YEAR', 'Học bổng 2 năm', 'Miễn 2 năm đầu', 500, 100, 'HSG Nhì quốc gia hoặc ĐGNL >= 85%', 2025),
('ONE_YEAR', 'Học bổng 1 năm', 'Miễn năm đầu', 1000, 100, 'HSG Ba quốc gia hoặc ĐGNL >= 80%', 2025);

-- Admission methods data (Real FPT 2025 methods)
INSERT INTO admission_methods (method_code, name, requirements, year) VALUES
('HB', 'Xét học bạ THPT', 'Top 50 SchoolRank + Điểm kỳ 2 lớp 12 >= 21', 2025),
('DGNL_HN', 'Đánh giá năng lực ĐHQG Hà Nội', 'Điểm >= 80 (đợt 1) hoặc Top 50', 2025),
('DGNL_HCM', 'Đánh giá năng lực ĐHQG TP.HCM', 'Điểm >= 609 (đợt 1) hoặc Top 50', 2025),
('THPT', 'Thi tốt nghiệp THPT', 'Top 50 với tổ hợp Toán + 2 môn bất kỳ', 2025),
('OTHER', 'Phương thức khác', 'BTEC HND, Melbourne Polytechnic, FUNiX, v.v.', 2025);

-- =====================================================
-- COMPLETE PROGRAM CAMPUS AVAILABILITY MATRIX
-- Based on FPT University 2025 official program offerings
-- =====================================================

-- HÀ NỘI CAMPUS - All programs available
INSERT INTO program_campus_availability (program_id, campus_id, year, is_available) VALUES
-- IT Programs
((SELECT id FROM programs WHERE code = 'SE'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'IS'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'AI'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'IA'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'DT'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'MC'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'GD'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
-- Business Programs
((SELECT id FROM programs WHERE code = 'MKT'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'IB'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'CF'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'DBF'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'FT'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'IF'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'SCM'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
-- Communications Programs
((SELECT id FROM programs WHERE code = 'MM'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'PR'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
-- Law Programs
((SELECT id FROM programs WHERE code = 'BL'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'IL'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
-- Language Programs
((SELECT id FROM programs WHERE code = 'EN'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'CN'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'JP'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true),
((SELECT id FROM programs WHERE code = 'KR'), (SELECT id FROM campuses WHERE code = 'HN'), 2025, true);

-- TP.HCM CAMPUS - All programs available (same as Hà Nội)
INSERT INTO program_campus_availability (program_id, campus_id, year, is_available) VALUES
-- IT Programs
((SELECT id FROM programs WHERE code = 'SE'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'IS'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'AI'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'IA'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'DT'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'MC'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'GD'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
-- Business Programs
((SELECT id FROM programs WHERE code = 'MKT'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'IB'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'CF'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'DBF'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'FT'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'IF'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'SCM'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
-- Communications Programs
((SELECT id FROM programs WHERE code = 'MM'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'PR'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
-- Law Programs
((SELECT id FROM programs WHERE code = 'BL'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'IL'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
-- Language Programs
((SELECT id FROM programs WHERE code = 'EN'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'CN'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'JP'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true),
((SELECT id FROM programs WHERE code = 'KR'), (SELECT id FROM campuses WHERE code = 'HCM'), 2025, true);

-- ĐÀ NẴNG CAMPUS - Most programs available including Hotel/Tourism
INSERT INTO program_campus_availability (program_id, campus_id, year, is_available) VALUES
-- IT Programs
((SELECT id FROM programs WHERE code = 'SE'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'AI'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'IA'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'DT'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'MC'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'GD'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
-- Business Programs
((SELECT id FROM programs WHERE code = 'MKT'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'IB'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'HM'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),  -- Hotel Management
((SELECT id FROM programs WHERE code = 'TM'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),  -- Tourism Management
((SELECT id FROM programs WHERE code = 'CF'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'DBF'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'FT'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'IF'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'SCM'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
-- Communications Programs
((SELECT id FROM programs WHERE code = 'MM'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'PR'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
-- Law Programs
((SELECT id FROM programs WHERE code = 'BL'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'IL'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
-- Language Programs
((SELECT id FROM programs WHERE code = 'EN'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'CN'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'JP'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true),
((SELECT id FROM programs WHERE code = 'KR'), (SELECT id FROM campuses WHERE code = 'DN'), 2025, true);

-- CẦN THƠ CAMPUS - Most programs available including Hotel/Tourism
INSERT INTO program_campus_availability (program_id, campus_id, year, is_available) VALUES
-- IT Programs
((SELECT id FROM programs WHERE code = 'SE'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'AI'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'IA'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'DT'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'MC'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'GD'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
-- Business Programs
((SELECT id FROM programs WHERE code = 'MKT'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'IB'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'HM'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),  -- Hotel Management
((SELECT id FROM programs WHERE code = 'TM'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),  -- Tourism Management
((SELECT id FROM programs WHERE code = 'CF'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'DBF'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'FT'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'IF'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'SCM'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
-- Communications Programs
((SELECT id FROM programs WHERE code = 'MM'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'PR'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
-- Law Programs
((SELECT id FROM programs WHERE code = 'BL'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'IL'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
-- Language Programs
((SELECT id FROM programs WHERE code = 'EN'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'CN'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'JP'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true),
((SELECT id FROM programs WHERE code = 'KR'), (SELECT id FROM campuses WHERE code = 'CT'), 2025, true);

-- QUY NHƠN CAMPUS - Limited programs available
INSERT INTO program_campus_availability (program_id, campus_id, year, is_available) VALUES
-- IT Programs
((SELECT id FROM programs WHERE code = 'SE'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
((SELECT id FROM programs WHERE code = 'AI'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
((SELECT id FROM programs WHERE code = 'IA'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
((SELECT id FROM programs WHERE code = 'DT'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
((SELECT id FROM programs WHERE code = 'MC'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
((SELECT id FROM programs WHERE code = 'GD'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
-- Business Programs (limited)
((SELECT id FROM programs WHERE code = 'MKT'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
((SELECT id FROM programs WHERE code = 'IB'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
((SELECT id FROM programs WHERE code = 'FT'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
((SELECT id FROM programs WHERE code = 'SCM'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
-- Communications Programs
((SELECT id FROM programs WHERE code = 'MM'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
((SELECT id FROM programs WHERE code = 'PR'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
-- Law Programs (limited)
((SELECT id FROM programs WHERE code = 'BL'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true),
-- Language Programs (limited)
((SELECT id FROM programs WHERE code = 'EN'), (SELECT id FROM campuses WHERE code = 'QN'), 2025, true);
