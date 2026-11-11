# Restaurant FE — Core Agent Operating Constitution

> ⚠️ **FILE NÀY ĐƯỢC LOAD TỰ ĐỘNG Ở ĐẦU MỖI PHIÊN HỘI THOẠI.**
> Agent BẮT BUỘC phải đọc và tuân thủ nghiêm ngặt 100% các điều khoản dưới đây. Không có ngoại lệ.

---

## 🏠 Project Overview
- **Dự án:** Frontend Hệ thống Quản lý Nhà hàng Trực tuyến (Lumière Restaurant)
- **Tech Stack:** React 19 + Vite 8 (JSX, Tailwind CSS v4, Lucide React)
- **Backend:** Laravel (Sanctum + SQL Server, RESTful API `/api/v1`)
- **2 Phân hệ:**
  - **Customer:** Menu, Giỏ hàng, Đơn hàng, Thanh toán QR, Đặt bàn trực tuyến, Hồ sơ & dị ứng.
  - **Admin:** Báo cáo Dashboard, Món ăn & Danh mục, Đơn hàng & Thanh toán, Bàn ăn & Đặt bàn, Quản lý tài khoản.

---

## 🛑 BỘ NGUYÊN TẮC BẮT BUỘC (CORE OPERATING RULES)

### 1. NGUYÊN TẮC XÁC NHẬN TRƯỚC KHI CODE (CONFIRMATION GATE)
> **TUYỆT ĐỐI KHÔNG TỰ Ý CHẠY CODE / SỬA FILE TRƯỚC KHI ĐƯỢC DUYỆT.**
- Khi nhận bất kỳ task nào (tạo mới, nâng cấp, sửa bug, tối ưu): Agent **PHẢI DỪNG LẠI Ở BƯỚC PHÂN TÍCH**.
- Agent chỉ được phép bắt tay vào code khi người dùng đã phản hồi đồng ý bằng các lệnh xác nhận rõ ràng như: **"OK"**, **"Duyệt"**, **"Làm đi"**, **"Thực hiện cho mình"**, hoặc chọn một phương án cụ thể (A, B, C).
- **Nghiêm cấm đoán mò (Strict Anti-Guessing):** Tuyệt đối không tự bịa API endpoint, không đoán mò cấu trúc JSON request/response, không đoán mò Enum hoặc logic nghiệp vụ. Nếu thiếu tài liệu hoặc thông tin mơ hồ, BẮT BUỘC PHẢI HỎI.

---

### 2. QUY CHUẨN TRÌNH BÀY PHÂN TÍCH (BẮT BUỘC 4 PHẦN)
Trước khi xin xác nhận từ người dùng, Agent phải cung cấp báo cáo phân tích ngắn gọn, mạch lạc theo đúng 4 mục sau:

#### 📌 Phần 1: Danh sách các file tác động cụ thể
- 🟢 **Tạo mới:** Đường dẫn các file sẽ tạo mới (`[Path]`) và vai trò của file.
- 🟡 **Chỉnh sửa:** Đường dẫn các file sẽ can thiệp (`[Path]`) và mục đích chỉnh sửa cụ thể.
- 🔴 **Xóa (nếu có):** File cần xóa hoặc thay thế và lý do.
- 🔗 **Ảnh hưởng liên đới:** Các file hoặc màn hình khác có thể bị tác động gián tiếp.

#### 📌 Phần 2: Phân tích rủi ro khi thực hiện (Risk Analysis)
- **Rủi ro logic & nghiệp vụ:** Khả năng xung đột trạng thái, sai lệch luồng thanh toán, đặt bàn trùng, quyền hạn tài khoản.
- **Rủi ro hồi quy (Regression / Breaking changes):** Khả năng ảnh hưởng đến các màn hình hoặc component đang chạy ổn định.
- **Rủi ro hiệu năng:** Nguy cơ re-render vô tận, rò rỉ bộ nhớ (leak timer/interval/subscription), bundle size phình to.
- **Rủi ro API/Backend:** Lệch pha giữa snake_case và camelCase, phân trang lồng `data.data.data`, thiếu fallback khi BE lỗi.

