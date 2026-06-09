# FAQ Collection Export Markdown Theo Chu De Chinh

## Muc tieu

FE can bo sung nut export trong man detail collection:

- User vao detail collection.
- Bam nut export Markdown theo chu de chinh.
- Mo dialog hien danh sach chu de chinh co trong collection.
- User chon mot hoac nhieu chu de.
- FE goi API export va tai ve nhieu file `.md`, moi chu de chinh la mot file.

Endpoint nay chi export cac cau hoi/cau tra loi dang nam trong collection hien tai.

## Endpoint

`POST /api/v1/faq/collections/{id}/export/topics.md`

Can gui header:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Request body:

```json
{
  "topic_ids": [
    "topic_uuid_1",
    "topic_uuid_2"
  ]
}
```

Trong do:

- `id`: collection id dang xem detail.
- `topic_ids`: danh sach id cua chu de chinh user da chon trong dialog.

## Response

API tra JSON de FE tu tao nhieu file download:

```json
{
  "data": [
    {
      "topic_id": "topic_uuid_1",
      "topic_code": "TUYEN_SINH",
      "topic_name": "Tuyen sinh",
      "filename": "faq-tuyen-sinh-2026-tuyen-sinh.md",
      "content": "---\ndocument_type: faq_collection\nschema_version: 1\n---\n\n# FAQ\n...",
      "record_count": 12
    }
  ],
  "meta": {
    "collection_id": "collection_uuid",
    "collection_name": "FAQ tuyen sinh 2026",
    "requested_topic_count": 2,
    "exported_topic_count": 1
  }
}
```

Moi item trong `data` la mot file Markdown can tai ve:

- Ten file: `filename`
- Noi dung file: `content`
- So record trong file: `record_count`

Neu mot topic duoc chon nhung khong co cau hoi/cau tra loi export trong collection, topic do se khong co item trong `data`.

## Format Markdown

`content` cua moi file dung cung format voi API export Markdown collection hien tai:

```md
---
document_type: faq_collection
schema_version: 1
---

# FAQ

## Năm 2026

### Tuyển sinh

#### Phương thức xét tuyển

##### FAQ-TS-PTXT-001

*Câu hỏi:* Đại học FPT áp dụng phương thức xét tuyển nào năm 2026?

*Câu hỏi tương đương:*
- FPTU xét tuyển năm 2026 như thế nào?

###### Câu trả lời: ALL

- answer_id: ANSWER-001
- campus_code: ALL
- status: active
- priority: 1

Nhà trường dự kiến xét tuyển bằng phương thức kết hợp kết quả kỳ thi tốt
nghiệp THPT năm 2026 với kết quả học tập THPT.

###### Câu trả lời: HN

- answer_id: ANSWER-002
- campus_code: HN
- status: active
- priority: 1

Nội dung áp dụng riêng cho cơ sở Hà Nội.
```

Các câu hỏi trong cùng file được ngăn cách bằng:

```md
---
```

## Goi y FE

FE co the lay danh sach chu de chinh tu API detail collection dang co:

`GET /api/v1/faq/collections/{id}/detail`

Dung `data.topics[]` de render checkbox trong dialog:

- label: `topic.name`
- value: `topic.id`

Sau khi nhan response export, lap qua `data[]` va tao file download bang Blob:

```ts
for (const file of response.data) {
  const blob = new Blob([file.content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

## Loi co the gap

Collection khong ton tai:

```json
{
  "error": "NOT_FOUND",
  "message": "FAQ collection not found"
}
```

Request khong hop le neu `topic_ids` rong hoac khong phai UUID hop le.
