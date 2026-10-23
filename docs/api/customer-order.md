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
  "scheduledAt": null,
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
    "fulfillmentType": "DELIVERY",
    "fulfillmentStatus": "PENDING",
    "itemsSubtotal": 650000.00,
    "deliveryFee": 0.00,
    "totalAmount": 650000.00,
    "recipientName": "Lê Hoàng Hùng",
    "recipientPhone": "0923456789",
    "shippingAddress": "789 Cách Mạng Tháng 8, Quận 3, TP.HCM",
    "scheduledAt": null,
    "orderNote": "Gọi điện khi tới sảnh",
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
- **Ghi chú nghiệp vụ:** Checkout online chỉ nhận `DELIVERY` hoặc `PICKUP`. Với `PICKUP`, bỏ `shippingAddress` và có thể gửi `scheduledAt` trong tương lai; “lấy sớm nhất” gửi `scheduledAt: null`. `DINE_IN` đi qua đặt bàn và POS khi khách đến. Người nhận, điện thoại, địa chỉ, lịch nhận và ghi chú là các trường độc lập. Backend thực thi checkout trong `DB::transaction()`, snapshot giá món, tạo `Payment` và làm rỗng giỏ.

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

## Ngoại lệ phía khách (ADR-026, ADR-027)

- Checkout gửi `expectedTotal` (tổng giỏ đang hiển thị). Giá đổi → `409`, `errors.reason = "PRICE_CHANGED"`, `errors.currentTotal`; UI hỏi "Đặt với giá mới".
- `scheduledAt` cho giao và tự lấy: tương lai, ≤ 7 ngày, 10:00–22:00. Không hẹn khi bếp đã ngưng nhận đơn → 409.
- Đơn tự lấy có `pickupCode` 4 số (đọc khi nhận, người lấy hộ dùng cùng mã).
- `PATCH /customer/orders/{id}/recipient` sửa người nhận/SĐT/địa chỉ trước khi giao tài xế (`canEditRecipient`).
- Đơn thêm `deliveryFailure`, `cancellation{reason, at, moneyDecision}`, `money{amountPaid, amountRefunded, outstanding, refundDue}`; dòng món đã hủy có `cancelled`, `cancelReason`.
- Đơn tiền mặt đã xác nhận không đổi sang QR được (409).

Đặc tả đầy đủ: `restaurant-lavarel/docs/laravel_restful_api_specifications.md` Phần E; chính sách: `restaurant-lavarel/docs/operations/exception-policies.md`.

## Checkout chuyển khoản (sửa sau review G)

Sau khi `POST /customer/orders/checkout` thành công với `BANK_TRANSFER_QR`, trang checkout giữ modal VietQR (không tự chuyển về giỏ dù giỏ đã rỗng). Đóng modal → `/orders` kèm thông báo "Đã tạo đơn #…. Bạn có thể quét lại mã VietQR trong chi tiết đơn nếu chưa thanh toán."
