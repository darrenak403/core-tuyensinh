# FE Handoff: Quick Add Câu Hỏi FAQ Kèm Câu Trả Lời

## Mục tiêu

FE bổ sung một nút add nhanh trong luồng tạo câu hỏi FAQ.

Nút này dùng để tạo nhiều câu hỏi và nhiều câu trả lời cùng lúc sau khi người dùng chọn `Chủ đề chính` và `Chủ đề con`.

Không thay thế luồng hiện tại. Luồng tạo câu hỏi trước rồi thêm câu trả lời sau vẫn giữ nguyên.

## Endpoint cần gọi

```http
POST /api/v1/faq/questions/quick-add
Authorization: Bearer <token>
Content-Type: application/json
```

## UI đề xuất

Button:

```txt
Add nhanh
```

Dialog gồm:

- Select `Chủ đề chính`.
- Select `Chủ đề con` theo chủ đề chính đã chọn.
- Textarea để paste hàng loạt câu hỏi và câu trả lời.
- Tuỳ chọn `Áp dụng tất cả cơ sở cho tất cả câu trả lời`.
- Nếu không chọn tất cả cơ sở, FE có thể cho chọn `Cơ sở mặc định` áp dụng cho toàn bộ câu trả lời.
- FE có thể cho chỉnh từng câu trả lời sau khi parse preview: `campus_ids`, `tags`, `keywords`, `synonyms`. Các trường này không bắt buộc.

Loading state:

```txt
Đang tạo...
```

Error message:

```txt
Không thể tạo nhanh FAQ. Vui lòng kiểm tra nội dung và thử lại.
```

## Payload cách 1: Paste raw text

FE gửi `raw_text` đúng nội dung người dùng paste. BE tự tách nhãn `Câu {count}:`, `Câu hỏi {count}:`, `Trả lời {count}:` và chỉ lưu nội dung bên trong.

```json
{
  "topic_id": "topic_uuid",
  "sub_topic_id": "sub_topic_uuid",
  "apply_all_campuses": true,
  "raw_text": "Câu 1: Chuyên ngành Trí tuệ nhân tạo (AI) tại Đại học FPT đào tạo những kiến thức cốt lõi nào cho sinh viên?\nTrả lời 1: Chương trình tập trung vào việc xây dựng nền tảng toán học và kỹ thuật phần mềm vững chắc...\nTrả lời 2: Nhà trường chú trọng vào khả năng triển khai AI trong môi trường sản xuất thực tế..."
}
```

Kết quả lưu:

- Question content: `Chuyên ngành Trí tuệ nhân tạo (AI) tại Đại học FPT đào tạo những kiến thức cốt lõi nào cho sinh viên?`
- Answer 1 content: `Chương trình tập trung vào việc xây dựng nền tảng toán học và kỹ thuật phần mềm vững chắc...`
- Answer 2 content: `Nhà trường chú trọng vào khả năng triển khai AI trong môi trường sản xuất thực tế...`

## Payload cách 2: Structured data

Dùng cách này nếu FE muốn parse trước ở client và cho người dùng chỉnh từng câu trả lời trước khi submit.

```json
{
  "topic_id": "topic_uuid",
  "sub_topic_id": "sub_topic_uuid",
  "default_campus_ids": ["campus_uuid_1", "campus_uuid_2"],
  "questions": [
    {
      "content": "Câu 1: Chuyên ngành Trí tuệ nhân tạo (AI) tại Đại học FPT đào tạo những kiến thức cốt lõi nào cho sinh viên?",
      "answers": [
        {
          "content": "Trả lời 1: Chương trình tập trung vào việc xây dựng nền tảng toán học và kỹ thuật phần mềm vững chắc...",
          "campus_ids": ["campus_uuid_1"],
          "tags": ["AI"],
          "keywords": ["trí tuệ nhân tạo"],
          "synonyms": ["AI major"]
        },
        {
          "content": "Trả lời 2: Nhà trường chú trọng vào khả năng triển khai AI trong môi trường sản xuất thực tế..."
        }
      ]
    }
  ]
}
```

BE vẫn tự strip prefix `Câu 1:` và `Trả lời 1:` trong structured data.

## Quy tắc cơ sở

- `apply_all_campuses: true`: tất cả câu trả lời áp dụng toàn bộ cơ sở.
- `answer.campus_ids`: nếu có, dùng riêng cho câu trả lời đó.
- `default_campus_ids`: dùng cho câu trả lời không có `campus_ids`.
- Nếu không gửi `campus_ids` và không gửi `default_campus_ids`, câu trả lời áp dụng toàn bộ cơ sở theo rule hiện tại của BE.
- Mảng `campus_ids: []` cũng được hiểu là áp dụng toàn bộ cơ sở.

## Response

```json
{
  "data": [
    {
      "question": {
        "id": "question_uuid",
        "code": "TUYEN_SINH_AI_001",
        "sub_topic_id": "sub_topic_uuid",
        "content": "Chuyên ngành Trí tuệ nhân tạo (AI) tại Đại học FPT đào tạo những kiến thức cốt lõi nào cho sinh viên?",
        "status": "new",
        "created_at": "2026-06-08T10:00:00.000Z",
        "updated_at": "2026-06-08T10:00:00.000Z"
      },
      "answers": [
        {
          "id": "answer_uuid",
          "question_id": "question_uuid",
          "content": "Chương trình tập trung vào việc xây dựng nền tảng toán học và kỹ thuật phần mềm vững chắc...",
          "status": "new",
          "tags": [],
          "keywords": [],
          "synonyms": [],
          "campus_ids": [],
          "applies_to_all_campuses": true,
          "version": 1,
          "created_at": "2026-06-08T10:00:00.000Z",
          "updated_at": "2026-06-08T10:00:00.000Z"
        }
      ]
    }
  ],
  "meta": {
    "question_count": 1,
    "answer_count": 1
  }
}
```

## Checklist FE

- Có nút `Add nhanh` trong luồng tạo câu hỏi và câu trả lời.
- Dialog bắt buộc chọn `Chủ đề chính` và `Chủ đề con`.
- Cho paste nhiều câu hỏi/câu trả lời trong một textarea.
- Gọi đúng endpoint `POST /api/v1/faq/questions/quick-add`.
- Request có gửi token.
- Có loading state khi submit.
- Có message lỗi khi API lỗi.
- Không gọi tuần tự endpoint tạo question rồi tạo answer cho chức năng add nhanh này.
- Không bắt buộc nhập `tags`, `keywords`, `synonyms`.
- Cho chọn tất cả cơ sở cho toàn bộ câu trả lời, hoặc cho chỉnh cơ sở riêng từng câu trả lời.
