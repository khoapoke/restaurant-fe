# MỘC ĐỒNG HÀNH — Thông báo, chat hỗ trợ, nhật ký email

> Backend: `docs/laravel_restful_api_specifications.md` — **PHẦN F**; nghiệp vụ: `docs/business_logic_and_validation_rules.md` §8; ADR-029.
> Tất cả URL có tiền tố `/api/v1`. Service FE: `src/features/communications/services.js`.

## 1. Endpoint

| Hàm FE | Method & URL | Ghi chú |
|---|---|---|
| `noticesApi({ page })` | `GET /customer/notifications` | 20/trang; `receipt.rows[]` hiển thị nguyên trạng, không tự tính lại |
| `readNoticeApi(id)` / `readAllNoticesApi()` | `POST /customer/notifications/{id}/read`, `POST /customer/notifications/read-all` | |
| `feedbackApi(id, { rating, comment })` | `POST /customer/notifications/{id}/feedback` | 1–5 điểm, ≤ 1000 ký tự |
| `currentChatApi` / `openChatApi` / `chatApi(id, signal, before)` | `GET /customer/support/current`, `POST /customer/support`, `GET /customer/support/{id}?before=` | |
| `sendChatApi(id, { body, clientKey })` | `POST /customer/support/{id}/messages` | `clientKey` UUID, gửi lại cùng khóa không tạo tin mới |
| `chatActionApi(id, action)` | `POST /customer/support/{id}/actions` | `handoff` \| `close` |
| `supportQueueApi({ status, page })` | `GET /staff/support` | |
| `staffChatApi` / `staffSendChatApi` | `GET /staff/support/{id}`, `POST /staff/support/{id}/messages` | Chỉ người phụ trách gửi được |
| `staffChatActionApi(id, action, { reason, assigneeId })` | `POST /staff/support/{id}/actions` | `claim`, `close`, `release` (lý do), ADMIN: `reassign` (lý do + `assigneeId`), `takeover` (lý do) |
| `supportAssigneesApi()` | `GET /admin/support/assignees` | ADMIN; nhân viên/quản lý đang hoạt động |
| `deliveriesApi({ status, page })` / `retryDeliveryApi(id, { reason, acknowledgeDuplicateRisk })` | `GET /admin/communications/deliveries`, `POST /admin/communications/deliveries/{id}/retry` | Thư quá hạn (`EMAIL_EXPIRED`) không gửi lại được (409) |

Giới hạn thao tác: khách 12/phút (chat và đánh giá là hai bucket riêng), nhân viên 60/phút, gửi lại email 10/phút → 429.

## 2. Quy tắc phía frontend

- **Polling** (`useLivePolling`): chat 2,5 giây, hộp thư 3 giây, thông báo/nhật ký 10 giây, dừng khi tab ẩn. Truyền `resetKey`
  (trang, bộ lọc, hội thoại đang xem) để khi đổi thì request cũ bị hủy và tải ngay; dùng `dataKey !== resetKey` để làm mờ danh sách cũ.
- **Tin chờ gửi** (`pendingMessages.js`): mỗi tin một khóa `moc-chat-pending:{customer|staff}:{accountId}:{conversationId}:{clientKey}`,
  lưu trước khi gửi, chỉ xóa khi có phản hồi nghiệp vụ hoặc khi `clientKey` đã xuất hiện trong hội thoại (phản hồi bị mất). Hai tab không
  ghi đè nhau. Toàn bộ bị xóa khi đăng xuất, 401/tài khoản bị khóa hoặc đăng nhập tài khoản khác; trước khi lưu, ô soạn kiểm phiên đang lưu
  vẫn là tài khoản của mình. `AuthContext` đồng bộ đăng xuất/đổi tài khoản giữa các tab qua sự kiện `storage`.
- **Xác nhận**: kết thúc, trả về hàng chờ, chuyển người phụ trách, tiếp quản dùng `ConfirmDialog` (lý do ≥ 5 ký tự), không dùng `window.confirm`.
- **Biên nhận**: hiển thị `receipt.rows` (cùng công thức với email) và `receipt.updateText` nếu có hoàn tiền/bồi hoàn/hủy sau lúc thu.
- **Thẻ món AI**: nhãn dị ứng qua `ALLERGEN_LABEL` (`src/features/dine/constants.js`).
