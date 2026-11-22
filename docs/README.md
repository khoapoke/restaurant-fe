# 📖 TÀI LIỆU HỆ THỐNG BACKEND (BACKEND SYSTEM DOCUMENTATION)
## Nhà Hàng & Đặt Món Trực Tuyến – Laravel 11 RESTful Architecture

> **Mục tiêu:** Cung cấp tài liệu nghiệp vụ, đặc tả kỹ thuật và chuẩn giao tiếp API hoàn chỉnh cho toàn bộ hệ thống.  
> **Kiến trúc:** Bounded Context Modular Monolith (`app/Modules/*`) theo chuẩn Pure RESTful Backend Service.

---

## 🗂️ 1. Bản Đồ Tài Liệu Theo Module Nghiệp Vụ (Module Specifications)

Mỗi module sở hữu một tài liệu đặc tả độc lập chuẩn Software Architect, tích hợp đầy đủ **Tổng quan, Thành phần kỹ thuật, Domain Rules và chi tiết từng Use Case / API**:

| STT | Module | Tệp đặc tả chi tiết | Số lượng API chính | Các tính năng & quy tắc kỹ thuật trọng tâm |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **`Auth`** | [auth.md](modules/auth.md) | 15 APIs | Đăng ký, Đăng nhập, Quên mật khẩu OTP, Hồ sơ cá nhân, Quản trị tài khoản, Auto-upgrade BCrypt, Rule `AUTH-LOCK`. |
| **2** | **`Menu`** | [menu.md](modules/menu.md) | 17 APIs *(+2 aliases)* | Danh mục & Món ăn, Redis Caching (`menu:categories:active`), Meilisearch Typo-Tolerance, Gợi ý món theo thời tiết + lọc dị ứng, Xóa mềm. |
| **3** | **`Cart`** | [cart.md](modules/cart.md) | 5 APIs *(+1 alias)* | Giỏ hàng 1-1 với tài khoản, Bảng pivot `MON_AN_GIO_HANG` không có ID tự tăng, kỹ thuật `attach`/`updateExistingPivot`. |
| **4** | **`Order`** | [order.md](modules/order.md) | 16 APIs *(+5 aliases)* | Checkout giỏ hàng (Redis Lock 10s), Snapshot đơn giá, Dine-in QR gọi món tại bàn, Màn hình Bếp (KDS) & tự đồng bộ FSM. |
| **5** | **`Reservation`** | [reservation.md](modules/reservation.md) | 19 APIs *(+1 alias)* | Tìm bàn trống, Đặt bàn trước (Redis Lock 5s), Xung đột khung giờ $\pm 119$ phút, Đặt cọc giờ cao điểm (15 phút), Quản lý bàn ăn & khung giờ. |
| **6** | **`Payment`** | [payment.md](modules/payment.md) | 10 APIs *(+1 alias)* | Thanh toán 1-1 đơn hàng, VietQR Napas 247, Xác nhận thủ công Staff/Admin, Mock thanh toán, Đối soát, Hoàn tiền, Callback Logs & Webhook. |
| **7** | **`Report`** | [report.md](modules/report.md) | 5 APIs | Dashboard tổng quan 4 nhóm chỉ số, Doanh thu thực thu, Thống kê đơn hàng, Món ăn bán chạy, Tỷ lệ lấp đầy bàn ăn. |
| **8** | **`Recommendation`** | [recommendation.md](modules/recommendation.md) | 3 APIs | Đồ thị tri thức Neo4j Bolt, Gợi ý món bán kèm (Market Basket Analysis), Gợi ý cá nhân hóa (Collaborative Filtering) + MySQL Fallback. *(Lưu ý: lọc dị ứng hiện áp dụng tại `Menu` Weather/Filter).* |
| **9** | **`Chat`** | [chat.md](modules/chat.md) | 13 APIs | Trợ lý ảo Google Gemini AI (`gemini-3.5-flash-lite`) kết hợp bàn giao Nhân viên CSKH trực tuyến (`BOT` → `WAITING_STAFF` → `STAFF_CONNECTED` → `CLOSED`). |

