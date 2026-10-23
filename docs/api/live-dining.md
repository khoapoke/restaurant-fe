# MỘC LIVE DINING — Gọi món QR tại bàn

> Backend: `docs/laravel_restful_api_specifications.md` — **PHẦN D**, ADR-020 (QR ordering), ADR-021 (polling).
> Tất cả URL có tiền tố `/api/v1`. Trang khách: `/dine/:tableToken` (không cần đăng nhập).

## 1. Luồng tổng quát

```
 Khách (điện thoại)                 Nhân viên (POS)                 Bếp (KDS)
 ───────────────────                ───────────────                 ─────────
 Quét QR  /dine/{tableToken}
   │  GET /public/dine/{t}
   ├─ Bàn đã mở  → nhập MÃ BÀN 4 số (nhân viên / người cùng bàn) → POST join
   ├─ Bàn chưa mở → POST check-in ─▶ Hàng đợi Live Dining
   │        (PENDING, chờ…)            "NHẬN KHÁCH" → accept ──▶ PHIÊN POS (OPEN)
   │◀──────── visit ACTIVE ─────────────────┘
   ├─ Thực đơn → giỏ → POST orders ─────────────────────────────▶ Món mới (QR Bàn …)
   │        (Idempotency-Key)                                      NHẬN → NẤU → XONG
   │◀──── Theo dõi: Đã gửi → Đang chế biến → Hoàn thành → Đã phục vụ ◀──┘
   ├─ Gọi phục vụ → POST service-requests ─▶ NHẬN ("Nhân viên đang đến") → XONG
   ├─ Yêu cầu thanh toán (ưu tiên) ────────▶ LẬP HÓA ĐƠN
   │◀──── Hóa đơn + VietQR "HD{id} THANH TOAN" ──┘
   │                                        Thu tiền / xác nhận CK (hoặc webhook HD{id})
   │◀──── "Đã thanh toán" ──────────────────┘
   │                                        ĐÓNG PHIÊN → bàn CLEANING
   └◀──── "Bữa ăn đã hoàn tất" + hóa đơn điện tử (in/lưu PDF)
```

QR → Check-in → POS session → Order → KDS → Tracking → Service request → Invoice → Payment.

## 2. Bảo mật

| Cơ chế | Chi tiết |
|---|---|
| Token bàn | `BAN_AN.ma_qr`, 40 ký tự ngẫu nhiên, không lộ `tableId`. Admin tạo lại tại **Quản trị → Bàn → biểu tượng QR → Tạo mã mới**; mã cũ trả 404 ngay. |
| Mã bàn theo phiên | QR in cố định **không** tự cấp quyền vào phiên. Thiết bị mới phải nhập mã 4 số của phiên hiện tại (đổi mỗi phiên). Sai 5 lần → khóa tới khi nhân viên tạo mã mới. Mã chỉ hiện cho nhân viên và thiết bị đã trong phiên; khách mời bạn bằng mã hoặc link `#code=` (fragment, không gửi lên server). |
| Token thiết bị | 64 ký tự, chỉ trả **một lần** khi check-in/join; FE lưu `localStorage['moc.dine.visit.{tableToken}']`, gửi header `X-Dine-Visit`. DB lưu SHA-256. Gắn với đúng bàn và đúng phiên. |
| Phạm vi dữ liệu | Snapshot chỉ gồm phiên của thiết bị: tên bàn, món, yêu cầu, hóa đơn. Không có id nội bộ, tên nhân viên hay khách khác. |
| Gọi món | Không gửi giá; backend lấy `MON_AN.gia_tien` và snapshot. `Idempotency-Key` chống bấm đúp/mạng chập chờn. Không sửa/xóa món sau khi gửi. |
| Rate limit | Đọc 90/phút, check-in/join 8/phút, gọi món 10/phút, yêu cầu phục vụ 12/phút (theo token bàn + thiết bị + IP). |
| Axios riêng | `src/lib/publicApi.js` không gắn Bearer token của nhân viên/khách và không phát sự kiện đăng xuất. |

## 3. Endpoint khách (`src/features/dine/services/dineService.js`)

| Hàm | Method & URL |
|---|---|
| `getTableStateApi` | `GET /public/dine/{t}?since={version}` → `changed:false` khi không đổi |
| `requestCheckInApi` | `POST /public/dine/{t}/check-in` `{ guestName, guestCount }` → `{ visitToken, live }` |
| `cancelCheckInApi` | `POST /public/dine/{t}/check-in/cancel` |
| `joinTableApi` | `POST /public/dine/{t}/join` `{ joinCode, guestName? }` — bắt buộc mã bàn với thiết bị mới |
| `submitTableOrderApi` | `POST /public/dine/{t}/orders` `{ items: [{ dishId, quantity, note }] }` + `Idempotency-Key` |
| `raiseServiceRequestApi` | `POST /public/dine/{t}/service-requests` `{ type, note?, preferredMethod? }` |
| `cancelServiceRequestApi` | `POST /public/dine/{t}/service-requests/{id}/cancel` |
| `getDineMenuApi` | `GET /customer/categories` + `GET /customer/dishes?perPage=100` (public) |

Mọi thao tác trả `live` (snapshot mới) để UI cập nhật ngay, không chờ vòng polling.

## 4. Endpoint nhân viên (`posService.js`)

| Hàm | Method & URL |
|---|---|
| `getLiveQueueApi` | `GET /staff/live/queue` |
| `acceptCheckInApi` | `POST /staff/live/check-ins/{visitId}/accept` `{ guestCount, reservationId }` |
| `rejectCheckInApi` | `POST /staff/live/check-ins/{visitId}/reject` `{ reason }` |
| `acknowledgeServiceRequestApi` / `completeServiceRequestApi` | `POST /staff/live/service-requests/{id}/acknowledge|complete` |
| `getTableQrApi` | `GET /staff/live/tables/{tableId}/qr` |
| `rotateJoinCodeApi` | `POST /staff/live/sessions/{sessionId}/join-code` (tạo mã bàn mới / mở khóa) |
| `rotateTableQrApi` (admin) | `POST /admin/tables/{tableId}/qr-token` |