#### 📌 Phần 3: Các phương án giải quyết & Đánh giá Ưu / Nhược điểm
- Đưa ra tối thiểu **2 đến 3 phương án (Phương án A, B, C)**.
- Với mỗi phương án, phân tích rõ ràng:
  - **Ưu điểm (Pros):** Tốc độ, độ sạch, khả năng mở rộng, độ mượt.
  - **Nhược điểm (Cons):** Độ phức tạp, thời gian làm, tác động phụ.
- **Lời khuyên & Đề xuất của Senior Architect:** Chỉ rõ phương án tối ưu nhất cho dự án và lý do vì sao.

#### 📌 Phần 4: Câu hỏi chốt & Chờ xác nhận
- Liệt kê các câu hỏi ngắn gọn (đánh số 1, 2, 3...) về các điểm cần người dùng quyết định.
- **Dừng turn lại và chờ người dùng phản hồi xác nhận.** Không gọi tool viết file/sửa file trong turn này.

---

### 3. QUY TRÌNH THỰC THI (SAU KHI ĐƯỢC DUYỆT)
Chỉ khi người dùng đã trả lời và bấm OK / Xác nhận:
1. **Kiểm tra kỹ trước khi chạm file:** Đọc toàn bộ file cần sửa để nắm ngữ cảnh, tránh overwrite làm mất code cũ.
2. **Tuân thủ quy chuẩn kỹ thuật:**
   - **Mỗi component < 200 dòng:** Tách sub-components, modal, form, card riêng biệt.
   - **4 trạng thái UI bắt buộc:** `Loading`, `Error` (kèm nút Thử lại), `Empty` (kèm CTA), `Data`.
   - **Enum & Status IN HOA tiếng Anh:** Tham chiếu [`docs/api/enums.md`](./docs/api/enums.md).
   - **Tối ưu hiệu năng:** Bắt buộc dùng `useMemo`, `useCallback` cho Context values và callbacks; dùng `React.lazy()` cho các route trang.
   - **An toàn dữ liệu (Defensive programming):** Luôn có fallback cho cả `camelCase` và `snake_case`, bóc tách an toàn `res?.data?.data || res?.data`.
3. **Biên dịch kiểm tra:** Chạy `npm run build` để đảm bảo 0 lỗi cú pháp trước khi bàn giao.
4. **Không chạy dev server nền:** Tắt ngay các process test để cổng 5173 luôn sẵn sàng cho người dùng.

---

## 📂 Danh mục tài liệu tham chiếu

### Kiến trúc & Chuẩn code:
- **Coding Standards:** `docs/architecture/fe-standards.md`
- **Project Context & Sơ đồ quan hệ:** `docs/architecture/project-context.md`
- **Kế hoạch triển khai Admin:** `docs/architecture/admin-roadmap.md`
- **Quy ước API Laravel:** `docs/api/_conventions.md`
- **Danh mục Enum/Status:** `docs/api/enums.md`

### Đặc tả API theo phân hệ:
| Nghiệp vụ | File đặc tả API |
|---|---|
| Auth (Đăng nhập, đăng ký, phiên) | `docs/api/auth.md` |
| Hồ sơ khách, địa chỉ, sở thích dị ứng | `docs/api/customer-profile.md` |
| Menu, tìm kiếm, bộ lọc, gợi ý thời tiết | `docs/api/customer-menu.md` |
| Giỏ hàng khách hàng | `docs/api/customer-cart.md` |
| Đơn hàng, checkout, thanh toán QR | `docs/api/customer-order.md` |
| Đặt bàn trực tuyến (Khách hàng) | `docs/api/customer-reservation.md` |
| Quản lý tài khoản (Admin) | `docs/api/admin-account.md` |
| Quản lý danh mục & món ăn (Admin) | `docs/api/admin-dish.md` |
| Quản lý đơn hàng & thanh toán (Admin) | `docs/api/admin-order.md` |
| Quản lý bàn ăn, đặt bàn & báo cáo (Admin) | `docs/api/admin-table-report.md` |

---

## 🎯 Cam kết chất lượng
Mọi thay đổi trong dự án này phải đảm bảo:
1. **Minh bạch:** Người dùng luôn biết rõ chuyện gì sắp xảy ra trước khi xảy ra.
2. **Kiến trúc bền vững:** Không code ẩu, không vá lỗi tạm bợ làm hỏng các phần khác.
3. **Trải nghiệm mượt mà:** Tối ưu hóa bundle, không gây lag, không gây giật re-render.
