-- =====================================================
-- ADMISSION QUOTAS AND REQUIREMENTS SEED DATA
-- Purpose: FPT University 2025 admission data
-- Based on official FPT University 2025 admission information
-- =====================================================

-- =====================================================
-- ADMISSION QUOTAS BY PROGRAM (Total: 13,127 students)
-- =====================================================

-- Create admission quotas table data
INSERT INTO admission_quotas (program_id, year, total_quota, notes) VALUES
-- IT Programs (Total: 8,125)
((SELECT id FROM programs WHERE code = 'SE'), 2025, 2500, 'Kỹ thuật phần mềm - Ngành trọng điểm'),
((SELECT id FROM programs WHERE code = 'IS'), 2025, 1200, 'Hệ thống thông tin'),
((SELECT id FROM programs WHERE code = 'AI'), 2025, 1500, 'Trí tuệ nhân tạo - Ngành hot'),
((SELECT id FROM programs WHERE code = 'IA'), 2025, 1000, 'An toàn thông tin'),
((SELECT id FROM programs WHERE code = 'DT'), 2025, 800, 'Công nghệ ô tô số'),
((SELECT id FROM programs WHERE code = 'MC'), 2025, 625, 'Thiết kế vi mạch bán dẫn'),
((SELECT id FROM programs WHERE code = 'GD'), 2025, 500, 'Thiết kế mỹ thuật số'),

-- Business Programs (Total: 3,164)
((SELECT id FROM programs WHERE code = 'MKT'), 2025, 800, 'Digital Marketing'),
((SELECT id FROM programs WHERE code = 'IB'), 2025, 600, 'Kinh doanh quốc tế'),
((SELECT id FROM programs WHERE code = 'HM'), 2025, 200, 'Quản trị khách sạn - Chỉ DN/CT'),
((SELECT id FROM programs WHERE code = 'TM'), 2025, 180, 'Quản trị dịch vụ du lịch - Chỉ DN/CT'),
((SELECT id FROM programs WHERE code = 'CF'), 2025, 400, 'Tài chính doanh nghiệp (New)'),
((SELECT id FROM programs WHERE code = 'DBF'), 2025, 350, 'Ngân hàng số - Tài chính (New)'),
((SELECT id FROM programs WHERE code = 'FT'), 2025, 300, 'Công nghệ tài chính (New)'),
((SELECT id FROM programs WHERE code = 'IF'), 2025, 250, 'Tài chính đầu tư (New)'),
((SELECT id FROM programs WHERE code = 'SCM'), 2025, 284, 'Logistics & quản lý chuỗi cung ứng toàn cầu'),

-- Communications Programs (Total: 1,073)
((SELECT id FROM programs WHERE code = 'MM'), 2025, 600, 'Truyền thông đa phương tiện'),
((SELECT id FROM programs WHERE code = 'PR'), 2025, 473, 'Quan hệ công chúng'),

-- Law Programs (Total: 98)
((SELECT id FROM programs WHERE code = 'BL'), 2025, 50, 'Luật kinh tế (New)'),
((SELECT id FROM programs WHERE code = 'IL'), 2025, 48, 'Luật thương mại quốc tế (New)'),

-- Language Programs (Total: 667)
((SELECT id FROM programs WHERE code = 'EN'), 2025, 302, 'Ngôn ngữ Anh'),
((SELECT id FROM programs WHERE code = 'CN'), 2025, 143, 'Song ngữ Trung - Anh'),
((SELECT id FROM programs WHERE code = 'JP'), 2025, 68, 'Song ngữ Nhật - Anh'),
((SELECT id FROM programs WHERE code = 'KR'), 2025, 154, 'Song ngữ Hàn - Anh');

-- =====================================================
-- DETAILED SCHOLARSHIP INFORMATION
-- =====================================================

-- Update existing scholarships with more detailed information
UPDATE scholarships SET 
    requirements = 'Giải Nhất/Nhì/Ba HSG cấp quốc gia ngành CNTT + Phỏng vấn với giám đốc FPT tại 5 quốc gia (Mỹ, Nhật, Hàn, Đức, Singapore)',
    notes = 'Miễn học phí toàn khóa + 30 triệu/năm sinh hoạt phí + Cơ hội làm việc quốc tế'
WHERE code = 'EXPERT_GLOBAL';

UPDATE scholarships SET 
    requirements = 'Top 10 SchoolRank tại trường THPT Khu vực 1, mỗi trường 1 suất',
    notes = 'Đăng ký với Ban giám hiệu trường THPT để được lựa chọn'
WHERE code = 'SCHOOL_PATH';

UPDATE scholarships SET 
    requirements = 'Olympic quốc tế do BGD&ĐT cử tham dự HOẶC HSG Nhất quốc gia HOẶC ĐGNL >= 90% HOẶC THPT >= 9.0 điểm TB',
    notes = 'Điều kiện duy trì: Kết quả học tập >= 7/10 mỗi năm'
WHERE code = 'FULL_SCHOLARSHIP';

