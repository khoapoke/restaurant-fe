# STAFF — POS tại bàn, Bếp (KDS) & Thanh toán tại bàn

> **Middleware chung:** `auth:sanctum`, `account.active`, `role:STAFF,ADMIN`
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md). Tất cả URL có tiền tố `/api/v1`.

---

## 1. Sơ đồ bàn & phiên phục vụ

| Chức năng | Method & URL |
|-----------|-------------|
| Sơ đồ bàn (kèm phiên đang mở và lượt đặt trong ngày) | `GET /staff/pos/tables` |
| Mở phiên (khách vãng lai hoặc nhận khách đặt trước) | `POST /staff/pos/sessions` (header `Idempotency-Key`) |
| Chi tiết phiên | `GET /staff/pos/sessions/{sessionId}` |
| Hủy phiên mở nhầm | `POST /staff/pos/sessions/{sessionId}/cancel` |
| Xác nhận vệ sinh xong | `POST /staff/pos/tables/{tableId}/complete-cleaning` |

### Mở phiên
```json
{ "tableIds": [1], "guestCount": 2, "reservationId": 4 }
```
- `reservationId` (không bắt buộc): lượt đặt phải `CONFIRMED`, thuộc đúng bàn, diễn ra **trong hôm nay** và chưa được nhận bàn.
- Bàn phải `AVAILABLE` hoặc `RESERVED`. Nếu bàn có lượt đặt `CONFIRMED` trong khung ±119 phút so với hiện tại, chỉ mở được khi truyền đúng `reservationId` đó (409 với khách vãng lai).
- Bàn chuyển `OCCUPIED`; phiên lưu `reservation` để hiển thị trên POS.

### Mỗi bàn trong `GET /staff/pos/tables`
```json
{
  "tableId": 3, "tableName": "Bàn T03", "status": "RESERVED",
  "activeSession": null,
  "upcomingReservation": {
    "reservationId": 4, "reservationTime": "2026-10-21T19:00:00", "guestCount": 4,
    "customerName": "Lê Hoàng Hùng", "customerPhone": "0923456789",
    "note": "Tiệc kỷ niệm", "isWithinSeatingWindow": false
  }
}
```

### Hủy phiên (`cancel`)
- Body: `{ "reason": "Mở nhầm bàn" }` (bắt buộc, 3–255 ký tự).
- Chỉ khi phiên `OPEN` và **chưa có món nào gửi bếp**. Món nháp → `CANCELLED`, order → `CANCELLED`, bàn trở lại `AVAILABLE` (hoặc `RESERVED` nếu còn lượt đặt hôm nay).

## 2. Gọi món

| Chức năng | Method & URL |
|-----------|-------------|
| Tạo order cho phiên | `POST /staff/pos/sessions/{sessionId}/orders` |
| Thêm món (nháp) | `POST /staff/pos/orders/{orderId}/items` (`clientRequestId` chống bấm đúp) |
| Sửa số lượng/ghi chú món nháp | `PATCH /staff/pos/order-items/{itemId}` |
| Xóa món nháp | `DELETE /staff/pos/order-items/{itemId}` |
| Gửi bếp | `POST /staff/pos/orders/{orderId}/send-kitchen` `{ "itemIds": [..] }` |

Món đã gửi bếp không sửa/xóa trực tiếp. Có thể gọi thêm món bất cứ lúc nào khi phiên `OPEN` (kể cả khi bếp đã làm xong các món trước).

## 3. Màn hình bếp (KDS)

| Chức năng | Method & URL |
|-----------|-------------|
| Danh sách món | `GET /staff/kitchen/items` |
| Chuyển trạng thái món | `PATCH /staff/kitchen/items/{itemId}/status` `{ "status": "QUEUED" }` |

- Luồng món: `SENT → QUEUED → PREPARING → READY → SERVED` (mỗi lần một bước).
- Bảng gồm món POS đang làm, món POS `SERVED` của phiên còn mở, và **món của đơn online đã xác nhận** (`CONFIRMED/PREPARING/READY`). Đơn online chưa xác nhận hoặc đã hủy không hiển thị.
- Đơn online: món đầu tiên bắt đầu làm → đơn `PREPARING`; tất cả `READY` → đơn `READY` và tự chuyển `AWAITING_DRIVER`/`AWAITING_CUSTOMER`. Không đánh dấu `SERVED` ở bếp (bàn giao tại màn hình điều phối đơn).
- Mỗi món trả thêm `channel`, `fulfillmentType`, `orderStatus`, `recipientName`, `scheduledAt`, `orderNote`.

## 4. Hóa đơn & thanh toán tại bàn

| Chức năng | Method & URL |
|-----------|-------------|
| Lập hóa đơn | `POST /staff/pos/sessions/{sessionId}/invoices` |
| Mở lại để gọi thêm (hủy hóa đơn chưa trả) | `POST /staff/pos/sessions/{sessionId}/reopen` |
| Thanh toán | `POST /staff/invoices/{invoiceId}/payments` (header `Idempotency-Key`) |
| Đóng phiên | `POST /staff/pos/sessions/{sessionId}/close` `{ "expectedVersion": 5 }` |

- Lập hóa đơn yêu cầu không còn món nháp. Phiên chuyển `AWAITING_PAYMENT`, thực đơn bị khóa.
- `reopen`: hóa đơn `OPEN` → `VOID`, phiên trở lại `OPEN`. Lập lại hóa đơn sẽ tính lại tổng tiền trên cùng mã hóa đơn.
- Hóa đơn `OPEN` trả về khối `qr` (`qrImageUrl`, `transferContent = "HD{invoiceId} THANH TOAN"`, tài khoản nhận).
- Thanh toán: `{ "method": "CASH" | "BANK_TRANSFER_QR", "amount": 203000, "transactionCode": "FT26..." }` — `amount` phải bằng tổng hóa đơn; `transactionCode` lưu mã giao dịch ngân hàng khi chuyển khoản.
- Đóng phiên: hóa đơn `PAID`, mọi món `READY/SERVED`; `expectedVersion` chống ghi đè đồng thời. Kết quả: món `SERVED`, đơn `COMPLETED/SERVED`, bàn `CLEANING`, lượt đặt liên kết `COMPLETED`.
