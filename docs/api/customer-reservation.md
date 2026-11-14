# ĐẶT BÀN TRỰC TUYẾN (CUSTOMER RESERVATION APIs)

> 📌 **Tài liệu nghiệp vụ chuyên sâu Backend:** [modules/reservation.md](../modules/reservation.md)  
> *(Xem chi tiết: Công thức loại trừ xung đột ca ăn $\pm 119$ phút, Quy tắc báo trước 30'/120', Khóa Redis chống đặt trùng bàn)*  
> Middleware: `auth:sanctum`, `role:CUSTOMER` (ngoại trừ API tìm bàn trống là Public).  
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md) và danh mục Enum tại [`enums.md`](./enums.md).

---

## 1. Bảng Tổng Hợp Endpoints

| Mã API | Method | Endpoint URL | Phân quyền | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---:|:---|:---:|
| `BKG-01` | `GET` | `/api/v1/customer/reservations/available-tables` | Public | Tìm bàn trống theo ngày, giờ và số lượng khách | `200 / 422` |
| `BKG-02` | `POST` | `/api/v1/customer/reservations` | `CUSTOMER` | Tạo phiếu đặt bàn mới (Redis lock 5s) | `201 / 400 / 409` |
| `BKG-03` | `PUT` | `/api/v1/customer/reservations/{id}` | `CUSTOMER` | Cập nhật thông tin đặt bàn (trước giờ đến $\ge 60$') | `200 / 409` |
| `BKG-04` | `PUT` | `/api/v1/customer/reservations/{id}/cancel` | `CUSTOMER` | Khách hủy phiếu đặt bàn (trước giờ đến $\ge 60$') | `200 / 409` |
| `BKG-05` | `GET` | `/api/v1/customer/reservations` | `CUSTOMER` | Lịch sử đặt bàn của khách (phân trang) | `200` |
| `BKG-06` | `GET` | `/api/v1/customer/reservations/{id}` | `CUSTOMER` | Chi tiết một phiếu đặt bàn cụ thể | `200 / 404` |

---

## 2. Chi Tiết Request & Response

### 2.1. Tìm kiếm bàn ăn khả dụng (`BKG-01`)
- **Endpoint:** `GET /api/v1/customer/reservations/available-tables`
- **Query Parameters:**
  - `date`: Ngày đặt (định dạng `Y-m-d`, ví dụ `2026-11-20`)
  - `time`: Giờ đến (định dạng `H:i`, ví dụ `19:00`)
  - `guestCount`: Số lượng khách (ví dụ `4`)

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Available tables retrieved successfully",
  "data": [
    {
      "tableId": 3,
      "tableName": "Bàn VIP 01",
      "capacity": 6,
      "status": "AVAILABLE"
    },
    {
      "tableId": 5,
      "tableName": "Bàn Tiêu Chuẩn 05",
      "capacity": 4,
      "status": "AVAILABLE"
    }
  ],
  "errors": null
}
```

---

### 2.2. Tạo phiếu đặt bàn (`BKG-02`)
- **Endpoint:** `POST /api/v1/customer/reservations`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`, `Accept: application/json`

#### Request Body:
```json
{
  "tableId": 3,
  "reservationTime": "2026-11-20 19:00:00",
  "guestCount": 4,
  "note": "Kỷ niệm ngày cưới, cần bàn yên tĩnh"
}
```

#### Response Thành công (`201 Created` - `ReservationResource`):
```json
{
  "success": true,
  "code": 201,
  "message": "Reservation created successfully",
  "data": {
    "reservationId": 25,
    "reservationTime": "2026-11-20 19:00:00",
    "guestCount": 4,
    "status": "PENDING",
    "note": "Kỷ niệm ngày cưới, cần bàn yên tĩnh",
    "table": {
      "tableId": 3,
      "tableName": "Bàn VIP 01",
      "capacity": 6
    }
  },
  "errors": null
}
```

#### Response Lỗi:
- **`400 Bad Request`**: Thời gian đặt quá gấp ($< 30$ phút đối với bàn thường, $< 120$ phút đối với ghi chú đặc biệt).
- **`409 Conflict`**: Bàn đã có khách khác đặt trước trong khung giờ $\pm 119$ phút.

---

### 2.3. Sửa hoặc Hủy phiếu đặt bàn (`BKG-03`, `BKG-04`)
- **Endpoint Sửa:** `PUT /api/v1/customer/reservations/{id}`
- **Endpoint Hủy:** `PUT /api/v1/customer/reservations/{id}/cancel`

#### Response Lỗi (`409 Conflict` khi sửa/hủy dưới 60 phút):
```json
{
  "success": false,
  "code": 409,
  "message": "Không thể thay đổi hoặc hủy bàn khi chỉ còn dưới 60 phút trước giờ hẹn",
  "data": null,
  "errors": null
}
```
