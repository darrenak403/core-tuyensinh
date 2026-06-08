# FAQ collection add by sub-topic API for FE

## Mục tiêu

Trong màn detail bộ câu hỏi, sau khi chọn chủ đề chính và chủ đề con, FE có 2 option:

1. Thêm từng câu hỏi theo chủ đề con vào bộ câu hỏi.
2. Thêm nhanh tất cả câu hỏi đã duyệt trong chủ đề con đó vào bộ câu hỏi.

Option 1 đã có sẵn. File này mô tả API mới cho option 2.

## Auth

API cần đăng nhập và quyền admin.

Header:

```http
Authorization: Bearer <access_token>
```

## API thêm tất cả câu hỏi đã duyệt trong chủ đề con

```http
POST /api/v1/faq/collections/{collection_id}/items/by-sub-topic
```

Body:

```json
{
  "sub_topic_id": "sub_topic_uuid"
}
```

Backend sẽ:

- Lấy tất cả câu hỏi trong `sub_topic_id`.
- Chỉ lấy câu hỏi đang `status = "approved"` và `is_active = true`.
- Thêm các câu hỏi đó vào bộ câu hỏi.
- Bỏ qua câu hỏi đã có sẵn trong bộ, không báo lỗi duplicate.

Response `200`:

```json
{
  "message": "Added 8 approved question(s) from sub-topic to collection",
  "inserted": 8,
  "matched_count": 10
}
```

Ý nghĩa field:

- `matched_count`: tổng số câu hỏi đã duyệt tìm thấy trong chủ đề con.
- `inserted`: số câu hỏi được thêm mới vào bộ câu hỏi.

Nếu `matched_count = 10` nhưng `inserted = 8`, nghĩa là có 2 câu đã tồn tại trong bộ trước đó.

## FE gợi ý

- Sau khi user chọn chủ đề chính và chủ đề con, hiển thị thêm button như `Thêm tất cả câu hỏi đã duyệt`.
- Khi bấm button, gọi API này với `sub_topic_id` đang chọn.
- Sau khi thành công, toast theo `inserted` và reload detail bộ câu hỏi.
- Nếu `matched_count = 0`, có thể toast: `Chủ đề con này chưa có câu hỏi đã duyệt`.

## API cũ vẫn giữ nguyên

Thêm từng câu hỏi theo danh sách id:

```http
POST /api/v1/faq/collections/{collection_id}/items
```

Body:

```json
{
  "question_ids": ["question_uuid_1", "question_uuid_2"]
}
```
