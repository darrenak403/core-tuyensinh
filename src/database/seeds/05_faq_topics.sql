-- =====================================================
-- SEED: FAQ Topics and Sub Topics
-- =====================================================

-- Main Topics
INSERT INTO faq_topics (code, name, description, sort_order) VALUES
    ('TUYEN_SINH',   'Tuyển sinh',               'Thông tin chung về tuyển sinh đại học FPT', 1),
    ('HOC_PHI',      'Học phí',                  'Thông tin về học phí, chính sách đóng học phí', 2),
    ('HOC_BONG',     'Học bổng',                 'Các loại học bổng và điều kiện nhận học bổng', 3),
    ('CT_DAO_TAO',   'Chương trình đào tạo',     'Thông tin về các chương trình đào tạo', 4),
    ('MOI_TRUONG',   'Môi trường học tập',       'Cơ sở vật chất, hoạt động ngoại khóa', 5),
    ('KY_TUC_XA',   'Ký túc xá',                'Thông tin về ký túc xá, chi phí, đăng ký', 6),
    ('SV_QUOC_TE',  'Sinh viên quốc tế',         'Thông tin dành cho sinh viên quốc tế', 7),
    ('DOANH_NGHIEP', 'Doanh nghiệp & việc làm',  'Cơ hội việc làm, hợp tác doanh nghiệp', 8),
    ('NHAP_HOC',     'Thủ tục nhập học',         'Thủ tục, hồ sơ và các bước nhập học', 9)
ON CONFLICT (code) DO NOTHING;

-- Sub Topics: Tuyển sinh
INSERT INTO faq_sub_topics (topic_id, name, sort_order)
SELECT t.id, sub.name, sub.sort_order
FROM faq_topics t,
    (VALUES
        ('Phương thức xét tuyển', 1),
        ('Điều kiện trúng tuyển', 2),
        ('Hồ sơ đăng ký', 3),
        ('Mốc thời gian tuyển sinh', 4),
        ('Điểm chuẩn', 5),
        ('Chuyển ngành', 6),
        ('Liên thông', 7)
    ) AS sub(name, sort_order)
WHERE t.code = 'TUYEN_SINH'
ON CONFLICT DO NOTHING;

-- Sub Topics: Học phí
INSERT INTO faq_sub_topics (topic_id, name, sort_order)
SELECT t.id, sub.name, sub.sort_order
FROM faq_topics t,
    (VALUES
        ('Học phí theo ngành', 1),
        ('Học phí theo campus', 2),
        ('Chính sách đóng học phí', 3),
        ('Hoàn học phí', 4),
        ('Học phí chương trình quốc tế', 5)
    ) AS sub(name, sort_order)
WHERE t.code = 'HOC_PHI'
ON CONFLICT DO NOTHING;

-- Sub Topics: Học bổng
INSERT INTO faq_sub_topics (topic_id, name, sort_order)
SELECT t.id, sub.name, sub.sort_order
FROM faq_topics t,
    (VALUES
        ('Học bổng đầu vào', 1),
        ('Học bổng tài năng', 2),
        ('Học bổng doanh nghiệp', 3),
        ('Điều kiện duy trì học bổng', 4)
    ) AS sub(name, sort_order)
WHERE t.code = 'HOC_BONG'
ON CONFLICT DO NOTHING;

-- Sub Topics: Thủ tục nhập học
INSERT INTO faq_sub_topics (topic_id, name, sort_order)
SELECT t.id, sub.name, sub.sort_order
FROM faq_topics t,
    (VALUES
        ('Hồ sơ nhập học', 1),
        ('Xác nhận nhập học', 2),
        ('Đăng ký ký túc xá', 3),
        ('Đăng ký môn học', 4)
    ) AS sub(name, sort_order)
WHERE t.code = 'NHAP_HOC'
ON CONFLICT DO NOTHING;
