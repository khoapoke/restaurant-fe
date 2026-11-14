# QUY ƯỚC KIẾN TRÚC GIAO TIẾP API (API PROTOCOL SPECIFICATION)

> 📌 **Tài liệu gốc Backend:** [api_protocol_specification.md](../api_protocol_specification.md)  
> Áp dụng cho **100% API endpoints** trong toàn bộ hệ thống Lumière Restaurant.

---

## 1. Định Tuyến & Headers Bắt Buộc

### Định tuyến:
Toàn bộ API được định tuyến với tiền tố: `/api/v1`

### Headers Bắt buộc từ Client (React Axios):
```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <sanctum_plain_text_token>
```
> ⚠️ **LƯU Ý:** Bắt buộc phải có `Accept: application/json`. Nếu thiếu, khi xảy ra lỗi Validation 422 hoặc Chưa đăng nhập 401, Laravel sẽ chuyển hướng sang trang HTML thay vì trả về JSON!

---

## 2. Cấu Trúc Envelope Phản Hồi (`ApiResponse`)

Mọi response từ máy chủ đều tuân theo định dạng chuẩn:

```typescript
interface ApiResponse<T> {
  success: boolean;       // true nếu thành công, false nếu có lỗi
  code: number;          // HTTP Status Code (200, 201, 400, 401, 403, 404, 409, 422, 500)
  message: string;       // Thông điệp phản hồi
  data: T | null;        // Dữ liệu trả về (Object hoặc Array hoặc null)
  errors?: Record<string, string[]> | null; // Chi tiết lỗi validation (chỉ có khi code = 422)
}
```

### Response Thành Công Mẫu (200 OK / 201 Created):
```json
{
  "success": true,
  "code": 200,
  "message": "Dữ liệu được xử lý thành công",
  "data": { ... },
  "errors": null
}
```

### Response Lỗi Validation Mẫu (422 Unprocessable Entity):
```json
{
  "success": false,
  "code": 422,
  "message": "Dữ liệu đầu vào không hợp lệ",
  "data": null,
  "errors": {
    "username": ["Tên đăng nhập đã được sử dụng"],
    "phoneNumber": ["Số điện thoại không đúng định dạng"]
  }
}
```

---

## 3. Chuẩn Mã Lỗi HTTP (Status Codes)

| HTTP Code | Ý nghĩa | Kịch bản xảy ra | Hành động phía Frontend |
|:---:|:---|:---|:---|
| `200` | OK | Truy vấn dữ liệu, cập nhật, xóa thành công | Hiển thị dữ liệu, thông báo thành công |
| `201` | Created | Tạo mới tài nguyên thành công (Đăng ký, Đặt món, Đặt bàn) | Đóng modal, chuyển hướng hoặc refresh danh sách |
| `400` | Bad Request | Vi phạm điều kiện nghiệp vụ (Giỏ trống khi checkout, Bàn đã kín) | Hiển thị `message` cảnh báo người dùng |
| `401` | Unauthorized | Chưa đăng nhập hoặc Token Sanctum hết hạn / không hợp lệ | Xóa token trong localStorage, chuyển hướng về `/login` |
| `403` | Forbidden | Không đủ quyền truy cập Role hoặc Tài khoản bị khóa (`LOCKED`) | Thông báo lỗi quyền hạn hoặc tài khoản bị khóa |
| `404` | Not Found | Không tìm thấy bản ghi trong Database | Hiển thị Empty state hoặc trang 404 |
| `409` | Conflict | Xung đột trạng thái / thời gian (Sửa bàn $< 60$ phút, Đặt trùng giờ) | Báo lỗi xung đột để người dùng chọn lại |
| `422` | Unprocessable Entity | Dữ liệu FormRequest gửi lên không qua được validate | Map các trường trong `errors` hiển thị dưới từng ô input |
| `429` | Too Many Requests | Nhấn nút đúp bị chặn bởi Redis Distributed Lock (sau 10s) | Thông báo thao tác quá nhanh, vui lòng chờ |

---

## 4. Chuẩn Phân Trang (Pagination Envelope)

Dành cho các danh sách phân trang (Món ăn, Đơn hàng, Đặt bàn, Tài khoản):

```json
{
  "success": true,
  "code": 200,
  "message": "Query successfully",
  "data": {
    "items": [ ... ],
    "pagination": {
      "currentPage": 1,
      "perPage": 10,
      "totalItems": 45,
      "lastPage": 5
    }
  }
}
```

> 💡 **Khuyến nghị Frontend:** Luôn bóc tách dữ liệu phòng thủ an toàn:
> ```javascript
> const items = res.data?.data?.items || res.data?.data || []
> const pagination = res.data?.data?.pagination || { currentPage: 1, lastPage: 1, totalItems: 0 }
> ```
