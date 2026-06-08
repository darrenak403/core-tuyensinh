-- =====================================================
-- SEED: FAQ Topics and Sub Topics
-- =====================================================

-- Remove old FAQ seed hierarchy before inserting the new one.
DELETE FROM faq_collection_items;
DELETE FROM faq_answer_campuses;
DELETE FROM faq_answers;
DELETE FROM faq_questions;
DELETE FROM faq_sub_topics;
DELETE FROM faq_topics;

-- Main Topics
INSERT INTO faq_topics (code, name, description, sort_order)
VALUES
    ('TUYEN_SINH', 'Tuyển sinh', 'Thông tin tuyển sinh và quy trình nhập học', 1),
    ('HOC_PHI_TAI_CHINH', 'Học phí & Tài chính', 'Học phí, tài chính và học bổng', 2),
    ('CHUONG_TRINH_DAO_TAO', 'Chương trình đào tạo', 'Thông tin chương trình, lộ trình và hình thức học tập', 3),
    ('NGANH_HOC', 'Ngành học', 'Thông tin các ngành đào tạo', 4),
    ('AI_CONG_NGHE', 'AI & Công nghệ', 'AI, công nghệ và kỹ năng số', 5),
    ('OJT_THUC_TAP_DOANH_NGHIEP', 'OJT - Thực tập doanh nghiệp', 'Thông tin thực tập doanh nghiệp OJT', 6),
    ('HOC_KY_NUOC_NGOAI', 'Học kỳ nước ngoài', 'Thông tin học kỳ nước ngoài và trao đổi quốc tế', 7),
    ('CO_SO_VAT_CHAT', 'Cơ sở vật chất', 'Thông tin campus và cơ sở vật chất', 8),
    ('DOI_SONG_SINH_VIEN', 'Đời sống sinh viên', 'Hoạt động, hỗ trợ và cộng đồng sinh viên', 9),
    ('VIEC_LAM_NGHE_NGHIEP', 'Việc làm & Nghề nghiệp', 'Việc làm, nghề nghiệp và kết nối doanh nghiệp', 10),
    ('PHU_HUYNH', 'Phụ huynh', 'Thông tin dành cho phụ huynh', 11),
    ('CHUYEN_TRUONG_LIEN_THONG', 'Chuyển trường & Liên thông', 'Chuyển trường, chuyển campus và liên thông', 12),
    ('CHINH_SACH_HOC_TAP', 'Chính sách học tập', 'GPA, thi cử, đăng ký môn và chính sách học vụ', 13),
    ('THONG_TIN_LIEN_HE', 'Thông tin liên hệ', 'Các kênh liên hệ chính thức', 14);

