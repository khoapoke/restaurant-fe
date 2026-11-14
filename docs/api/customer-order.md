# ĐƠN HÀNG, CHECKOUT & THANH TOÁN QR (CUSTOMER ORDER & PAYMENT APIs)

> 📌 **Tài liệu nghiệp vụ chuyên sâu Backend:**  
> - Quản lý Đơn hàng & FSM: [modules/order.md](../modules/order.md)  
> - Thanh toán VietQR & Webhook: [modules/payment.md](../modules/payment.md)  
> *(Xem chi tiết: Redis Distributed Lock `lock:order:checkout:{accountId}`, Máy trạng thái 5 bước, Cú pháp VietQR)*  
> Middleware bắt buộc: `auth:sanctum`, `role:CUSTOMER`.  
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md) và danh mục Enum tại [`enums.md`](./enums.md).

---

## 1. Bảng Tổng Hợp Endpoints

| Mã API | Method | Endpoint URL | Phân quyền | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---:|:---|:---:|
| `ORD-01` | `POST` | `/api/v1/customer/orders/checkout` | `CUSTOMER` | Chuyển giỏ hàng thành đơn hàng chính thức | `201 / 400 / 429` |
| `ORD-02` | `PUT` | `/api/v1/customer/orders/{id}/cancel` | `CUSTOMER` | Khách hủy đơn (chỉ khi `PENDING_CONFIRMATION`) | `200 / 409` |
| `ORD-04` | `GET` | `/api/v1/customer/orders` | `CUSTOMER` | Lịch sử đơn hàng cá nhân (phân trang, lọc status) | `200` |
| `ORD-05` | `GET` | `/api/v1/customer/orders/{id}` | `CUSTOMER` | Chi tiết 1 đơn hàng cụ thể | `200 / 404` |
| `PAY-04` | `GET` | `/api/v1/customer/payments/{orderId}` | `CUSTOMER` | Lấy link ảnh VietQR Napas 247 và thông tin chuyển khoản | `200 / 404` |
| `PAY-06` | `GET` | `/api/v1/customer/payments/{orderId}/status` | `CUSTOMER` | Polling kiểm tra trạng thái thanh toán real-time | `200` |

---

## 2. Chi Tiết Request & Response

### 2.1. Đặt hàng — Checkout (`ORD-01`)
- **Endpoint:** `POST /api/v1/customer/orders/checkout`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`, `Accept: application/json`

#### Request Body:
```json
{
  "fulfillmentType": "DELIVERY",
  "recipientName": "Nguyễn Văn A",
  "recipientPhone": "0901234567",
  "shippingAddress": "123 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM",
  "paymentMethod": "BANK_TRANSFER_QR"
}
```

#### Response Thành công (`201 Created` - `OrderResource`):
```json
{
  "success": true,
  "code": 201,
  "message": "Order created successfully",
  "data": {
    "orderId": 105,
    "orderDate": "2026-11-10 12:30:00",
    "totalAmount": 170000,
    "status": "PENDING_CONFIRMATION",
    "shippingAddress": "[DELIVERY] Nguyễn Văn A - 0901234567 | 123 Lê Duẩn, Q.1",
    "items": [
      {
        "dishId": 5,
        "dishName": "Gỏi ngó sen tôm thịt",
        "quantity": 2,
        "unitPrice": 85000,
        "itemTotal": 170000
      }
    ],
    "payment": {
      "paymentId": 50,
      "method": "BANK_TRANSFER_QR",
      "status": "UNPAID",
      "amount": 170000
    }
  },
  "errors": null
}
```

#### Response Lỗi:
- **`400 Bad Request`**: Giỏ hàng đang trống hoặc món ăn trong giỏ đã bị ngừng phục vụ.
- **`429 Too Many Requests`**: Nhấn đúp quá nhanh (chặn bởi Redis Distributed Lock 10 giây).

---

### 2.2. Khách hủy đơn hàng (`ORD-02`)
- **Endpoint:** `PUT /api/v1/customer/orders/{id}/cancel`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`, `Accept: application/json`

#### Request Body:
```json
{
  "cancelReason": "Tôi muốn đổi sang món khác"
}
```

#### Response Thành công (`200 OK`): Trả về `OrderResource` với trạng thái `status: "CANCELLED"`.
#### Response Lỗi (`409 Conflict`):
```json
{
  "success": false,
  "code": 409,
  "message": "Đơn hàng đã được xác nhận hoặc đang chế biến, không thể hủy",
  "data": null,
  "errors": null
}
```

---

### 2.3. Lịch sử đơn hàng của tôi (`ORD-04`)
- **Endpoint:** `GET /api/v1/customer/orders`
- **Query Parameters:** `page`, `status` (`PENDING_CONFIRMATION`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`)

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Orders retrieved successfully",
  "data": {
    "items": [
      {
        "orderId": 105,
        "orderDate": "2026-11-10 12:30:00",
        "totalAmount": 170000,
        "status": "PENDING_CONFIRMATION",
        "itemsCount": 1
      }
    ],
    "pagination": {
      "currentPage": 1,
      "perPage": 10,
      "totalItems": 12,
      "lastPage": 2
    }
  },
  "errors": null
}
```

---

### 2.4. Lấy thông tin mã VietQR chuyển khoản (`PAY-04`)
- **Endpoint:** `GET /api/v1/customer/payments/{orderId}`

#### Response Thành công (`200 OK` - `CustomerQrResponse`):
```json
{
  "success": true,
  "code": 200,
  "message": "QR code retrieved successfully",
  "data": {
    "orderId": 105,
    "amount": 170000,
    "paymentMethod": "BANK_TRANSFER_QR",
    "status": "UNPAID",
    "qrCodeUrl": "https://img.vietqr.io/image/970422-123456789-compact2.png?amount=170000&addInfo=DH105%20THANH%20TOAN",
    "bankInfo": {
      "bankName": "MBBank",
      "accountNumber": "123456789",
      "accountName": "NHA HANG LUMIERE",
      "transferContent": "DH105 THANH TOAN"
    }
  },
  "errors": null
}
```

---

### 2.5. Polling kiểm tra trạng thái thanh toán (`PAY-06`)
- **Endpoint:** `GET /api/v1/customer/payments/{orderId}/status`

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Payment status checked",
  "data": {
    "status": "PAID",
    "isPaid": true
  },
  "errors": null
}
```
*(Frontend thực hiện Polling mỗi 3–5 giây trong trang thanh toán QR đến khi `isPaid: true`)*
