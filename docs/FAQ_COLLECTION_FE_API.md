# FAQ Collection FE API

## Mục tiêu

FE cần hỗ trợ quản trị bộ câu hỏi FAQ theo năm tuyển sinh:

- Thêm câu hỏi theo chủ đề chính và chủ đề con.
- Thêm câu trả lời cho từng câu hỏi.
- Gán câu trả lời cho tất cả cơ sở hoặc một số cơ sở cụ thể.
- Xem chi tiết một bộ câu hỏi, chia theo chủ đề chính -> chủ đề con -> câu hỏi -> câu trả lời.
- Xuất file mở bằng Excel gồm topic, sub-topic, câu hỏi, aliases, câu trả lời kèm campus, năm, cơ sở, trạng thái duyệt.
- Xuất file Markdown theo format `FAQ Record` để FE cho tải xuống hoặc preview.

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
9. Xuất CSV để mở bằng Excel hoặc Markdown để giao cho các luồng xử lý nội dung.

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

## Xuất file Excel có định dạng

`GET /api/v1/faq/collections/{id}/export.xls`

Response là `application/vnd.ms-excel; charset=utf-8`.

Tên file trả về:

`<collection_name_slug>.xls`

Ví dụ: `faq-tuyen-sinh-2026.xls`

File là SpreadsheetML Excel-compatible, mở trực tiếp bằng Excel. Nên dùng endpoint này khi FE cần file trình bày đẹp để gửi cho người dùng cuối.

Format trong file:

- Title table ở dòng đầu: `FAQ Collection Export - <collection_name>`, merge toàn bộ cột.
- Dòng phụ hiển thị tổng số dòng export.
- Header table có nền xanh, chữ trắng, bold.
- Nội dung table có border, wrap text.
- Freeze pane sau title/subtitle/header để cuộn dữ liệu dễ hơn.
- Width cột được set sẵn để đọc rõ câu hỏi, aliases và câu trả lời dài.

Cột export:

```csv
"Record ID","Chủ đề chính","Chủ đề con","Câu hỏi","Question Aliases","Các câu trả lời của câu hỏi đó (kèm campus)","Năm","Cơ sở","Trạng thái duyệt câu hỏi","Câu hỏi đã duyệt","Trạng thái duyệt câu trả lời","Câu trả lời đã duyệt"
```

## Xuất file CSV thô

`GET /api/v1/faq/collections/{id}/export.csv`

Response là `text/csv; charset=utf-8` có BOM UTF-8, Excel mở trực tiếp được.

Tên file trả về:

`<collection_name_slug>.csv`

Cột export:

```csv
"Record ID","Chủ đề chính","Chủ đề con","Câu hỏi","Question Aliases","Các câu trả lời của câu hỏi đó (kèm campus)","Năm","Cơ sở","Trạng thái duyệt câu hỏi","Câu hỏi đã duyệt","Trạng thái duyệt câu trả lời","Câu trả lời đã duyệt"
```

Quy tắc dòng:

- Câu trả lời áp dụng toàn bộ cơ sở: cột Cơ sở là `Tất cả cơ sở`.
- Câu trả lời gán nhiều cơ sở: mỗi cơ sở là một dòng riêng để FE/Excel lọc dễ.
- Câu hỏi chưa có câu trả lời: vẫn xuất câu hỏi, cột Câu trả lời và Cơ sở để trống.
- `Question Aliases` lấy từ `answer.synonyms`, ngăn cách bằng xuống dòng trong cùng một ô CSV.
- `Trạng thái duyệt câu hỏi` dùng `question.status`.
- `Trạng thái duyệt câu trả lời` dùng `answer.status`, để trống nếu câu hỏi chưa có câu trả lời.
- `Câu hỏi đã duyệt` và `Câu trả lời đã duyệt` trả `Có` khi status là `approved`, ngược lại trả `Không`.

## Xuất file Markdown

`GET /api/v1/faq/collections/{id}/export.md`

Response là `text/markdown; charset=utf-8`.

Tên file trả về:

`<collection_name_slug>.md`

Mỗi record tương ứng một cặp câu hỏi-câu trả lời-cơ sở. Nếu một câu trả lời gán nhiều cơ sở, file sẽ có nhiều record, mỗi record một cơ sở.

Record ID format:

`FAQ<YEAR><CAMPUS><TOPIC><SEQ>`

Trong đó:

- `YEAR`: năm tuyển sinh của collection.
- `CAMPUS`: mã campus đã bỏ ký tự đặc biệt; câu trả lời áp dụng toàn bộ cơ sở dùng `ALL`.
- `TOPIC`: mã chủ đề chính đã bỏ ký tự đặc biệt.
- `SEQ`: số thứ tự tăng dần, 3 chữ số.

Format file:

```md
FAQ Record
Record ID: FAQ2026ALLTUYENSINH001

Main Topic: Tuyển sinh

Sub Topic: Học bổng

Question: Điều kiện nhận học bổng là gì?

Question Aliases:

làm sao nhận học bổng
cách lấy học bổng

Answer: Thí sinh cần đạt các điều kiện theo quy định từng năm.

Metadata:

admission_year: 2026
campus: Tất cả cơ sở
status: active
priority: 1
```

Các record trong cùng file được ngăn cách bằng:

```md
---
```

## Lưu ý trạng thái

Question status: `new`, `approved`, `rejected`, `deleted`.

Answer status: `new`, `approved`, `rejected`, `deleted`.

Collection status: `draft`, `published`, `archived`.

Màn quản trị nên cho phép lọc theo status để người dùng kiểm tra các câu hỏi/câu trả lời chưa duyệt.