-- Sub Topics
INSERT INTO faq_sub_topics (topic_id, code, name, sort_order)
SELECT t.id, sub.code, sub.name, sub.sort_order
FROM faq_topics t
JOIN (
    VALUES
        ('TUYEN_SINH', 'PHUONG_THUC_XET_TUYEN', 'Phương thức xét tuyển', 1),
        ('TUYEN_SINH', 'DIEU_KIEN_TRUNG_TUYEN', 'Điều kiện trúng tuyển', 2),
        ('TUYEN_SINH', 'HO_SO_DANG_KY', 'Hồ sơ đăng ký', 3),
        ('TUYEN_SINH', 'MOC_THOI_GIAN_TUYEN_SINH', 'Mốc thời gian tuyển sinh', 4),
        ('TUYEN_SINH', 'XET_TUYEN_HOC_BA', 'Xét tuyển học bạ', 5),
        ('TUYEN_SINH', 'XET_TUYEN_DIEM_THI_THPT', 'Xét tuyển điểm thi THPT', 6),
        ('TUYEN_SINH', 'XET_TUYEN_VSAT', 'Xét tuyển VSAT', 7),
        ('TUYEN_SINH', 'XET_TUYEN_SAT_ACT', 'Xét tuyển SAT/ACT', 8),
        ('TUYEN_SINH', 'TUYEN_THANG', 'Tuyển thẳng', 9),
        ('TUYEN_SINH', 'QUY_TRINH_NHAP_HOC', 'Quy trình nhập học', 10),

        ('HOC_PHI_TAI_CHINH', 'HOC_PHI', 'Học phí', 1),
        ('HOC_PHI_TAI_CHINH', 'CAC_KHOAN_PHI_KHAC', 'Các khoản phí khác', 2),
        ('HOC_PHI_TAI_CHINH', 'CHINH_SACH_DONG_HOC_PHI', 'Chính sách đóng học phí', 3),
        ('HOC_PHI_TAI_CHINH', 'TRA_GOP_HOC_PHI', 'Trả góp học phí', 4),
        ('HOC_PHI_TAI_CHINH', 'HOAN_PHI', 'Hoàn phí', 5),
        ('HOC_PHI_TAI_CHINH', 'HOC_BONG_DAU_VAO', 'Học bổng đầu vào', 6),
        ('HOC_PHI_TAI_CHINH', 'HOC_BONG_TRONG_QUA_TRINH_HOC', 'Học bổng trong quá trình học', 7),
        ('HOC_PHI_TAI_CHINH', 'DIEU_KIEN_DUY_TRI_HOC_BONG', 'Điều kiện duy trì học bổng', 8),

        ('CHUONG_TRINH_DAO_TAO', 'CAU_TRUC_CHUONG_TRINH', 'Cấu trúc chương trình', 1),
        ('CHUONG_TRINH_DAO_TAO', 'LO_TRINH_HOC', 'Lộ trình học', 2),
        ('CHUONG_TRINH_DAO_TAO', 'TIENG_ANH_DU_BI', 'Tiếng Anh dự bị', 3),
        ('CHUONG_TRINH_DAO_TAO', 'GIAO_TRINH', 'Giáo trình', 4),
        ('CHUONG_TRINH_DAO_TAO', 'HINH_THUC_HOC_TAP', 'Hình thức học tập', 5),
        ('CHUONG_TRINH_DAO_TAO', 'LICH_HOC', 'Lịch học', 6),
        ('CHUONG_TRINH_DAO_TAO', 'CHUYEN_NGANH', 'Chuyển ngành', 7),
        ('CHUONG_TRINH_DAO_TAO', 'HOC_SONG_NGANH', 'Học song ngành', 8),

        ('NGANH_HOC', 'CONG_NGHE_THONG_TIN', 'Công nghệ thông tin', 1),
        ('NGANH_HOC', 'TRI_TUE_NHAN_TAO', 'Trí tuệ nhân tạo', 2),
        ('NGANH_HOC', 'KY_THUAT_PHAN_MEM', 'Kỹ thuật phần mềm', 3),
        ('NGANH_HOC', 'AN_TOAN_THONG_TIN', 'An toàn thông tin', 4),
        ('NGANH_HOC', 'THIET_KE_VI_MACH_BAN_DAN', 'Thiết kế vi mạch bán dẫn', 5),
        ('NGANH_HOC', 'HE_THONG_THONG_TIN', 'Hệ thống thông tin', 6),
        ('NGANH_HOC', 'CONG_NGHE_O_TO_SO', 'Công nghệ ô tô số', 7),
        ('NGANH_HOC', 'TRI_TUE_NHAN_TAO_KHOA_HOC_DU_LIEU', 'Trí tuệ nhân tạo và Khoa học dữ liệu', 8),
        ('NGANH_HOC', 'AN_NINH_MANG_AN_TOAN_SO', 'An ninh mạng và An toàn số', 9),
        ('NGANH_HOC', 'ROBOT_TRI_TUE_NHAN_TAO', 'Robot và Trí tuệ nhân tạo', 10),
        ('NGANH_HOC', 'KHOA_HOC_DU_LIEU_UNG_DUNG', 'Khoa học dữ liệu ứng dụng', 11),
        ('NGANH_HOC', 'KINH_DOANH_QUOC_TE', 'Kinh doanh quốc tế', 12),
        ('NGANH_HOC', 'DIGITAL_MARKETING', 'Digital Marketing', 13),
        ('NGANH_HOC', 'LOGISTICS', 'Logistics', 14),
        ('NGANH_HOC', 'TAI_CHINH_THONG_MINH', 'Tài chính thông minh', 15),
        ('NGANH_HOC', 'QUAN_TRI_GIAI_TRI_SU_KIEN', 'Quản trị giải trí và sự kiện', 16),
        ('NGANH_HOC', 'QUAN_TRI_KINH_DOANH', 'Quản trị kinh doanh', 17),
        ('NGANH_HOC', 'PHAN_TICH_KINH_DOANH', 'Phân tích kinh doanh', 18),
        ('NGANH_HOC', 'QUAN_TRI_THU_MUA', 'Quản trị thu mua', 19),
        ('NGANH_HOC', 'QUAN_TRI_TRAI_NGHIEM_KHACH_HANG', 'Quản trị Trải nghiệm khách hàng', 20),
        ('NGANH_HOC', 'THUONG_MAI_DIEN_TU', 'Thương mại điện tử', 21),
        ('NGANH_HOC', 'TRUYEN_THONG_MARKETING_TICH_HOP', 'truyền thông Marketing tích hợp', 22),
        ('NGANH_HOC', 'TRUYEN_THONG_THUONG_HIEU', 'Truyền thông thương hiệu', 23),
        ('NGANH_HOC', 'LUAT_KINH_TE', 'Luật Kinh tế', 24),
        ('NGANH_HOC', 'LUAT', 'Luật', 25),
        ('NGANH_HOC', 'NGON_NGU_HAN_TIENG_HAN_THUONG_MAI', 'Ngôn ngữ Hàn, Tiếng Hàn Thương Mại', 26),
        ('NGANH_HOC', 'NGON_NGU_ANH', 'Ngôn ngữ Anh', 27),
        ('NGANH_HOC', 'TIENG_ANH_THUONG_MAI', 'Tiếng Anh Thương Mại', 28),
        ('NGANH_HOC', 'NGON_NGU_TRUNG_QUOC', 'Ngôn ngữ Trung Quốc', 29),
        ('NGANH_HOC', 'TIENG_TRUNG_THUONG_MAI', 'Tiếng Trung Thương Mại', 30),
        ('NGANH_HOC', 'THIET_KE_DO_HOA_MY_THUAT_SO', 'Thiết kế đồ họa và mỹ thuật số', 31),
        ('NGANH_HOC', 'TRUYEN_THONG_DA_PHUONG_TIEN', 'Truyền thông đa phương tiện', 32),
        ('NGANH_HOC', 'QUAN_TRI_DU_LICH_LU_HANH', 'Quản trị du lịch & lữ hành', 33),
        ('NGANH_HOC', 'QUAN_TRI_KHACH_SAN', 'Quản trị khách sạn', 34),
        ('NGANH_HOC', 'CONG_NGHE_TAI_CHINH', 'Công nghệ tài chính', 35),
        ('NGANH_HOC', 'TAI_CHINH_DOANH_NGHIEP', 'Tài chính doanh nghiệp', 36),

        ('AI_CONG_NGHE', 'AI_TRONG_CHUONG_TRINH_HOC', 'AI trong chương trình học', 1),
        ('AI_CONG_NGHE', 'AI_HO_TRO_HOC_TAP', 'AI hỗ trợ học tập', 2),
        ('AI_CONG_NGHE', 'AI_VA_CO_HOI_NGHE_NGHIEP', 'AI và cơ hội nghề nghiệp', 3),
        ('AI_CONG_NGHE', 'KY_NANG_SO', 'Kỹ năng số', 4),

        ('OJT_THUC_TAP_DOANH_NGHIEP', 'GIOI_THIEU_OJT', 'Giới thiệu OJT', 1),
        ('OJT_THUC_TAP_DOANH_NGHIEP', 'DOANH_NGHIEP_DOI_TAC', 'Doanh nghiệp đối tác', 2),
        ('OJT_THUC_TAP_DOANH_NGHIEP', 'QUY_TRINH_THUC_TAP', 'Quy trình thực tập', 3),
        ('OJT_THUC_TAP_DOANH_NGHIEP', 'HO_TRO_THUC_TAP', 'Hỗ trợ thực tập', 4),
        ('OJT_THUC_TAP_DOANH_NGHIEP', 'DANH_GIA_KET_QUA_OJT', 'Đánh giá kết quả OJT', 5),
        ('OJT_THUC_TAP_DOANH_NGHIEP', 'CO_HOI_VIEC_LAM_SAU_OJT', 'Cơ hội việc làm sau OJT', 6),

        ('HOC_KY_NUOC_NGOAI', 'GIOI_THIEU_HOC_KY_NUOC_NGOAI', 'Giới thiệu học kỳ nước ngoài', 1),
        ('HOC_KY_NUOC_NGOAI', 'QUOC_GIA_DOI_TAC', 'Quốc gia đối tác', 2),
        ('HOC_KY_NUOC_NGOAI', 'CHI_PHI', 'Chi phí', 3),
        ('HOC_KY_NUOC_NGOAI', 'DIEU_KIEN_THAM_GIA', 'Điều kiện tham gia', 4),
        ('HOC_KY_NUOC_NGOAI', 'HOC_BONG_TRAO_DOI', 'Học bổng trao đổi', 5),
        ('HOC_KY_NUOC_NGOAI', 'CONG_NHAN_TIN_CHI', 'Công nhận tín chỉ', 6),

        ('CO_SO_VAT_CHAT', 'CAMPUS', 'Campus', 1),
        ('CO_SO_VAT_CHAT', 'GIANG_DUONG', 'Giảng đường', 2),
        ('CO_SO_VAT_CHAT', 'THU_VIEN', 'Thư viện', 3),
        ('CO_SO_VAT_CHAT', 'PHONG_THI_NGHIEM', 'Phòng thí nghiệm', 4),
        ('CO_SO_VAT_CHAT', 'KY_TUC_XA', 'Ký túc xá', 5),
        ('CO_SO_VAT_CHAT', 'XE_DUA_DON', 'Xe đưa đón', 6),
        ('CO_SO_VAT_CHAT', 'KHU_THE_THAO', 'Khu thể thao', 7),

        ('DOI_SONG_SINH_VIEN', 'DONG_PHUC', 'Đồng phục', 1),
        ('DOI_SONG_SINH_VIEN', 'CAU_LAC_BO', 'Câu lạc bộ', 2),
        ('DOI_SONG_SINH_VIEN', 'HOAT_DONG_PHONG_TRAO', 'Hoạt động phong trào', 3),
        ('DOI_SONG_SINH_VIEN', 'SU_KIEN_SINH_VIEN', 'Sự kiện sinh viên', 4),
        ('DOI_SONG_SINH_VIEN', 'HO_TRO_SINH_VIEN', 'Hỗ trợ sinh viên', 5),
        ('DOI_SONG_SINH_VIEN', 'CONG_DONG_CUU_SINH_VIEN', 'Cộng đồng cựu sinh viên', 6),

        ('VIEC_LAM_NGHE_NGHIEP', 'TY_LE_CO_VIEC_LAM', 'Tỷ lệ có việc làm', 1),
        ('VIEC_LAM_NGHE_NGHIEP', 'MUC_LUONG_KHOI_DIEM', 'Mức lương khởi điểm', 2),
        ('VIEC_LAM_NGHE_NGHIEP', 'HO_TRO_VIEC_LAM', 'Hỗ trợ việc làm', 3),
        ('VIEC_LAM_NGHE_NGHIEP', 'KET_NOI_DOANH_NGHIEP', 'Kết nối doanh nghiệp', 4),
        ('VIEC_LAM_NGHE_NGHIEP', 'KHOI_NGHIEP', 'Khởi nghiệp', 5),
        ('VIEC_LAM_NGHE_NGHIEP', 'HOC_TIEP_SAU_DAI_HOC', 'Học tiếp sau đại học', 6),

        ('PHU_HUYNH', 'THEO_DOI_KET_QUA_HOC_TAP', 'Theo dõi kết quả học tập', 1),
        ('PHU_HUYNH', 'THANH_TOAN_HOC_PHI', 'Thanh toán học phí', 2),
        ('PHU_HUYNH', 'LIEN_HE_NHA_TRUONG', 'Liên hệ nhà trường', 3),
        ('PHU_HUYNH', 'CHINH_SACH_HO_TRO_SINH_VIEN', 'Chính sách hỗ trợ sinh viên', 4),

        ('CHUYEN_TRUONG_LIEN_THONG', 'CHUYEN_TRUONG', 'Chuyển trường', 1),
        ('CHUYEN_TRUONG_LIEN_THONG', 'CHUYEN_CAMPUS', 'Chuyển campus', 2),
        ('CHUYEN_TRUONG_LIEN_THONG', 'LIEN_THONG_TU_CAO_DANG', 'Liên thông từ cao đẳng', 3),
        ('CHUYEN_TRUONG_LIEN_THONG', 'CONG_NHAN_TIN_CHI_CHUYEN_TRUONG', 'Công nhận tín chỉ', 4),

        ('CHINH_SACH_HOC_TAP', 'GPA', 'GPA', 1),
        ('CHINH_SACH_HOC_TAP', 'THI_CU', 'Thi cử', 2),
        ('CHINH_SACH_HOC_TAP', 'DANG_KY_MON_HOC', 'Đăng ký môn học', 3),
        ('CHINH_SACH_HOC_TAP', 'HOC_LAI', 'Học lại', 4),
        ('CHINH_SACH_HOC_TAP', 'CANH_BAO_HOC_VU', 'Cảnh báo học vụ', 5),
        ('CHINH_SACH_HOC_TAP', 'TAM_DUNG_HOC', 'Tạm dừng học', 6),
        ('CHINH_SACH_HOC_TAP', 'BAO_LUU_KET_QUA', 'Bảo lưu kết quả', 7),

        ('THONG_TIN_LIEN_HE', 'HOTLINE_TUYEN_SINH', 'Hotline tuyển sinh', 1),
        ('THONG_TIN_LIEN_HE', 'VAN_PHONG_TUYEN_SINH', 'Văn phòng tuyển sinh', 2),
        ('THONG_TIN_LIEN_HE', 'FANPAGE', 'Fanpage', 3),
        ('THONG_TIN_LIEN_HE', 'EMAIL', 'Email', 4),
        ('THONG_TIN_LIEN_HE', 'CAMPUS_TOAN_QUOC', 'Campus toàn quốc', 5)
) AS sub(topic_code, code, name, sort_order)
    ON sub.topic_code = t.code;
