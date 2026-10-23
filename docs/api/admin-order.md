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
| Cập nhật trạng thái bàn giao | `PATCH /api/v1/admin/orders/{orderId}/fulfillment-status` |
| Hủy đơn kèm lý do (`ORD-12`) | `POST /api/v1/admin/orders/{orderId}/cancel` |
| Chi tiết đơn | `GET /api/v1/admin/orders/{orderId}` |

Bộ lọc danh sách: `status`, `fulfillmentType` (`DELIVERY`/`PICKUP`/`DINE_IN`), `keyword` (mã đơn, tên/SĐT người nhận, tài khoản), `page`, `perPage` (≤ 50).

### Request Body (`PATCH /api/v1/admin/orders/{orderId}/status`)
```json
{
  "targetStatus": "PREPARING",
  "reason": "Khách gọi báo đến sớm 20 phút"
}
```
`reason` chỉ bắt buộc khi cho đơn hẹn giờ xuống bếp trước `kitchenReleaseAt` (`availableActions.startRequiresReason = true`); thiếu → 422, có → nhật ký `ORDER_STARTED_EARLY`. UI: màn Đơn hàng mở hộp thoại nhập lý do, thẻ đơn hiện "Tự xuống bếp lúc HH:mm".

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
Kiểm tra tính hợp lệ của luồng trạng thái thông qua hàm `OrderStatus::canTransitionTo($newStatus)`. Luồng bếp dừng ở `READY`; không gửi trực tiếp `COMPLETED`.

### Luồng bàn giao sau khi bếp sẵn sàng

| Loại phục vụ | Khi vào `READY` | Các bước tiếp theo |
|---------------|-----------------|--------------------|
| `DELIVERY` | `AWAITING_DRIVER` | `OUT_FOR_DELIVERY → DELIVERED` |
| `PICKUP` | `AWAITING_CUSTOMER` | `COLLECTED` |
| `DINE_IN` | Do POS quản lý | `SERVING → SERVED` |

Request cập nhật bàn giao:
```json
{
  "targetStatus": "OUT_FOR_DELIVERY"
}
```

Khi đạt `DELIVERED` hoặc `COLLECTED`, backend tự đổi đơn sang `COMPLETED`. Đơn QR phải thanh toán trước lúc giao cho tài xế hoặc hoàn tất bàn giao; đơn tiền mặt được ghi nhận thanh toán tại thời điểm bàn giao cuối.

---

## B. Thanh toán (Payment)

### Endpoints (`PAY-04` → `PAY-07`)

| Chức năng | Method & URL |
|-----------|-------------|
| Tra cứu giao dịch (`PAY-04`) | `GET /api/v1/admin/payments` |
| Đối soát số tiền (`PAY-05`) | `POST /api/v1/admin/payments/reconcile` |
| Ghi nhận hoàn tiền (`PAY-06`) | `POST /api/v1/admin/payments/{paymentId}/refund` |
| Xem log lỗi Callback (`PAY-07`) | `GET /api/v1/admin/payments/callback-logs` |
| Xác nhận chuyển khoản thủ công (`PAY-08`) | `POST /api/v1/admin/payments/{paymentId}/confirm` |

Bộ lọc danh sách giao dịch: `status`, `method` (`CASH`/`BANK_TRANSFER_QR`), `keyword` (mã đơn, mã giao dịch). Mỗi giao dịch trả thêm `orderStatus`, `fulfillmentType`, `invoiceId`.

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

### Xác nhận chuyển khoản thủ công (`PAY-08`)
Dùng khi nhà hàng đã thấy tiền về trong ứng dụng ngân hàng nhưng chưa có webhook.
```json
{ "transactionCode": "FT26102100123", "note": "Đã kiểm tra trên app ngân hàng" }
```
- Chỉ áp dụng cho giao dịch `BANK_TRANSFER_QR` đang `UNPAID`/`FAILED` của đơn chưa hủy (409 nếu đã `PAID`/`REFUNDED` hoặc là tiền mặt).
- Ghi `ma_giao_dich`, lưu vết `log_callback = {source: MANUAL_CONFIRMATION, confirmedBy, note}`; đơn `PENDING_CONFIRMATION` tự chuyển `CONFIRMED`.

