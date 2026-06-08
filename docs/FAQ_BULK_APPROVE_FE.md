# FAQ bulk approve APIs for FE

## Mục tiêu

FE bổ sung 2 thao tác duyệt nhanh, không cần chọn từng dòng:

1. Duyệt tất cả câu hỏi FAQ chưa duyệt.
2. Duyệt tất cả câu trả lời FAQ chưa duyệt.

Backend chỉ duyệt các record đang có `status = "new"` và `is_active = true`.

## Auth

Cả 2 API đều cần đăng nhập và quyền admin.

Header:

```http
Authorization: Bearer <access_token>
```

## 1. Duyệt tất cả câu hỏi chưa duyệt

```http
PATCH /api/v1/faq/questions/approve-pending
```

Không cần request body.

Response `200`:

```json
{
  "message": "Approved 12 pending FAQ question(s)",
  "approved_count": 12
}
```

FE gợi ý:

- Nút đặt ở màn danh sách câu hỏi FAQ.
- Sau khi gọi thành công, toast theo `approved_count`.
- Reload lại danh sách câu hỏi, đặc biệt khi đang filter `status=new`.

## 2. Duyệt tất cả câu trả lời chưa duyệt

```http
PATCH /api/v1/faq/answers/approve-pending
```

Không cần request body.

Response `200`:

```json
{
  "message": "Approved 20 pending FAQ answer(s)",
  "approved_count": 20
}
```

FE gợi ý:

- Nút đặt ở màn danh sách câu trả lời FAQ.
- Sau khi gọi thành công, toast theo `approved_count`.
- Reload lại danh sách câu trả lời, đặc biệt khi đang filter `status=new`.

## Lưu ý hành vi

- API là bulk action toàn hệ thống, không phụ thuộc checkbox hay danh sách id.
- API không duyệt record `rejected`, `deleted`, hoặc đã `approved`.
- Nếu không còn bản ghi chưa duyệt, response vẫn `200` với `approved_count: 0`.
