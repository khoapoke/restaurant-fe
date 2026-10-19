# CUSTOMER — Đặt bàn Trực tuyến (`Customer\ReservationController`)

> **Middleware chung:** `auth:sanctum`, `account.active`, `role:CUSTOMER`
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md)

---

## Endpoints

| Chức năng | Method & URL | Use Case |
|-----------|-------------|----------|
| Tìm bàn trống (`BKG-01`) | `GET /api/v1/customer/tables/available?date=2026-06-15&time=19:00&guestCount=4` | Tra cứu |
| Tạo lượt đặt bàn (`BKG-02`) | `POST /api/v1/customer/reservations` | Đặt bàn |
| Xem lịch sử đặt bàn | `GET /api/v1/customer/reservations` | Danh sách |
| Sửa lượt đặt bàn (`BKG-03`) | `PUT /api/v1/customer/reservations/{reservationId}` | Chỉnh sửa |
| Hủy lượt đặt bàn (`BKG-04`) | `POST /api/v1/customer/reservations/{reservationId}/cancel` | Hủy |

---

## Request Body (`POST /api/v1/customer/reservations`)
```json
{
  "tableId": 1,
  "reservationTime": "2026-06-15 19:00:00",
  "guestCount": 4,
  "note": "Cần chuẩn bị ghế trẻ em"
}
```

## Response (Success - 201 Created)
```json
{
  "success": true,
  "code": 201,
  "message": "Reservation created successfully",
  "data": {
    "reservationId": 4,
    "reservationTime": "2026-06-15T19:00:00",
    "guestCount": 4,
    "status": "PENDING",
    "note": "Cần chuẩn bị ghế trẻ em",
    "table": {
      "tableId": 1,
      "tableName": "Bàn số 1",
      "capacity": 4,
      "location": "Khu vực sảnh chính"
    }
  }
}
```

## Response (Error - 409 Conflict)
```json
{
  "success": false,
  "code": 409,
  "message": "Cannot modify or cancel reservation less than 60 minutes before scheduled time",
  "errors": null
}
```

---

## Ghi chú nghiệp vụ
- Dùng thư viện `Carbon` để kiểm tra điều kiện báo trước 2 tiếng (nếu có yêu cầu đặc biệt).
- Sửa/hủy trước tối thiểu 1 tiếng: `now()->diffInMinutes($reservation->thoi_gian, false) >= 60`.
