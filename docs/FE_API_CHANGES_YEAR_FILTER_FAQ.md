# FE API Changes: Year Filter and FAQ Taxonomy

This document summarizes backend changes for FE integration.

Base URL in local dev: `http://localhost:3333`

## 1. Admission Years

### List Admission Years

`GET /api/v1/admission-years`

Response `200`:

```json
{
  "data": [
    {
      "year": 2026,
      "label": "Năm tuyển sinh 2026",
      "is_active": true,
      "created_at": "2026-06-08T08:00:00.000Z"
    }
  ]
}
```

### Create Admission Year

`POST /api/v1/admission-years`

Auth: admin.

Request:

```json
{
  "year": 2027,
  "label": "Năm tuyển sinh 2027",
  "is_active": true
}
```

Notes:

- `year` is required.
- `label` is optional. Default: `Năm tuyển sinh {year}`.
- `is_active` is optional. Default: `true`.

Response `201`:

```json
{
  "data": {
    "year": 2027,
    "label": "Năm tuyển sinh 2027",
    "is_active": true,
    "created_at": "2026-06-08T08:00:00.000Z"
  }
}
```

Common errors:

```json
{ "error": "CONFLICT", "message": "Năm 2027 đã tồn tại" }
```

```json
{ "error": "VALIDATION_ERROR", "message": "year phải là số nguyên" }
```

### Update Admission Year

`PUT /api/v1/admission-years/{year}`

Auth: admin.

Request:

```json
{
  "label": "Năm tuyển sinh 2027 - cập nhật",
  "is_active": false
}
```

Response `200`:

```json
{
  "data": {
    "year": 2027,
    "label": "Năm tuyển sinh 2027 - cập nhật",
    "is_active": false,
    "created_at": "2026-06-08T08:00:00.000Z"
  }
}
```

### Delete Admission Year

`DELETE /api/v1/admission-years/{year}`

Auth: admin.

Response `200`:

```json
{
  "message": "Admission year deleted successfully"
}
```

Delete is rejected if the year is referenced by related data.

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Không thể xóa năm 2026 vì đang có dữ liệu liên quan"
}
```

## 2. Year Filter Changes

FE can pass `admission_year` as an optional query parameter on these list endpoints.

When `admission_year` is omitted, the endpoint returns all records.

Invalid query values return `400`.

```json
{
  "error": {
    "message": "admission_year phải là số nguyên",
    "code": "HTTP_EXCEPTION"
  }
}
```

### Departments

`GET /api/v1/departments?admission_year=2026`

Response item now includes `admission_year`:

```json
{
  "data": [
    {
      "id": "uuid",
      "code": "SE",
      "name": "Software Engineering",
      "name_en": "Software Engineering",
      "description": "Description",
      "admission_year": 2026
    }
  ],
  "meta": {
    "total": 1,
    "limit": 100,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  }
}
```

Create/update bodies accept `admission_year`:

```json
{
  "code": "SE",
  "name": "Software Engineering",
  "admission_year": 2026
}
```

### Programs

`GET /api/v1/programs?admission_year=2026`

Also supports existing `department_code`:

`GET /api/v1/programs?department_code=SE&admission_year=2026`

Response item now includes `admission_year`:

```json
{
  "data": [
    {
      "id": "uuid",
      "code": "SE",
      "name": "Kỹ thuật phần mềm",
      "name_en": "Software Engineering",
      "department_id": "uuid",
      "duration_years": 4,
      "admission_year": 2026,
      "department": {
        "id": "uuid",
        "code": "CNTT",
        "name": "Công nghệ thông tin",
        "name_en": "Information Technology"
      }
    }
  ],
  "meta": {
    "total": 1,
    "limit": 100,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  }
}
```

Create/update bodies accept `admission_year`:

```json
{
  "code": "SE",
  "name": "Kỹ thuật phần mềm",
  "department_id": "uuid",
  "duration_years": 4,
  "admission_year": 2026
}
```

### Scholarships

`GET /api/v1/scholarships?admission_year=2026`

Also supports existing `type`.

Existing DB/API response field remains `year`.

```json
{
  "data": [
    {
      "id": "uuid",
      "code": "HB100",
      "name": "Học bổng 100%",
      "type": "merit",
      "recipients": 10,
      "percentage": 100,
      "requirements": "Requirements",
      "year": 2026,
      "notes": "Notes",
      "is_active": true,
      "created_at": "2026-06-08T08:00:00.000Z",
      "updated_at": "2026-06-08T08:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  }
}
```

Create/update accept either `year` or `admission_year`.

```json
{
  "code": "HB100",
  "name": "Học bổng 100%",
  "type": "merit",
  "percentage": 100,
  "admission_year": 2026
}
```

### Admission Methods

`GET /api/v1/admission-methods?admission_year=2026`

Existing DB/API response field remains `year`.

```json
{
  "data": [
    {
      "id": "uuid",
      "method_code": "HB",
      "name": "Xét tuyển học bạ",
      "requirements": "Requirements",
      "notes": "Notes",
      "year": 2026,
      "is_active": true
    }
  ],
  "meta": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  }
}
```

Create/update accept either `year` or `admission_year`.

```json
{
  "method_code": "HB",
  "name": "Xét tuyển học bạ",
  "requirements": "Requirements",
  "admission_year": 2026
}
```

### Tuition

Tuition still uses `year` in the response and DB model. FE can now pass `admission_year` as an alias.

Examples:

- `GET /api/v1/tuition?admission_year=2026`
- `GET /api/v1/tuition/comparison?admission_year=2026`
- `GET /api/v1/tuition/campus/{campus_code}?admission_year=2026`
- `GET /api/v1/tuition/calculate?program_code=SE&campus_code=HN&admission_year=2026`
- `GET /api/v1/tuition/summary?admission_year=2026`

Create/update accept either `year` or `admission_year`.

```json
{
  "program_id": "uuid",
  "campus_id": "uuid",
  "admission_year": 2026,
  "semester_group_1_3_fee": 10000000,
  "semester_group_4_6_fee": 12000000,
  "semester_group_7_9_fee": 14000000
}
```

## 3. Admission Year Validation on Create/Update

When a create/update request references an admission year:

- The year must exist in `admission_years`.
- The year must be active.

Missing year:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "admission_year là bắt buộc"
}
```

Inactive year:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Năm 2026 đã bị vô hiệu hóa, không thể thêm dữ liệu"
}
```

Unknown year:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Năm 2026 không tồn tại trong hệ thống. Vui lòng tạo năm trước."
}
```