### Webhook cổng thanh toán
`POST /api/v1/webhooks/payment-callback` bắt buộc header `X-Signature = HMAC-SHA256(raw body, PAYMENT_WEBHOOK_SECRET)`.
- Sai chữ ký → 401; chưa cấu hình secret → 503 (chỉ bỏ qua khi `PAYMENT_WEBHOOK_ALLOW_UNSIGNED=true` cho demo nội bộ).
- Bắt buộc `amount`/`transferAmount` > 0; thiếu tiền → 400 và lưu log `PAID_AMOUNT_TOO_LOW`; callback lặp lại cho đơn đã `PAID` được chấp nhận idempotent.
- Tiền về cho đơn đã hủy vẫn ghi `PAID` kèm `requiresRefund: true` để admin hoàn tiền.

### `availableActions` trong mỗi đơn admin
```json
{ "nextStatus": "PREPARING", "nextFulfillmentStatus": null, "canCancel": true, "awaitingQrPayment": false, "requiresRefund": false }
```
Frontend chỉ hiển thị nút theo khối này. Đơn `DINE_IN` luôn không có thao tác (409 nếu gọi API) vì do POS/KDS điều phối. Không thể hủy đơn đang `OUT_FOR_DELIVERY`. Đổi trạng thái đơn online đồng bộ trạng thái món trên KDS (`PREPARING`, `READY`, hủy → `CANCELLED`, hoàn tất → `SERVED`).

## Ngoại lệ giao hàng, tự lấy và tiền (ADR-023, ADR-026)

- `PATCH /admin/orders/{id}/fulfillment-status`: `DELIVERY_FAILED` cần `failureReason` + `note`; `AWAITING_DRIVER` từ `DELIVERY_FAILED` = giao lại; `COLLECTED` cần `pickupCode` hoặc `verifiedPhone` (+ `collectedBy`).
- `POST /admin/orders/{id}/cancel`: `cancelReason`, `reasonType`, `moneyDecision` (`RETAINED` chỉ khi lỗi do khách).
- `PATCH /admin/orders/{id}/recipient` (lý do), `GET /admin/orders/{id}/history`, lọc `fulfillmentStatus`.
- Thanh toán: `confirm` cần `transactionCode` ≥ 6 + `amount`/`receivedAt`; `refund` = "Ghi nhận đã hoàn tiền" (`amount`, `method`, `referenceCode`, `refundReason`, `refundedAt?`); sổ giao dịch `GET /admin/payments/transactions`, `…/{id}/refunds|allocate|resolve`.
- UI: `OrderExceptionModals` (giao thất bại, bàn giao tự lấy, hủy có quyết định tiền, sửa người nhận), trang Thanh toán có tab "Sổ giao dịch tiền", `RefundRecordModal`.

Đặc tả đầy đủ: `restaurant-lavarel/docs/laravel_restful_api_specifications.md` Phần E; chính sách: `restaurant-lavarel/docs/operations/exception-policies.md`.

## Sửa sau review A–N (ADR-028)

- `confirm`: định danh chuyển khoản theo ngân hàng + tài khoản nhận + mã — xác nhận tay rồi webhook của cùng khoản không ghi hai lần. Đơn đã đủ tiền vẫn ghi được khoản chuyển thêm (cờ `DUPLICATE`, chờ hoàn); phản hồi có `lastReceipt{transactionId, amount, applied, flag, reconciliation}`. UI: nút "Ghi nhận khoản chuyển thêm".
- `refund` và `transactions/{id}/refunds`: thêm `refundType` (`REFUND` mặc định | `COMPENSATION`) và header `Idempotency-Key`. `RefundRecordModal` tạo một khóa cho mỗi lần mở; bấm lại sau mất phản hồi trả bản ghi cũ. Số tiền vượt `refundDue` (sổ giao dịch: `refundDueAmount`) phải chọn "Bồi hoàn cho khách" — backend 422 nếu không; bồi hoàn giảm `payableAmount`, hóa đơn giữ PAID.
- `AdminPayment` thêm `payableAmount`, `compensationAmount`; `MoneyTransaction` thêm `refundDueAmount`, `refunds[].type`, `refunds[].fromAllocated`.
- Review lần 2: một lần ghi hoàn trên giao dịch đã áp cho nhiều đơn sinh nhiều dòng `refunds[]` (mỗi đơn một dòng, phần chưa phân bổ một dòng, chung khóa). Sổ giao dịch hiện "Đã hoàn X · đơn #N" hoặc "(tiền chưa phân bổ)"; `amountRefunded` của từng đơn đúng phần của đơn đó. Chuyển khoản cùng dãy số tài khoản ở ngân hàng khác là khoản riêng, hiện "Cần xem xét" kèm ghi chú đối soát.
- `AdminOrder` thêm `kitchenReleaseAt`, `awaitingKitchenRelease`, `availableActions.startRequiresReason`.
