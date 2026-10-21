# Mộc Dining — Frontend

React 19 + Vite 8 + Tailwind CSS 4. Backend Laravel nằm ở repo `restaurant-lavarel`.
Mục lục tài liệu: [`docs/README.md`](docs/README.md).

## Chạy dự án

```bash
# Backend (thư mục restaurant-lavarel)
php artisan migrate --seed        # lần đầu, hoặc migrate:fresh --seed để làm sạch dữ liệu dev
php artisan serve                 # http://127.0.0.1:8000

# Frontend (thư mục này)
npm install
npm run dev                       # http://localhost:5173
```

Tài khoản demo (mật khẩu `123`): `admin`, `staff1`, `kh1`, `kh2`.

## Demo Mộc Live Dining (QR tại bàn)

Luồng: **QR → Check-in → POS session → Order → KDS → Tracking → Service request → Invoice → Payment**.
Chi tiết kỹ thuật: [`docs/api/live-dining.md`](docs/api/live-dining.md). Cập nhật trực tiếp dùng **polling 2,5–8 giây** (không dùng WebSocket).

### 1. Chuẩn bị bàn demo (không cần sửa database)

```bash
cd ../restaurant-lavarel
php artisan dining:demo           # thêm --rotate để tạo mã QR mới
```

Lệnh chỉ chạy ngoài môi trường production và từ chối (không thay đổi gì) nếu Bàn L01 đang ghép phiên với bàn khác. Nó tạo bàn **Bàn L01** nếu chưa có, đóng hoặc hủy phiên cũ của riêng bàn này, đưa bàn về trạng thái sẵn sàng và in ra link dạng `http://localhost:5173/dine/{token}`. Dữ liệu các bàn khác không bị đụng tới.

### 2. Kịch bản trình diễn

| # | Laptop (POS, đăng nhập `staff1`) | Điện thoại / tab mobile (link QR) |
|---|---|---|
| 1 | Mở **Sơ đồ bàn** `/staff/floor` | |
| 2 | | Mở link QR: thấy thương hiệu Mộc, tên bàn, form nhận bàn |
| 3 | | Nhập tên, số khách → **Yêu cầu nhận bàn** (hiện “Đã báo nhân viên”) |
| 4 | Hàng đợi Live Dining hiện “Bàn L01 · xin nhận bàn”, thẻ bàn nhấp sáng → **NHẬN KHÁCH** → **Nhận khách & mở thực đơn** | Tự chuyển sang thực đơn, không cần tải lại |
| 5 | | Chọn món, mở chi tiết món, thêm ghi chú → **Xem giỏ & gửi bếp** → **Gửi bếp ngay** |
| 5b | Mã bàn 4 số hiện trên thẻ bàn và trong phiên POS | Bạn cùng bàn mở link QR → nhập **mã bàn** (hoặc quét QR trong mục **Mời bạn cùng bàn** trên máy người đầu tiên) |
| 6 | Mở **Bếp** `/staff/kitchen`, lọc **QR tại bàn**: thấy “QR Bàn L01” | Tab **Theo dõi**: món ở bước “Đã gửi bếp” |
| 7 | **NHẬN MÓN** → **BẮT ĐẦU NẤU** | Món chuyển “Đang chế biến”, đồng hồ chờ chạy |
| 8 | **BÁO SẴN SÀNG** → **ĐÃ PHỤC VỤ** | “Hoàn thành” → “Đã phục vụ” |
| 9 | | **Gọi phục vụ** → **Gọi nhân viên** |
| 10 | Sơ đồ bàn: **NHẬN** → **XONG** | “Nhân viên đang đến” → “Đã hoàn tất” |
| 11 | | Tab **Hóa đơn** → **Yêu cầu thanh toán** (chọn Chuyển khoản QR) |
| 12 | Yêu cầu thanh toán đứng đầu hàng đợi → bấm vào để mở phiên → **LẬP HÓA ĐƠN** | Hiện hóa đơn, VietQR, nội dung `HD{id} THANH TOAN`, “Đang chờ xác nhận thanh toán” |
| 13 | Chọn **Chuyển khoản**, nhập mã giao dịch → **XÁC NHẬN ĐÃ NHẬN CHUYỂN KHOẢN** | Tự đổi sang “Đã thanh toán” |
| 14 | **ĐÓNG PHIÊN & CHỜ VỆ SINH** | “Bữa ăn đã hoàn tất” + hóa đơn điện tử (in hoặc lưu PDF) |

Mã QR in được: biểu tượng QR trên thẻ bàn (POS) hoặc **Quản trị → Bàn** (admin có thể tạo mã mới; mã cũ ngừng hoạt động ngay).

### 3. Quét bằng điện thoại thật (cùng mạng Wi-Fi)

```bash
# Backend: lắng nghe trên mạng LAN, đặt FRONTEND_URL để link QR dùng IP máy
php artisan serve --host=0.0.0.0 --port=8000      # .env: FRONTEND_URL=http://192.168.1.20:5173
# Frontend: trỏ API về IP máy
VITE_API_BASE_URL=http://192.168.1.20:8000/api/v1 npm run dev -- --host
```

Sau đó chạy lại `php artisan dining:demo` để in link theo IP mới.

## Kiểm tra

```bash
npm run lint
npm run build
node scripts/e2e-api-flow.cjs          # E2E qua API (cần Laravel :8000)
node scripts/operations-smoke.cjs      # Browser smoke vận hành
node scripts/live-dining-e2e.cjs       # Browser E2E Live Dining: 2 context (POS + khách mobile)
node scripts/ui-audit.cjs out-desktop  # Audit 1440px; UI_AUDIT_MOBILE=1 cho 390px
```

Các script trình duyệt dùng `playwright` hoặc `playwright-core` (chưa có trong `package.json`): cài `npm i -D playwright-core` hoặc đặt `NODE_PATH` tới nơi đã cài, và Chrome tại `CHROME_PATH`.