UPDATE scholarships SET 
    requirements = 'HSG Nhì quốc gia HOẶC ĐGNL >= 85% HOẶC THPT >= 8.5 điểm TB',
    notes = 'Miễn học phí 2 năm đầu, điều kiện duy trì: >= 7/10'
WHERE code = 'TWO_YEAR';

UPDATE scholarships SET 
    requirements = 'HSG Ba quốc gia HOẶC ĐGNL >= 80% HOẶC THPT >= 8.0 điểm TB',
    notes = 'Miễn học phí năm đầu, điều kiện duy trì: >= 7/10'
WHERE code = 'ONE_YEAR';

-- =====================================================
-- STUDY BEFORE PAY LATER PROGRAM
-- =====================================================

INSERT INTO scholarships (code, name, type, recipients, percentage, requirements, year, notes) VALUES
('STUDY_PAY_LATER_30', 'Học trước - Trả sau 30%', 'Trả sau', 300, 30, 'Top 40 SchoolRank + Hoàn cảnh khó khăn + Hội đồng phê duyệt', 2025, 'Trả 30% học phí sau tốt nghiệp trong 5 năm, lãi suất NHCSXH'),
('STUDY_PAY_LATER_50', 'Học trước - Trả sau 50%', 'Trả sau', 400, 50, 'Top 40 SchoolRank + Hoàn cảnh khó khăn + Hội đồng phê duyệt', 2025, 'Trả 50% học phí sau tốt nghiệp trong 5 năm, lãi suất NHCSXH'),
('STUDY_PAY_LATER_70', 'Học trước - Trả sau 70%', 'Trả sau', 300, 70, 'Top 40 SchoolRank + Hoàn cảnh khó khăn + Hội đồng phê duyệt', 2025, 'Trả 70% học phí sau tốt nghiệp trong 5 năm, lãi suất NHCSXH');

-- =====================================================
-- DETAILED ADMISSION METHODS
-- =====================================================

-- Update existing admission methods with more details
UPDATE admission_methods SET 
    requirements = 'Top 50 SchoolRank học bạ (http://SchoolRank.fpt.edu.vn) + Điểm kỳ 2 lớp 12 tổ hợp [Toán + 2 môn bất kỳ] >= 21. Chứng chỉ ngoại ngữ được tính 10 điểm.',
    notes = 'Ưu tiên sinh viên thế hệ 1: Top 55 SchoolRank'
WHERE method_code = 'HB';

UPDATE admission_methods SET 
    requirements = 'Điểm >= 80 (đợt 1) hoặc Top 50 các đợt tiếp theo',
    notes = 'Ngưỡng cụ thể các đợt sau sẽ thông báo khi có kết quả'
WHERE method_code = 'DGNL_HN';

UPDATE admission_methods SET 
    requirements = 'Điểm >= 609 (đợt 1) hoặc Top 50 các đợt tiếp theo',
    notes = 'Ngưỡng cụ thể các đợt sau sẽ thông báo khi có kết quả'
WHERE method_code = 'DGNL_HCM';

UPDATE admission_methods SET 
    requirements = 'Top 50 với tổ hợp [Toán + 2 môn bất kỳ + Điểm ưu tiên theo quy định của Bộ]',
    notes = 'Điểm cụ thể sẽ công bố sau khi có kết quả thi THPT'
WHERE method_code = 'THPT';

UPDATE admission_methods SET 
    requirements = 'BTEC HND, Melbourne Polytechnic, FUNiX SE, Cao đẳng FPT Polytechnic, THPT FPT, THPT nước ngoài, APTECH HDSE/ADSE, ARENA ADIM, SKILLKING, JETKING',
    notes = 'Xét tuyển thẳng với các chứng chỉ/bằng cấp được công nhận'
WHERE method_code = 'OTHER';

-- =====================================================
-- PRIORITY POLICIES
-- =====================================================

INSERT INTO admission_policies (policy_code, name, description, year, is_active) VALUES
('FIRST_GEN', 'Ưu tiên sinh viên thế hệ 1', 'Người đầu tiên trong gia đình học đại học được ưu tiên Top 55 SchoolRank thay vì Top 50', 2025, true),
('AREA_PRIORITY', 'Ưu tiên khu vực', 'Điểm ưu tiên đối tượng và khu vực theo quy định của Bộ GD&ĐT', 2025, true),
('LANGUAGE_CERT', 'Chứng chỉ ngoại ngữ', 'TOEFL iBT >=80, IELTS >=6.0, VSTEP bậc 4, JLPT N3+, TOPIK 4+, HSK 4+ được tính 10 điểm môn Ngoại ngữ', 2025, true);

-- =====================================================
-- ADMISSION TIMELINE
-- =====================================================

INSERT INTO admission_timeline (phase, start_date, end_date, description, year) VALUES
('PHASE_1', '2025-03-01', '2025-07-31', 'Đợt 1: Theo lịch trình chung của Bộ GD&ĐT', 2025),
('PHASE_ADDITIONAL', '2025-08-01', '2025-09-30', 'Các đợt bổ sung: Nếu đợt 1 chưa đủ chỉ tiêu (thời gian cụ thể sẽ thông báo)', 2025);