## 4. FAQ Seed Taxonomy

FAQ seed data was replaced.

Current seed contains:

- `14` main topics.
- `117` sub-topics.

Verified with curl:

- `GET /api/v1/faq/topics?limit=100` returns `14`.
- `GET /api/v1/faq/sub-topics?limit=100&offset=0` returns first `100`.
- `GET /api/v1/faq/sub-topics?limit=100&offset=100` returns remaining `17`.

Note: `limit` is capped at `100`; `limit=200` returns `400`.

### FAQ Topic Response

`GET /api/v1/faq/topics?limit=100`

```json
{
  "data": [
    {
      "id": "uuid",
      "code": "TUYEN_SINH",
      "name": "Tuyển sinh",
      "description": "Thông tin tuyển sinh và quy trình nhập học",
      "sort_order": 1,
      "is_active": true
    }
  ],
  "meta": {
    "total": 14,
    "limit": 100,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  }
}
```

Main topic codes:

```text
TUYEN_SINH
HOC_PHI_TAI_CHINH
CHUONG_TRINH_DAO_TAO
NGANH_HOC
AI_CONG_NGHE
OJT_THUC_TAP_DOANH_NGHIEP
HOC_KY_NUOC_NGOAI
CO_SO_VAT_CHAT
DOI_SONG_SINH_VIEN
VIEC_LAM_NGHE_NGHIEP
PHU_HUYNH
CHUYEN_TRUONG_LIEN_THONG
CHINH_SACH_HOC_TAP
THONG_TIN_LIEN_HE
```

### FAQ Sub-topic Response

`GET /api/v1/faq/topics/{topicId}/sub-topics?limit=100`

```json
{
  "data": [
    {
      "id": "uuid",
      "topic_id": "uuid",
      "code": "PHUONG_THUC_XET_TUYEN",
      "name": "Phương thức xét tuyển",
      "sort_order": 1,
      "is_active": true
    }
  ],
  "meta": {
    "total": 10,
    "limit": 100,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  }
}
```

Representative verified counts:

- `TUYEN_SINH`: `10` sub-topics.
- `NGANH_HOC`: `36` sub-topics.
- `THONG_TIN_LIEN_HE`: `5` sub-topics.

