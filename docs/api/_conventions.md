# QUY ƯỚC KIẾN TRÚC API TRONG LARAVEL (LARAVEL API CONVENTIONS)

> Trích từ đặc tả gốc. File này áp dụng cho **tất cả** các API endpoints trong hệ thống.

---

## 1. Định tuyến (`routes/api.php`)
Toàn bộ route có tiền tố `/api/v1`.

## 2. Headers Bắt buộc từ Client (React)
- `Accept: application/json` *(Cực kỳ quan trọng trong Laravel: Nếu thiếu header này, khi lỗi Validation hoặc lỗi 401, Laravel sẽ redirect về trang HTML `/login` thay vì trả về JSON!)*
- `Content-Type: application/json`
- `Authorization: Bearer <sanctum_plain_text_token>` (đối với các API yêu cầu đăng nhập).

## 3. Middleware Pipeline
- `auth:sanctum`: Xác thực Token và nạp `Account` hiện tại vào `$request->user()`.
- `account.active`: Middleware tùy chỉnh kiểm tra `$request->user()->trang_thai === AccountStatus::ACTIVE`. Nếu bị khóa (`LOCKED`), hủy token và trả về `403 Forbidden`.
- `role:CUSTOMER` / `role:ADMIN`: Kiểm tra `$request->user()->ma_vai_tro` (`3` = Customer, `1` = Admin).

## 4. Chuẩn Response JSON
Mọi API đều trả về cùng cấu trúc:
```json
{
  "success": true | false,
  "code": <HTTP_STATUS_CODE>,
  "message": "<mô tả kết quả>",
  "data": { ... } | null,
  "errors": { ... } | null
}
```

## 5. Chuẩn Mã Lỗi HTTP
| Code | Ý nghĩa | Khi nào xảy ra |
|------|---------|----------------|
| `200 OK` | Thành công | GET, PUT, PATCH, DELETE thành công |
| `201 Created` | Tạo mới thành công | POST tạo resource mới |
| `400 Bad Request` | Lỗi tham số / điều kiện nghiệp vụ | `minPrice > maxPrice`, giỏ trống khi checkout |
| `401 Unauthorized` | Chưa đăng nhập / Token hết hạn | Thiếu hoặc sai Bearer token |
| `403 Forbidden` | Tài khoản bị khóa / không đủ quyền | Account LOCKED, sai Role |
| `404 Not Found` | Không tìm thấy bản ghi | `ModelNotFoundException` |
| `409 Conflict` | Xung đột trạng thái nghiệp vụ | Hủy đơn khi bếp đã nấu, đặt trùng giờ bàn |
| `422 Unprocessable Entity` | Lỗi validation đầu vào | `FormRequest` validation fails |

## 6. Chuẩn Pagination Response
```json
{
  "pagination": {
    "currentPage": 1,
    "perPage": 12,
    "totalItems": 50,
    "lastPage": 5
  }
}
```
> Laravel `paginate()` bắt đầu từ `page = 1`.
