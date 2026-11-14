# QUẢN LÝ ĐƠN HÀNG & THANH TOÁN (ADMIN ORDER & PAYMENT APIs)

> 📌 **Tài liệu nghiệp vụ chuyên sâu Backend:**  
> - Máy trạng thái & FSM Đơn hàng: [modules/order.md](../modules/order.md)  
> - Đối soát & Webhook Thanh toán: [modules/payment.md](../modules/payment.md)  
> *(Xem chi tiết: Ràng buộc hoàn tiền, Tự động gán PAID khi giao đơn tiền mặt, Chặn hoàn thành khi QR chưa thanh toán)*  
> Middleware bắt buộc: `auth:sanctum`, `account.active`, `role:ADMIN`.  
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md) và danh mục Enum tại [`enums.md`](./enums.md).

---

## 1. Bảng Tổng Hợp Endpoints

### 1.1. Quản lý Đơn hàng (Order Endpoints)
| Mã API | Method | Endpoint URL | Request Body | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---|:---|:---:|
| `ORD-06` | `GET` | `/api/v1/admin/orders` | Query: `page`, `status`, `date` | Danh sách đơn hàng phân trang theo ngày, status | `200` |
| `ORD-07` | `GET` | `/api/v1/admin/orders/{id}` | *(Không)* | Xem chi tiết đơn hàng kèm danh sách món & khách | `200 / 404` |
| `ORD-08` | `PATCH`| `/api/v1/admin/orders/{id}/status` | `{ "targetStatus", "cancelReason"? }` | Chuyển trạng thái đơn hàng (FSM 5 bước) | `200 / 400 / 404` |

### 1.2. Quản lý Giao dịch Thanh toán (Payment Endpoints)
| Mã API | Method | Endpoint URL | Request Body | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---|:---|:---:|
| `PAY-01` | `GET` | `/api/v1/admin/payments` | Query: `page`, `status`, `method`, `date` | Lịch sử giao dịch thanh toán phân trang | `200` |
| `PAY-02` | `GET` | `/api/v1/admin/payments/{id}` | *(Không)* | Chi tiết giao dịch thanh toán | `200 / 404` |
| `PAY-03` | `PATCH`| `/api/v1/admin/payments/{id}/confirm` | *(Không)* | Xác nhận đã thu tiền mặt tại quầy | `200 / 400` |
| `PAY-05` | `POST` | `/api/v1/admin/payments/{id}/refund` | `{ "refundReason": string }` | Hoàn tiền giao dịch & Tự động hủy đơn hàng | `200 / 400` |

---

## 2. Chi Tiết Request & Response

### 2.1. Chuyển trạng thái đơn hàng (`ORD-08`)
- **Endpoint:** `PATCH /api/v1/admin/orders/{id}/status`
- **Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`, `Accept: application/json`

#### Request Body:
```json
{
  "targetStatus": "PREPARING"
}
```
*(Nếu chuyển sang `CANCELLED`, bắt buộc gửi thêm `cancelReason: "Hết nguyên liệu món chính"`)*

#### Response Thành công (`200 OK` - `AdminOrderResource`):
```json
{
  "success": true,
  "code": 200,
  "message": "Order status updated successfully",
  "data": {
    "orderId": 105,
    "status": "PREPARING",
    "totalAmount": 170000,
    "orderDate": "2026-11-10 12:30:00",
    "customer": {
      "fullName": "Nguyễn Văn A",
      "phoneNumber": "0901234567"
    }
  },
  "errors": null
}
```

#### Response Lỗi:
- **`400 Bad Request`** (Chuyển trạng thái không hợp lệ theo FSM):
```json
{
  "success": false,
  "code": 400,
  "message": "Không thể chuyển trạng thái từ COMPLETED sang PREPARING",
  "data": null,
  "errors": null
}
```
- **`400 Bad Request`** (Đơn chuyển khoản QR chưa thanh toán không được phép hoàn thành):
```json
{
  "success": false,
  "code": 400,
  "message": "Đơn hàng chuyển khoản QR chưa được thanh toán thành công",
  "data": null,
  "errors": null
}
```

---

### 2.2. Xác nhận đã thu tiền mặt tại quầy (`PAY-03`)
- **Endpoint:** `PATCH /api/v1/admin/payments/{id}/confirm`

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Payment confirmed successfully",
  "data": {
    "paymentId": 50,
    "status": "PAID"
  },
  "errors": null
}
```

---

### 2.3. Hoàn tiền giao dịch (`PAY-05`)
- **Endpoint:** `POST /api/v1/admin/payments/{id}/refund`
- **Request Body:**
```json
{
  "refundReason": "Khách báo hủy đơn trước khi chế biến, hoàn tiền qua chuyển khoản"
}
```

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Payment refunded successfully and order has been cancelled",
  "data": {
    "paymentId": 50,
    "status": "REFUNDED",
    "orderStatus": "CANCELLED"
  },
  "errors": null
}
```
