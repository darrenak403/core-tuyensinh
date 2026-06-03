-- =====================================================
-- PROGRAMS SEED DATA
-- Purpose: Academic programs for FPT University 2025
-- Based on official FPT University program catalog
-- =====================================================

INSERT INTO programs (code, name, name_en, department_id, duration_years) VALUES
-- Công nghệ thông tin
('SE', 'Kỹ thuật phần mềm', 'Software Engineering', (SELECT id FROM departments WHERE code = 'IT'), 4),
('IS', 'Hệ thống thông tin', 'Information Systems', (SELECT id FROM departments WHERE code = 'IT'), 4),
('AI', 'Trí tuệ nhân tạo', 'Artificial Intelligence', (SELECT id FROM departments WHERE code = 'IT'), 4),
('IA', 'An toàn thông tin', 'Information Assurance', (SELECT id FROM departments WHERE code = 'IT'), 4),
('DT', 'Công nghệ ô tô số', 'Digital Automotive Technology', (SELECT id FROM departments WHERE code = 'IT'), 4),
('MC', 'Thiết kế vi mạch bán dẫn', 'Microchip Design', (SELECT id FROM departments WHERE code = 'IT'), 4),
('GD', 'Thiết kế mỹ thuật số', 'Graphic Design', (SELECT id FROM departments WHERE code = 'IT'), 4),

-- Quản trị kinh doanh
('MKT', 'Digital Marketing', 'Digital Marketing', (SELECT id FROM departments WHERE code = 'BUS'), 4),
('IB', 'Kinh doanh quốc tế', 'International Business', (SELECT id FROM departments WHERE code = 'BUS'), 4),
('HM', 'Quản trị khách sạn', 'Hotel Management', (SELECT id FROM departments WHERE code = 'BUS'), 4),
('TM', 'Quản trị dịch vụ du lịch và lữ hành', 'Tourism Management', (SELECT id FROM departments WHERE code = 'BUS'), 4),
('CF', 'Tài chính doanh nghiệp', 'Corporate Finance', (SELECT id FROM departments WHERE code = 'BUS'), 4),
('DBF', 'Ngân hàng số - Tài chính', 'Digital Banking and Finance', (SELECT id FROM departments WHERE code = 'BUS'), 4),
('FT', 'Công nghệ tài chính', 'Fintech', (SELECT id FROM departments WHERE code = 'BUS'), 4),
('IF', 'Tài chính đầu tư', 'Investment Finance', (SELECT id FROM departments WHERE code = 'BUS'), 4),
('SCM', 'Logistics & quản lý chuỗi cung ứng toàn cầu', 'Global Supply Chain Management', (SELECT id FROM departments WHERE code = 'BUS'), 4),

-- Công nghệ truyền thông
('MM', 'Truyền thông đa phương tiện', 'Multimedia Communications', (SELECT id FROM departments WHERE code = 'COM'), 4),
('PR', 'Quan hệ công chúng', 'Public Relations', (SELECT id FROM departments WHERE code = 'COM'), 4),

-- Luật
('BL', 'Luật kinh tế', 'Business Law', (SELECT id FROM departments WHERE code = 'LAW'), 4),
('IL', 'Luật thương mại quốc tế', 'International Commercial Law', (SELECT id FROM departments WHERE code = 'LAW'), 4),

-- Ngôn ngữ
('EN', 'Ngôn ngữ Anh', 'English Language', (SELECT id FROM departments WHERE code = 'LANG'), 4),
('CN', 'Song ngữ Trung - Anh', 'Chinese-English Bilingual', (SELECT id FROM departments WHERE code = 'LANG'), 4),
('JP', 'Song ngữ Nhật - Anh', 'Japanese-English Bilingual', (SELECT id FROM departments WHERE code = 'LANG'), 4),
('KR', 'Song ngữ Hàn - Anh', 'Korean-English Bilingual', (SELECT id FROM departments WHERE code = 'LANG'), 4);
