# ADMIN — Bàn ăn, Đặt bàn & Báo cáo Thống kê (`Admin\TableController`, `ReservationController`, `ReportController`)

> **Middleware chung:** `auth:sanctum`, `account.active`, `role:ADMIN`
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md)

---

## A. Quản lý Bàn ăn & Điều phối Đặt bàn (`BKG-05` → `BKG-12`)

### Endpoints

| Chức năng | Method & URL |
|-----------|-------------|
| Danh sách bàn (`BKG-05`) | `GET /api/v1/admin/tables` |
| Thêm bàn (`BKG-05`) | `POST /api/v1/admin/tables` |
| Sửa bàn & sức chứa (`BKG-06`) | `PUT /api/v1/admin/tables/{tableId}` |
| Cấu hình khung giờ (`BKG-07`) | `PUT /api/v1/admin/reservations/time-slots` |
| Danh sách đặt bàn (`BKG-08`) | `GET /api/v1/admin/reservations` |
| Xác nhận/Từ chối/Hủy/Hoàn thành (`BKG-09` → `BKG-12`) | `PATCH /api/v1/admin/reservations/{reservationId}/status` |

### Request Body (`PATCH /api/v1/admin/reservations/{reservationId}/status`)
```json
{
  "targetStatus": "CONFIRMED",
  "adminNote": "Đã giữ Bàn số 2 cạnh cửa sổ"
}
```

### Response (Success - 200 OK)
```json
{
  "success": true,
  "code": 200,
  "message": "Reservation confirmed successfully",
  "data": {
    "reservationId": 3,
    "status": "CONFIRMED",
    "tableId": 2,
    "tableStatus": "RESERVED"
  }
}
```

### Response (Error - 409 Conflict)
```json
{
  "success": false,
  "code": 409,
  "message": "Table #2 has an overlapping CONFIRMED reservation at this time",
  "errors": null
}
```

### Ghi chú nghiệp vụ
- Bàn ở trạng thái `RESERVED` khi có lượt đặt `CONFIRMED` trong hôm nay (kể cả lượt bắt đầu chưa quá 119 phút và chưa nhận bàn). Khi lượt cuối cùng bị hủy/từ chối/hoàn tất, bàn trở về `AVAILABLE`. `OCCUPIED`, `CLEANING`, `MAINTENANCE` không bị ghi đè.
- Không xác nhận lượt đặt đã quá giờ; không đổi trạng thái lượt đặt đang có khách ngồi (trừ `COMPLETED`) — POS tự hoàn tất khi đóng phiên.
- `PUT /admin/tables/{id}` chỉ nhận `status` thủ công `AVAILABLE`, `CLEANING`, `MAINTENANCE` (422 với `OCCUPIED`/`RESERVED`). Chặn đổi trạng thái khi bàn đang có phiên POS và chặn bảo trì khi bàn có lượt đặt đã xác nhận hôm nay. Bàn mới chỉ tạo ở `AVAILABLE`/`MAINTENANCE`.
- `GET /admin/reservations` nhận thêm `scope` = `upcoming` (mặc định, từ đầu hôm nay), `past`, `all`; mỗi lượt có `isSeated`.

---

## B. Báo cáo Thống kê Dashboard (`RPT-01` → `RPT-04`)

- **Method & URL:** `GET /api/v1/admin/reports/dashboard?fromDate=2026-06-01&toDate=2026-06-30`
- **Response (Success - 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Dashboard report generated successfully",
  "data": {
    "revenue": {
      "totalPaidRevenue": 785000.00,
      "dailySeries": [
        { "date": "2026-06-01", "amount": 650000.00 },
        { "date": "2026-06-02", "amount": 135000.00 }
      ]
    },
    "orders": {
      "totalCount": 3,
      "completedCount": 1,
      "cancelledCount": 0,
      "completionRate": 33.33
    },
    "topSellingDishes": [
      { "dishId": 4, "dishName": "Trà đào cam sả", "totalSold": 3, "revenue": 135000.00, "preparedQuantity": 4, "freeQuantity": 1 },
      { "dishId": 1, "dishName": "Súp bào ngư", "totalSold": 2, "revenue": 300000.00, "preparedQuantity": 2, "freeQuantity": 0 }
    ],
    "reservations": {
      "totalBookings": 3,
      "confirmedBookings": 2,
      "occupancyRatePercent": 50.00
    }
  }
}
```
- **Response (Error - 422 Unprocessable Entity):**
```json
{
  "success": false,
  "code": 422,
  "message": "Invalid date range",
  "errors": {
    "toDate": ["The to date must be a date after or equal to from date."]
  }
}
```
- **Ghi chú nghiệp vụ:** Món bán chạy: `totalSold` = số phần **tính tiền**, `revenue` = Σ `billedAmount` (dòng làm lại 0 ₫, phần miễn, phần hủy không cộng); `preparedQuantity` = số phần bếp làm xong/phục vụ, `freeQuantity` = phần làm lại/miễn. Món không có phần tính tiền không vào danh sách. `finance.salesValue` đã trừ bồi hoàn, `finance.compensationValue` hiện riêng.

### Trường bổ sung của dashboard
- `revenue.refundedAmount`, `revenue.averageOrderValue`, `revenue.byMethod.{CASH, BANK_TRANSFER_QR}`.
- `orders.byFulfillmentType.{DELIVERY, PICKUP, DINE_IN}` (không tính đơn hủy/nháp).
- `attention.{pendingOrders, readyForHandoff, refundsPending, reservationsToConfirm}` — số việc cần xử lý ngay (không phụ thuộc kỳ báo cáo).

## Báo cáo tài chính & cảnh báo mới (ADR-023)

- `finance`: giá trị bán (ngày đặt), tiền thực nhận (ngày tiền về), tiền hoàn (ngày hoàn), thực nhận ròng, chưa phân bổ, phải hoàn, khách còn nợ, giá trị đơn hủy, món hủy/miễn/làm lại, thất thu, tiền cũ không rõ ngày, `formula`.
- `attention`: `refundsPending`, `transactionsToReview`, `approvalsPending`, `deliveryFailed`, `driverWaitTooLong`, `pickupOverdue` (bên cạnh chỉ số cũ).
- `revenue.totalPaidRevenue` nay là tiền đã áp vào đơn bán (không tính đơn hủy, trừ khi giữ tiền).

Đặc tả đầy đủ: `restaurant-lavarel/docs/laravel_restful_api_specifications.md` Phần E; chính sách: `restaurant-lavarel/docs/operations/exception-policies.md`.
