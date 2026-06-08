# FAQ Collection FE API

## Mục tiêu

FE cần hỗ trợ quản trị bộ câu hỏi FAQ theo năm tuyển sinh:

- Thêm câu hỏi theo chủ đề chính và chủ đề con.
- Thêm câu trả lời cho từng câu hỏi.
- Gán câu trả lời cho tất cả cơ sở hoặc một số cơ sở cụ thể.
- Xem chi tiết một bộ câu hỏi, chia theo chủ đề chính -> chủ đề con -> câu hỏi -> câu trả lời.
- Xuất file mở bằng Excel gồm các cột: Câu hỏi, Câu trả lời, Năm, Cơ sở.

Các endpoint quản trị cần gửi `Authorization: Bearer <token>`.

## Luồng FE đề xuất

1. Tạo hoặc chọn năm tuyển sinh.
2. Tạo/chọn chủ đề chính.
3. Tạo/chọn chủ đề con thuộc chủ đề chính.
4. Tạo câu hỏi trong chủ đề con.
5. Tạo câu trả lời cho câu hỏi.
6. Gán cơ sở cho câu trả lời nếu câu trả lời không áp dụng toàn bộ cơ sở.
7. Thêm câu hỏi vào bộ câu hỏi.
8. Mở màn chi tiết bộ câu hỏi để kiểm tra cấu trúc chính-con.
9. Xuất CSV để mở bằng Excel.

## Endpoints đang dùng

### Chủ đề chính

`GET /api/v1/faq/topics`

`POST /api/v1/faq/topics`

```json
{
  "name": "Tuyển sinh",
  "code": "TUYEN_SINH",
  "description": "Các câu hỏi tuyển sinh",
  "sort_order": 1
}
```

### Chủ đề con

`GET /api/v1/faq/topics/{topicId}/sub-topics`

`POST /api/v1/faq/sub-topics`

```json
{
  "topic_id": "uuid",
  "name": "Học bổng",
  "description": "Câu hỏi về học bổng",
  "sort_order": 1
}
```

### Câu hỏi

`GET /api/v1/faq/questions?topic_id={topicId}&sub_topic_id={subTopicId}&status=approved`

`POST /api/v1/faq/questions`

```json
{
  "sub_topic_id": "uuid",
  "content": "Điều kiện nhận học bổng là gì?"
}
```

`PATCH /api/v1/faq/questions/{id}/status`

```json
{
  "status": "approved"
}
```

### Câu trả lời

`GET /api/v1/faq/questions/{questionId}/answers`

`POST /api/v1/faq/answers`

```json
{
  "question_id": "uuid",
  "content": "Thí sinh cần đạt các điều kiện theo quy định từng năm.",
  "tags": ["hoc_bong"],
  "keywords": ["học bổng", "điều kiện"],
  "synonyms": ["làm sao nhận học bổng"]
}
```

`PUT /api/v1/faq/answers/{id}/campuses`

Áp dụng toàn bộ cơ sở:

```json
{
  "campus_ids": []
}
```

Áp dụng một số cơ sở:

```json
{
  "campus_ids": ["campus_uuid_1", "campus_uuid_2"]
}
```

`PATCH /api/v1/faq/answers/{id}/status`

```json
{
  "status": "approved"
}
```

### Bộ câu hỏi theo năm

`GET /api/v1/faq/collections?admission_year=2026`

`POST /api/v1/faq/collections`

```json
{
  "name": "FAQ tuyển sinh 2026",
  "description": "Bộ câu hỏi tuyển sinh năm 2026",
  "admission_year": 2026
}
```

Thêm câu hỏi vào bộ:

`POST /api/v1/faq/collections/{id}/items`

```json
{
  "question_ids": ["question_uuid_1", "question_uuid_2"]
}
```

Xóa câu hỏi khỏi bộ:

`DELETE /api/v1/faq/collections/{id}/items/{questionId}`

## Chi tiết bộ câu hỏi chia theo chủ đề chính-con

`GET /api/v1/faq/collections/{id}/detail`

Response:

```json
{
  "data": {
    "id": "collection_uuid",
    "name": "FAQ tuyển sinh 2026",
    "description": "Bộ câu hỏi tuyển sinh năm 2026",
    "admission_year": 2026,
    "status": "draft",
    "topics": [
      {
        "id": "topic_uuid",
        "code": "TUYEN_SINH",
        "name": "Tuyển sinh",
        "sort_order": 1,
        "sub_topics": [
          {
            "id": "sub_topic_uuid",
            "code": "HOC_BONG",
            "name": "Học bổng",
            "sort_order": 1,
            "questions": [
              {
                "id": "question_uuid",
                "code": "TUYEN_SINH_HOC_BONG_001",
                "content": "Điều kiện nhận học bổng là gì?",
                "status": "approved",
                "sort_order": 0,
                "answers": [
                  {
                    "id": "answer_uuid",
                    "content": "Thí sinh cần đạt các điều kiện theo quy định từng năm.",
                    "status": "approved",
                    "applies_to_all_campuses": true,
                    "campus_ids": [],
                    "campus_codes": [],
                    "campus_names": [],
                    "tags": ["hoc_bong"],
                    "keywords": ["học bổng", "điều kiện"],
                    "synonyms": ["làm sao nhận học bổng"],
                    "version": 1
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

FE có thể render dạng cây:

- Topic row: `topic.name`
- Sub-topic row: `sub_topic.name`
- Question row: `question.code`, `question.content`, `question.status`
- Answer row: `answer.content`, `answer.status`, `applies_to_all_campuses`, `campus_names`

## Xuất file Excel

`GET /api/v1/faq/collections/{id}/export.csv`

Response là `text/csv; charset=utf-8` có BOM UTF-8, Excel mở trực tiếp được.

Tên file trả về:

`faq-collection-{id}.csv`

Cột export:

```csv
"Câu hỏi","Câu trả lời","Năm","Cơ sở"
```

Quy tắc dòng:

- Câu trả lời áp dụng toàn bộ cơ sở: cột Cơ sở là `Tất cả cơ sở`.
- Câu trả lời gán nhiều cơ sở: mỗi cơ sở là một dòng riêng để FE/Excel lọc dễ.
- Câu hỏi chưa có câu trả lời: vẫn xuất câu hỏi, cột Câu trả lời và Cơ sở để trống.

## Lưu ý trạng thái

Question status: `new`, `approved`, `rejected`, `deleted`.

Answer status: `new`, `approved`, `rejected`, `deleted`.

Collection status: `draft`, `published`, `archived`.

Màn quản trị nên cho phép lọc theo status để người dùng kiểm tra các câu hỏi/câu trả lời chưa duyệt.