## 5. Gửi món bền vững (mất mạng, reload, nhiều tab)

`src/features/dine/hooks/useRoundSubmission.js` (ADR-022):

1. Bấm gửi → lượt được chốt `{ key, items, lines, visit, createdAt }` và ghi vào `localStorage['moc.dine.pending.{tableToken}']` **trước** khi gọi API; các món rời khỏi giỏ.
2. 2xx → xóa lượt treo. Nếu `created:false`, UI báo “Lượt này đã đến bếp từ lần gửi trước”.
3. 4xx nghiệp vụ (401/404/409/422): backend đã rollback → món trả về giỏ để chỉnh.
4. 409 “Idempotency key was already used with a different request.”: đã có lượt mang key này → coi như đã nhận, mời khách xem tab Theo dõi.
5. Lỗi mạng / timeout / 5xx / 429: giữ nguyên lượt, hiện thẻ “chưa được xác nhận” với nút **Gửi lại an toàn** (cùng key, cùng payload). Khi reload hoặc mở tab khác, lượt treo tự được kiểm tra lại một lần. Giỏ mới không gửi được cho tới khi lượt treo có kết quả.
6. Lượt treo của thiết bị/phiên khác (visit đổi) không được gửi vào phiên hiện tại; món được đưa lại vào giỏ kèm thông báo.

## 6. Cập nhật live — polling, không WebSocket

`src/lib/useLivePolling.js` (ADR-021): chuỗi `setTimeout` (không chồng request), `AbortController` khi unmount, giãn chu kỳ khi tab ẩn, đồng bộ lại ngay khi tab hiện/online, backoff khi lỗi mạng với trạng thái `live / reconnecting / offline`.

| Màn hình | Chu kỳ |
|---|---|
| Trang khách `/dine/:token` | 2,5 giây (20 giây khi tab ẩn), dùng `since=version` |
| Hàng đợi Live Dining trên POS | 3 giây |
| KDS | 3 giây (âm báo + hiệu ứng khi có món mới, có nút tắt) |
| Sơ đồ bàn | 8 giây |
| Phiên POS | 4 giây |

## 7. Giao diện

- **Khách:** hero rượu vang, check-in (tên + số khách), chờ xác nhận có vòng sáng, thực đơn ảnh lớn + chip danh mục cuộn ngang + tìm kiếm không dấu, bottom sheet chi tiết món (dị ứng, ghi chú, số lượng), sticky cart, overlay "Bếp đã nhận món", timeline 4 bước theo từng món có đồng hồ chờ và cảnh báo nhẹ khi quá SLA, sheet "Gọi phục vụ", tab Hóa đơn (tạm tính → VietQR → biên nhận in được), màn "Bữa ăn đã hoàn tất". Tôn trọng `prefers-reduced-motion`; nút tối thiểu 44px.
- **POS:** hàng đợi Live Dining (nhận/từ chối check-in, nhận/xong yêu cầu, thời gian chờ), thẻ bàn có tạm tính, số món chờ, món trễ, số thiết bị QR, nhấp sáng khi có yêu cầu mới, viền đỏ khi trễ, viền vàng khi xin thanh toán; bộ lọc nhanh; mã QR bàn.
- **KDS:** nguồn "QR Bàn …", lọc Tất cả / Tại bàn · POS / QR tại bàn / Giao hàng / Tự đến lấy, đồng hồ SLA (bình thường / sắp trễ / đã trễ theo `sla` từ backend), cập nhật lạc quan có hoàn tác khi API lỗi.

## 8. Kiểm thử

- Backend: `tests/Feature/LiveDiningApiTest.php` (25 test, gồm mã bàn, khách bữa trước, khóa mã sai, replay sau khi lập hóa đơn, demo từ chối phiên ghép).
- Browser E2E nhiều context: `node scripts/live-dining-e2e.cjs` (tự chạy `php artisan dining:demo --json` trước và sau): POS, khách mobile, thiết bị thứ hai vào bằng mã/link mời, mất phản hồi + reload (kiểm tra DB chỉ có 1 lượt), khách bữa trước không vào được bữa mới.

## Bổ sung ngoại lệ (ADR-025, ADR-027)

- `POST /public/dine/{token}/orders` nhận `expectedTotal`; giá đổi → 409 `PRICE_CHANGED` + `errors.prices[]`, món trả về giỏ với giá mới. Lượt đã nhận vẫn được xác nhận khi gửi lại cùng key.
- Ngoài 10:00–22:00 không gửi được lượt mới (`entry.orderingOpen=false`, `entry.lastOrderAt`); hóa đơn và thanh toán vẫn bình thường.
- Khi nhân viên chuyển bàn: `entry.movedTo{tableNames, tableToken}` trên QR bàn cũ; thẻ khách dùng được ở bàn mới.
- Món bị hủy/từ chối: `status` `CANCELLED|REJECTED`, `cancelReason` (nhãn), `billedQuantity`; món làm lại `lineType=REMAKE`.
- Nội dung chuyển khoản hóa đơn có phiên bản: `HD{id}V{n} THANH TOAN`; mã QR cũ sau khi lập lại không còn khớp hóa đơn mới.

Đặc tả đầy đủ: `restaurant-lavarel/docs/laravel_restful_api_specifications.md` Phần E; chính sách: `restaurant-lavarel/docs/operations/exception-policies.md`.