*Tổng cộng toàn hệ thống:* **9 Business Modules** với **103 API Endpoints chính** (102 client-facing + 1 webhook cổng thanh toán) và **11 route aliases** tương thích ngược.

---

## 📐 2. Các Tài Liệu Kiến Trúc & Giao Tiếp Bổ Trợ

| Tài liệu | Đường dẫn | Nội dung tóm tắt |
| :--- | :--- | :--- |
| **Quy Ước Hệ Thống Cốt Lõi** | [system_conventions.md](system_conventions.md) | Bảng tra cứu nhanh quy tắc bất biến: 11 Backed Enums, Redis keys, Soft Delete, Pivot rules, Polyglot Ports. |
| **Bản đồ Module & Tiến độ** | [modules.md](modules.md) | Bảng theo dõi tiến độ 9 Modules + Core và danh mục đầy đủ 103 API thực tế. |
| **Chuẩn Giao Tiếp API** | [api_protocol_specification.md](api_protocol_specification.md) | Quy ước Response Envelopes (`ApiResponse`), Mã lỗi HTTP chuẩn, Headers và mẫu Axios Interceptor. |
| **Từ Điển Thuật Ngữ & Eloquent Mapping** | `be_docs/glossary_and_laravel_eloquent_mapping.md` *(chỉ lưu ở repo BE)* | Ánh xạ 14 Models Eloquent với cơ sở dữ liệu MySQL `restaurant_laravel`, 11 Backed Enums và quan hệ quan trọng. |
| **Quyết Định Kiến Trúc (ADR)** | `be_docs/memory/architectural-decisions.md` *(chỉ lưu ở repo BE)* | Lưu trữ các quyết định kỹ thuật lớn (ADR-001 đến ADR-027) của dự án. |
| **Bài Học & Lỗi Môi Trường** | `be_docs/memory/lessons-learned.md` *(chỉ lưu ở repo BE)* | Tổng kết các sự cố, nguyên nhân và giải pháp kỹ thuật đã ghi nhận. |

---

## 🏛️ 3. Quy Ước Cấu Trúc Cho Mỗi Tệp Đặc Tả Module (`be_docs/modules/*.md`)

Mỗi tệp tài liệu module được xây dựng theo chuẩn cấu trúc 4 phần thống nhất:

1. **Tổng quan & Trách nhiệm:** Phạm vi nghiệp vụ của module, danh sách phân hệ khách hàng vs. quản trị.
2. **Thành phần kỹ thuật:** Danh sách Models, Services, Controllers, Form Requests, API Resources và Routes với đường dẫn file thực tế trong `app/Modules/<Module>/`.
3. **Domain Rules:** Toàn bộ các quy tắc bất biến của module (Redis Lock, Cache TTL, Soft Delete, State Transition matrix, Transaction isolation).
4. **Use Cases Chi Tiết (Mỗi API = 1 Use Case):**
   - **Mã Use Case & Tên tính năng:** (Ví dụ `ORD-01: Checkout Đặt hàng`)
   - **Actor & Phân quyền:** Vai trò được phép gọi (`CUSTOMER`, `ADMIN`, `STAFF`).
   - **Precondition:** Điều kiện tiên quyết trước khi request được xử lý.
   - **Validation Rules:** Bảng mô tả quy tắc kiểm thực dữ liệu (FormRequest).
   - **Luồng thực thi / Thuật toán (Execution Flow & Algorithms):** Các bước thực thi tuần tự từ Service đến Database (hoặc giải thuật tính toán chuyên sâu).
   - **Máy trạng thái / Biểu đồ luồng:** Biểu đồ Mermaid minh họa trực quan.
   - **Request / Response Envelopes mẫu:** JSON chuẩn Frontend có thể dùng mock data.
   - **Alternative Flow & Edge Cases:** Danh sách các mã lỗi HTTP tương ứng (400, 401, 403, 404, 409, 422, 429).

