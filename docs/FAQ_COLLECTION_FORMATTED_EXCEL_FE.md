# FE Handoff: Xuất Excel Bộ Câu Hỏi FAQ

## Việc FE cần sửa

FE chỉ cần hỗ trợ nút tải file Excel có định dạng cho bộ câu hỏi FAQ.

Không cần tự tạo file Excel, không cần tự format bảng, không dùng CSV thô cho chức năng này. BE đã trả về file `.xls` có sẵn title, header, width cột, border, wrap text và freeze pane.

## Endpoint cần gọi

```http
GET /api/v1/faq/collections/{id}/export.xls
Authorization: Bearer <token>
```

Response:

```http
Content-Type: application/vnd.ms-excel; charset=utf-8
Content-Disposition: attachment; filename="<collection_name_slug>.xls"
```

Ví dụ collection `FAQ tuyển sinh 2026` sẽ tải về:

```txt
faq-tuyen-sinh-2026.xls
```

## Cách tải file

FE cần gọi API dạng `blob`, sau đó tạo link download. Nên ưu tiên lấy tên file từ header `Content-Disposition`.

```ts
async function downloadFaqCollectionExcel(collectionId: string, token: string) {
  const response = await fetch(
    `/api/v1/faq/collections/${collectionId}/export.xls`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Không thể xuất file Excel");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = getDownloadFileName(response) ?? "faq-collection.xls";

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function getDownloadFileName(response: Response): string | null {
  const disposition = response.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? null;
}
```

## UI đề xuất

Button:

```txt
Xuất Excel
```

Loading state:

```txt
Đang xuất...
```

Error message:

```txt
Không thể xuất file Excel. Vui lòng thử lại.
```

## File Excel trả về

Sheet name:

```txt
FAQ Export
```

Title row:

```txt
FAQ Collection Export - <collection_name>
```

Subtitle row:

```txt
Tổng số dòng: <count>
```

Header row:

```csv
"Record ID","Chủ đề chính","Chủ đề con","Câu hỏi","Question Aliases","Các câu trả lời của câu hỏi đó (kèm campus)","Năm","Cơ sở","Trạng thái duyệt câu hỏi","Câu hỏi đã duyệt","Trạng thái duyệt câu trả lời","Câu trả lời đã duyệt"
```

## Quy tắc dữ liệu

- Mỗi dòng là một record câu hỏi-câu trả lời-cơ sở.
- Nếu một câu trả lời áp dụng toàn bộ cơ sở, cột `Cơ sở` là `Tất cả cơ sở`.
- Nếu một câu trả lời gán nhiều cơ sở, mỗi cơ sở là một dòng riêng.
- Nếu câu hỏi chưa có câu trả lời, cột câu trả lời và cột cơ sở để trống.
- `Question Aliases` lấy từ `answer.synonyms`, hiển thị nhiều dòng trong cùng một ô.
- `Câu hỏi đã duyệt` là `Có` khi `question.status = approved`, ngược lại là `Không`.
- `Câu trả lời đã duyệt` là `Có` khi `answer.status = approved`, ngược lại là `Không`.

## Checklist FE

- Nút `Xuất Excel` gọi đúng endpoint `.xls`.
- Request có gửi token.
- Response được xử lý bằng `blob()`.
- Tên file lấy từ `Content-Disposition`.
- Khi API lỗi, hiển thị message lỗi.
- FE không tự format file Excel.
