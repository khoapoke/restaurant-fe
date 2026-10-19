# ADMIN — Quản lý Đơn hàng & Thanh toán (`Admin\OrderController` & `Admin\PaymentController`)

> **Middleware chung:** `auth:sanctum`, `account.active`, `role:ADMIN`
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md)

---

## A. Đơn hàng (Order)

### Endpoints (`ORD-07` → `ORD-12`)

| Chức năng | Method & URL |
|-----------|-------------|
| Danh sách đơn hàng (`ORD-07`) | `GET /api/v1/admin/orders?status=PENDING_CONFIRMATION&page=1` |
| Chuyển trạng thái đơn (`ORD-08` → `ORD-11`) | `PATCH /api/v1/admin/orders/{orderId}/status` |
| Hủy đơn kèm lý do (`ORD-12`) | `POST /api/v1/admin/orders/{orderId}/cancel` |

### Request Body (`PATCH /api/v1/admin/orders/{orderId}/status`)
```json
{
  "targetStatus": "PREPARING"
}
```

### Response (Success - 200 OK)
```json
{
  "success": true,
  "code": 200,
  "message": "Order status updated successfully",
  "data": {
    "orderId": 2,
    "previousStatus": "CONFIRMED",
    "currentStatus": "PREPARING"
  }
}
```

### Response (Error - 400 Bad Request)
```json
{
  "success": false,
  "code": 400,
  "message": "Invalid status transition from COMPLETED to PREPARING",
  "errors": null
}
```

### Ghi chú nghiệp vụ
Kiểm tra tính hợp lệ của luồng trạng thái thông qua hàm `OrderStatus::canTransitionTo($newStatus)`.

---

## B. Thanh toán (Payment)

### Endpoints (`PAY-04` → `PAY-07`)

| Chức năng | Method & URL |
|-----------|-------------|
| Tra cứu giao dịch (`PAY-04`) | `GET /api/v1/admin/payments` |
| Đối soát số tiền (`PAY-05`) | `POST /api/v1/admin/payments/reconcile` |
| Ghi nhận hoàn tiền (`PAY-06`) | `POST /api/v1/admin/payments/{paymentId}/refund` |
| Xem log lỗi Callback (`PAY-07`) | `GET /api/v1/admin/payments/callback-logs` |

### Response (Success - 200 OK — Hoàn tiền)
```json
{
  "success": true,
  "code": 200,
  "message": "Refund recorded successfully",
  "data": {
    "paymentId": 2,
    "orderId": 2,
    "amount": 135000.00,
    "status": "REFUNDED",
    "refundReason": "Nhà hàng hết nguyên liệu đột xuất"
  }
}
```

### Response (Error - 400 Bad Request)
```json
{
  "success": false,
  "code": 400,
  "message": "Only PAID transactions can be refunded",
  "errors": null
}
```

### Ghi chú nghiệp vụ
Đối chiếu `THANH_TOAN.so_tien === DON_HANG.tong_tien` và lưu vết khi hoàn tiền.
