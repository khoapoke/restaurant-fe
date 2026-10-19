# CUSTOMER — Checkout, Lịch sử Đơn hàng & Thanh toán QR (`Customer\OrderController` & `PaymentController`)

> **Middleware chung:** `auth:sanctum`, `account.active`, `role:CUSTOMER`
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md)

---

## A. Đơn hàng (Order)

### 1. Tạo đơn hàng — Checkout (`ORD-01`, `ORD-02`, `ORD-03`)
- **Method & URL:** `POST /api/v1/customer/orders/checkout`
- **Request Body:**
```json
{
  "fulfillmentType": "DELIVERY",
  "recipientName": "Lê Hoàng Hùng",
  "recipientPhone": "0923456789",
  "shippingAddress": "789 Cách Mạng Tháng 8, Quận 3, TP.HCM",
  "paymentMethod": "BANK_TRANSFER_QR",
  "orderNote": "Gọi điện khi tới sảnh"
}
```
- **Response (Success - 201 Created):**
```json
{
  "success": true,
  "code": 201,
  "message": "Order created successfully",
  "data": {
    "orderId": 4,
    "orderDate": "2026-06-10T10:15:00",
    "status": "PENDING_CONFIRMATION",
    "totalAmount": 650000.00,
    "shippingAddress": "[DELIVERY] Lê Hoàng Hùng - 0923456789 | 789 Cách Mạng Tháng 8, Quận 3, TP.HCM | Note: Gọi điện khi tới sảnh",
    "payment": {
      "paymentId": 4,
      "amount": 650000.00,
      "paymentMethod": "BANK_TRANSFER_QR",
      "status": "UNPAID"
    },
    "items": [
      {
        "dishId": 1,
        "dishName": "Súp bào ngư",
        "quantity": 2,
        "unitPrice": 150000.00,
        "subTotal": 300000.00
      },
      {
        "dishId": 2,
        "dishName": "Bò sốt tiêu đen",
        "quantity": 1,
        "unitPrice": 350000.00,
        "subTotal": 350000.00
      }
    ]
  }
}
```
- **Response (Error - 400 Bad Request):**
```json
{
  "success": false,
  "code": 400,
  "message": "Cannot checkout an empty cart",
  "errors": null
}
```
- **Ghi chú nghiệp vụ:** Thực thi trong `DB::transaction()`. Ghi chi tiết món vào `CHI_TIET_DON_HANG` bằng `$order->dishes()->attach($pivotData)`, tạo `Payment` (`THANH_TOAN`) và xóa sạch giỏ bằng `$cart->dishes()->detach()`.

---

### 2. Xem lịch sử đơn hàng (`ORD-04`)
- **Method & URL:** `GET /api/v1/customer/orders`

### 3. Xem chi tiết đơn hàng (`ORD-05`)
- **Method & URL:** `GET /api/v1/customer/orders/{orderId}`

### 4. Khách yêu cầu hủy đơn (`ORD-06`)
- **Method & URL:** `POST /api/v1/customer/orders/{orderId}/cancel`
- **Request Body:**
```json
{
  "cancelReason": "Đổi ý chọn món khác"
}
```
- **Response (Success - 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Order cancelled successfully",
  "data": {
    "orderId": 3,
    "status": "CANCELLED"
  }
}
```
- **Response (Error - 409 Conflict):**
```json
{
  "success": false,
  "code": 409,
  "message": "Order cannot be cancelled because it is already being prepared by the kitchen",
  "errors": null
}
```
- **Ghi chú nghiệp vụ:** Khách chỉ hủy được khi `$order->trang_thai === OrderStatus::PENDING_CONFIRMATION`.

---

## B. Thanh toán QR (Payment)

### 1. Sinh mã QR Thanh toán (`PAY-01`)
- **Method & URL:** `POST /api/v1/customer/payments/{orderId}/qr`
- **Response (Success - 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "QR code generated successfully",
  "data": {
    "paymentId": 4,
    "orderId": 4,
    "amount": 650000.00,
    "paymentMethod": "BANK_TRANSFER_QR",
    "status": "UNPAID",
    "qrImageUrl": "https://img.vietqr.io/image/970436-1029384756-compact2.png?amount=650000&addInfo=DH4%20THANH%20TOAN",
    "transferContent": "DH4 THANH TOAN",
    "expiresAt": "2026-06-10T10:30:00Z"
  }
}
```
- **Response (Error - 409 Conflict):**
```json
{
  "success": false,
  "code": 409,
  "message": "Order has already been paid",
  "errors": null
}
```

### 2. Kiểm tra kết quả giao dịch (`PAY-02`)
- **Method & URL:** `GET /api/v1/customer/payments/{orderId}/status`

### 3. Thử lại thanh toán khi lỗi/hết hạn (`PAY-03`)
- **Method & URL:** `POST /api/v1/customer/payments/{orderId}/retry`

### 4. Webhook nhận kết quả từ Cổng thanh toán
- **Method & URL:** `POST /api/v1/webhooks/payment-callback`
- **Ghi chú nghiệp vụ:** Tích hợp chuẩn VietQR/PayOS/SePay. Đối chiếu chữ ký HMAC và số tiền `so_tien` trước khi cập nhật `THANH_TOAN.trang_thai = PaymentStatus::PAID`.
