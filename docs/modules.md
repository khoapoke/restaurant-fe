# 🧭 BẢN ĐỒ TIẾN ĐỘ & RADAR KIẾN TRÚC HỆ THỐNG (MODULE STATUS TRACKER)

> **Mục đích:** Theo dõi tiến độ triển khai API và vòng đời các Module nghiệp vụ trong hệ thống theo quy ước ký hiệu.  
> **Đặc tả chi tiết:** Toàn bộ Use Cases, Domain Rules, luồng thực thi và thuật toán chuyên sâu được lưu trữ tại [be_docs/modules/](modules/).
>
> **Quy ước Ký hiệu Trạng thái:**
> - `X`: Đã hoàn thành (Completed / Done)
> - `O`: Đang làm / Đang triển khai (In Progress)
> - ` ` *(để trống)*: Chưa làm (Pending / Backlog)

---

## 📊 1. Bảng Tổng Kết Trạng Thái Toàn Hệ Thống (Status Metrics Summary)

| STT | Nhóm Hạng Mục Theo Dõi | Đã Hoàn Thành (`X`) | Đang Làm (`O`) | Chưa Làm *(để trống)* | Tổng Cộng | Tỷ Lệ Hoàn Thành (%) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **1** | **API Endpoints Chính (Core Routes)** | **112** | **0** | **0** | **112** *(+11 aliases)* | **100%** |
| **2** | **Module Nghiệp vụ (Business Modules)** | **10** | **0** | **0** | **10** *(+ Core)* | **100%** |
| **3** | **Lộ trình Refactor Kiến Trúc Module** | **11** | **0** | **0** | **11** *(10 + Core)* | **100%** |

---

## 📋 2. Bảng Tổng Hợp Tiến Độ Các Module (Executive Summary)

| STT | Tên Module | Phạm vi nghiệp vụ | Số lượng API | Chi tiết đặc tả | Trạng thái Logic | Trạng thái Folder | Ghi chú kỹ thuật nổi bật |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **1** | **`Auth`** | Tài khoản, Hồ sơ, OTP, Phân quyền | 15 APIs | [auth.md](modules/auth.md) | `X` | `X` | Auto-Upgrade BCrypt, OTP Reset, Sanctum Token, RBAC |
| **2** | **`Menu`** | Danh mục, Món ăn, Gợi ý thời tiết | 17 APIs *(+2 aliases)* | [menu.md](modules/menu.md) | `X` | `X` | Redis Cache, Meilisearch Typo-Tolerance, OpenWeatherMap API |
| **3** | **`Cart`** | Giỏ hàng khách hàng | 5 APIs *(+1 alias)* | [cart.md](modules/cart.md) | `X` | `X` | Bảng liên kết Pivot nhiều-nhiều (`MON_AN_GIO_HANG`) |
| **4** | **`Order`** | Đặt hàng, Dine-in QR & KDS | 16 APIs *(+5 aliases)* | [order.md](modules/order.md) | `X` | `X` | Redis Lock 10s, Snapshot đơn giá, QR Dine-in, KDS FSM Sync |
| **5** | **`Reservation`** | Quản lý bàn, Khung giờ & Đặt bàn | 19 APIs *(+1 alias)* | [reservation.md](modules/reservation.md) | `X` | `X` | Redis Lock 5s, Trùng giờ $\pm 119'$, Đặt cọc giờ cao điểm |
| **6** | **`Payment`** | Thanh toán, VietQR, Đối soát, Webhook | 10 APIs *(+1 alias)* | [payment.md](modules/payment.md) | `X` | `X` | VietQR Napas 247, Xác nhận thủ công, Mock, Reconcile, Refund |
| **7** | **`Report`** | Báo cáo & Dashboard Admin | 5 APIs | [report.md](modules/report.md) | `X` | `X` | Tổng hợp Aggregates SQL hiệu năng cao (`DB::table`) |
| **8** | **`Recommendation`** | Gợi ý đồ thị Neo4j | 3 APIs | [recommendation.md](modules/recommendation.md) | `X` | `X` | Market Basket Analysis & Collaborative Filtering + MySQL Fallback |
| **9** | **`Chat`** | AI Chatbot Gemini & Live CSKH | 13 APIs | [chat.md](modules/chat.md) | `X` | `X` | Hybrid Gemini AI (`gemini-3.5-flash-lite`) + Staff Handoff |
| **10** | **`Review`** | Đánh giá & Nhận xét món ăn (MongoDB) | 9 APIs | [review.md](modules/review.md) | `X` | `X` | MongoDB `dish_reviews`, Aggregation 1–5 sao, Verified Purchase |
| **11** | **`Core` / `Shared`** | Enums, Middlewares, Exceptions | Hạ tầng | (Xem mục 4 bên dưới) | `X` | `X` | Unified JSON Envelope, 11 Backed Enums, MongoClientService |

*Tổng số API Endpoint thực tế theo `routes/api.php` và `app/Modules/*/Routes/api.php`:* **112 APIs chính** (111 client-facing + 1 webhook) và **11 route aliases** tương thích ngược *(chưa tính route test `GET /api/v1/user`)*.

---

## 🔍 3. Checklist Tiến Độ Từng Module Nghiệp Vụ

### 🛡️ MODULE 1: AUTH (Xác Thực, Tài Khoản & Phân Quyền — 15 APIs) – [`be_docs/modules/auth.md`](modules/auth.md)

| Mã API | Method | Endpoint URL | Tên tính năng | Trạng thái |
| :---: | :---: | :--- | :--- | :---: |
| `USR-01` | `POST` | `/api/v1/auth/register` | Đăng ký tài khoản khách hàng mới | `X` |
| `USR-02` | `POST` | `/api/v1/auth/login` | Đăng nhập hệ thống & Auto-upgrade BCrypt | `X` |
| `USR-03` | `POST` | `/api/v1/auth/logout` | Đăng xuất & Thu hồi Sanctum Token | `X` |
| `USR-04` | `GET` | `/api/v1/customer/profile` | Lấy thông tin hồ sơ cá nhân, sổ địa chỉ & dị ứng | `X` |
| `USR-05` | `PUT` | `/api/v1/customer/profile` | Cập nhật thông tin cá nhân, sổ địa chỉ & dị ứng | `X` |
| `USR-06` | `PUT` | `/api/v1/customer/password` | Đổi mật khẩu tài khoản | `X` |
| `USR-07` | `POST` | `/api/v1/auth/forgot-password` | Gửi mã OTP đặt lại mật khẩu về email | `X` |
| `USR-08` | `POST` | `/api/v1/auth/reset-password` | Xác thực OTP & Đặt lại mật khẩu mới | `X` |
| `ADM-01` | `GET` | `/api/v1/admin/accounts` | Danh sách tài khoản (phân trang, lọc role/status) | `X` |
| `ADM-02` | `GET` | `/api/v1/admin/accounts/{accountId}` | Chi tiết tài khoản & thông tin nhân viên/khách | `X` |
| `ADM-03` | `POST` | `/api/v1/admin/accounts/staff` | Tạo mới tài khoản Nhân viên phục vụ | `X` |
| `ADM-04` | `PUT` | `/api/v1/admin/accounts/{accountId}` | Cập nhật thông tin tài khoản | `X` |
| `ADM-05` | `PATCH`| `/api/v1/admin/accounts/{accountId}/status` | Đổi trạng thái `ACTIVE`/`LOCKED` & Thu hồi token | `X` |
| `ADM-06` | `PATCH`| `/api/v1/admin/accounts/{accountId}/lock` | Khóa tài khoản & Thu hồi toàn bộ token (Rule `AUTH-LOCK`) | `X` |
| `ADM-07` | `PATCH`| `/api/v1/admin/accounts/{accountId}/unlock` | Mở khóa tài khoản bị khóa | `X` |

---

### 🥗 MODULE 2: MENU (Thực Đơn, Danh Mục & Món Ăn — 17 APIs + 2 aliases) – [`be_docs/modules/menu.md`](modules/menu.md)

| Mã API | Method | Endpoint URL | Tên tính năng | Trạng thái |
| :---: | :---: | :--- | :--- | :---: |
| `MNU-01` | `GET` | `/api/v1/customer/categories` | Danh sách danh mục đang bán (Redis Cache 3600s) | `X` |
| `MNU-02` | `GET` | `/api/v1/customer/dishes` | Danh sách món ăn phân trang, tìm kiếm Meilisearch & lọc *(Alias `MNU-03`: `/customer/dishes/search`)* | `X` |
| `MNU-04` | `GET` | `/api/v1/customer/dishes/recommendations/weather` | Gợi ý món theo thời tiết thực tế & lọc dị ứng *(Alias FE: `/customer/recommendations/weather`)* | `X` |
| `MNU-07` | `GET` | `/api/v1/customer/dishes/{dishId}` | Chi tiết món ăn công khai | `X` |
| `MNU-08A` | `GET` | `/api/v1/admin/categories` | Danh sách toàn bộ danh mục cho Admin (kèm `dishesCount`) | `X` |
| `MNU-08B` | `GET` | `/api/v1/admin/categories/{categoryId}` | Chi tiết danh mục cho Admin | `X` |
| `MNU-09` | `POST` | `/api/v1/admin/categories` | Thêm mới danh mục món ăn | `X` |
| `MNU-10` | `PUT` | `/api/v1/admin/categories/{categoryId}` | Cập nhật thông tin danh mục | `X` |
| `MNU-11` | `PATCH`| `/api/v1/admin/categories/{categoryId}/visibility` | Ẩn / Hiện danh mục thực đơn | `X` |
| `MNU-12` | `DELETE`| `/api/v1/admin/categories/{categoryId}` | Xóa mềm danh mục (tự ẩn các món thuộc danh mục) | `X` |
| `MNU-08` | `GET` | `/api/v1/admin/dishes` | Danh sách toàn bộ món ăn cho Admin (phân trang, lọc) | `X` |
| `MNU-08C` | `GET` | `/api/v1/admin/dishes/{dishId}` | Chi tiết món ăn cho Admin | `X` |
| `MNU-13` | `POST` | `/api/v1/admin/dishes` | Thêm mới món ăn | `X` |
| `MNU-14` | `PUT` | `/api/v1/admin/dishes/{dishId}` | Cập nhật món ăn (giá, ảnh, mô tả, dị ứng, thời tiết) | `X` |
| `MNU-15` | `PATCH`| `/api/v1/admin/dishes/{dishId}/availability` | Đánh dấu còn bán / tạm hết món | `X` |
| `MNU-16` | `PATCH`| `/api/v1/admin/dishes/{dishId}/visibility` | Ẩn / Hiện món ăn trên thực đơn khách | `X` |
| `MNU-17` | `DELETE`| `/api/v1/admin/dishes/{dishId}` | Xóa mềm món ăn (giữ toàn vẹn đơn hàng cũ) | `X` |

---

### 🛒 MODULE 3: CART (Giỏ Hàng Mua Sắm — 5 APIs + 1 alias) – [`be_docs/modules/cart.md`](modules/cart.md)

| Mã API | Method | Endpoint URL | Tên tính năng | Trạng thái |
| :---: | :---: | :--- | :--- | :---: |
| `CRT-01` | `GET` | `/api/v1/customer/cart` | Lấy chi tiết giỏ hàng & tổng tiền tạm tính | `X` |
| `CRT-02` | `POST` | `/api/v1/customer/cart/items` | Thêm món vào giỏ hàng | `X` |
| `CRT-03` | `PUT` | `/api/v1/customer/cart/items/{dishId}` | Cập nhật số lượng món ăn trong giỏ | `X` |
| `CRT-04` | `DELETE`| `/api/v1/customer/cart/items/{dishId}` | Xóa một món ra khỏi giỏ hàng | `X` |
| `CRT-05` | `DELETE`| `/api/v1/customer/cart/clear` | Làm rỗng giỏ hàng *(Alias: `DELETE /api/v1/customer/cart`)* | `X` |

---

### 📦 MODULE 4: ORDER (Đơn Hàng, Dine-in QR & Bếp KDS — 16 APIs + 5 aliases) – [`be_docs/modules/order.md`](modules/order.md)

| Mã API | Method | Endpoint URL | Tên tính năng | Trạng thái |
| :---: | :---: | :--- | :--- | :---: |
| `ORD-01` | `POST` | `/api/v1/customer/orders/checkout` | Đặt hàng từ giỏ (Khóa Redis 10s chống Race Condition) | `X` |
| `ORD-04` | `GET` | `/api/v1/customer/orders` | Lịch sử đơn hàng của khách (phân trang, lọc status) | `X` |
| `ORD-05` | `GET` | `/api/v1/customer/orders/{orderId}` | Chi tiết đơn hàng của khách hàng | `X` |
| `ORD-06` | `POST\|PUT` | `/api/v1/customer/orders/{orderId}/cancel` | Khách tự hủy đơn hàng (khi đơn đang `PENDING_CONFIRMATION`) | `X` |
| `ORD-07` | `GET` | `/api/v1/admin/orders` | Danh sách đơn hàng toàn hệ thống (`ADMIN,STAFF`) | `X` |
| `ORD-07B` | `GET` | `/api/v1/admin/orders/{orderId}` | Chi tiết đơn hàng cho Quản trị viên/Nhân viên | `X` |
| `ORD-08` | `PATCH`| `/api/v1/admin/orders/{orderId}/status` | Cập nhật trạng thái quy trình đơn hàng theo FSM | `X` |
| `ORD-12` | `POST\|PUT` | `/api/v1/admin/orders/{orderId}/cancel` | Admin/Staff hủy đơn hàng kèm lý do | `X` |
| `ORD-13` | `POST` | `/api/v1/admin/orders/{orderId}/confirm-payment` | Xác nhận thu tiền đơn hàng thủ công tại quầy | `X` |
| `ORD-DINE-01` | `POST` | `/api/v1/admin/orders/dine-in/open-table` | Phục vụ mở bàn ăn & tạo mã QR token | `X` |
| `ORD-DINE-02` | `POST` | `/api/v1/dine-in/{token}/items` | Khách quét QR gọi món kèm ghi chú *(FE aliases: `POST /customer/orders/dine-in/{orderId}/items`, `POST /orders/dine-in/{orderId}/items`)* | `X` |
| `ORD-DINE-03` | `GET` | `/api/v1/dine-in/{token}/tracking` | Khách theo dõi tiến độ món thời gian thực *(FE aliases: `GET /customer/orders/dine-in/{orderId}`, `GET /orders/dine-in/{orderId}`)* | `X` |
| `KTC-01` | `GET` | `/api/v1/kitchen/orders` | Màn hình bếp KDS xem danh sách đơn đang nấu | `X` |
| `KTC-02` | `PUT\|PATCH` | `/api/v1/kitchen/orders/{orderId}/items/{dishId}/status` | Bếp cập nhật trạng thái món lẻ & tự sync đơn *(FE alias: `/kitchen/orders/{orderId}/dishes/{dishId}/status`)* | `X` |
| `KTC-03` | `PUT\|PATCH` | `/api/v1/kitchen/orders/{orderId}/items/{dishId}/serve` | Phục vụ đánh dấu đã dọn món lên bàn (`SERVED`) | `X` |
| `KTC-04` | `PUT\|PATCH` | `/api/v1/kitchen/orders/{orderId}/status` | Bếp cập nhật nhanh trạng thái tổng cả đơn hàng | `X` |

---

### 🪑 MODULE 5: RESERVATION (Bàn Ăn, Khung Giờ & Đặt Bàn — 19 APIs + 1 alias) – [`be_docs/modules/reservation.md`](modules/reservation.md)

| Mã API | Method | Endpoint URL | Tên tính năng | Trạng thái |
| :---: | :---: | :--- | :--- | :---: |
| `BKG-01` | `GET` | `/api/v1/customer/tables/available` | Tìm bàn trống theo ngày, giờ và số người *(Alias: `/customer/reservations/available-tables`)* | `X` |
| `BKG-02` | `POST` | `/api/v1/customer/reservations` | Đặt bàn mới (Redis Lock 5s + quy tắc cọc giờ cao điểm) | `X` |
| `BKG-03` | `PUT` | `/api/v1/customer/reservations/{reservationId}` | Cập nhật lịch hẹn đặt bàn (trước $\ge 60$ phút) | `X` |
| `BKG-04` | `POST\|PUT` | `/api/v1/customer/reservations/{reservationId}/cancel` | Khách hàng hủy lượt đặt bàn (trước $\ge 60$ phút) | `X` |
| `BKG-05` | `GET` | `/api/v1/customer/reservations` | Lịch sử đặt bàn của khách hàng | `X` |
| `BKG-06` | `GET` | `/api/v1/customer/reservations/{reservationId}` | Chi tiết lượt đặt bàn của khách | `X` |
| `BKG-13` | `POST` | `/api/v1/customer/reservations/{reservationId}/mock-deposit` | Giả lập thanh toán tiền cọc bàn (FE demo/test) | `X` |
| `BKG-07` | `GET` | `/api/v1/admin/tables` | Danh sách toàn bộ bàn ăn kèm trạng thái & đơn đang mở | `X` |
| `BKG-07B` | `POST` | `/api/v1/admin/tables` | Tạo bàn ăn mới (`ADMIN,STAFF`) | `X` |
| `BKG-07C` | `GET` | `/api/v1/admin/tables/{tableId}` | Chi tiết một bàn ăn | `X` |
| `BKG-07D` | `PUT` | `/api/v1/admin/tables/{tableId}` | Cập nhật thông tin bàn ăn (tên, sức chứa, vị trí, trạng thái) | `X` |
| `BKG-08` | `PATCH`| `/api/v1/admin/tables/{tableId}/status` | Đổi trạng thái bàn ăn (`AVAILABLE`/`RESERVED`/`OCCUPIED`/`MAINTENANCE`) | `X` |
| `BKG-08B` | `DELETE`| `/api/v1/admin/tables/{tableId}` | Xóa bàn ăn (chặn xóa nếu còn lượt đặt active) | `X` |
| `BKG-09` | `GET` | `/api/v1/admin/reservations` | Danh sách lượt đặt bàn toàn hệ thống (lọc ngày/status/search) | `X` |
| `BKG-10` | `GET` | `/api/v1/admin/reservations/{reservationId}` | Chi tiết lượt đặt bàn cho Admin/Lễ tân | `X` |
| `BKG-11` | `PATCH`| `/api/v1/admin/reservations/{reservationId}/status` | Duyệt / Vào bàn / Hoàn tất / Từ chối / Hủy & Sync bàn | `X` |
| `BKG-12` | `GET` | `/api/v1/admin/reservations/time-slots` | Lấy cấu hình khung giờ phục vụ nhà hàng | `X` |
| `BKG-12B` | `PUT` | `/api/v1/admin/reservations/time-slots` | Cập nhật cấu hình khung giờ đặt bàn | `X` |
| `BKG-14` | `POST` | `/api/v1/admin/reservations/{reservationId}/confirm-deposit` | Nhân viên/Admin xác nhận đã nhận cọc bàn thủ công | `X` |

---

### 💳 MODULE 6: PAYMENT (Thanh Toán & Đối Soát Giao Dịch — 10 APIs + 1 alias) – [`be_docs/modules/payment.md`](modules/payment.md)

| Mã API | Method | Endpoint URL | Tên tính năng | Trạng thái |
| :---: | :---: | :--- | :--- | :---: |
| `PAY-01` | `POST` | `/api/v1/customer/payments/{orderId}/qr` | Sinh mã VietQR động chuẩn Napas 247 (`DH{orderId} THANH TOAN`) | `X` |
| `PAY-02` | `GET` | `/api/v1/customer/payments/{orderId}/status` | Kiểm tra trạng thái thanh toán đơn hàng (`isPaid`) | `X` |
| `PAY-03` | `POST` | `/api/v1/customer/payments/{orderId}/retry` | Thử lại / Gia hạn thanh toán QR thêm 15 phút | `X` |
| `PAY-04` | `GET` | `/api/v1/admin/payments` | Danh sách lịch sử giao dịch thanh toán (`ADMIN,STAFF`) | `X` |
| `PAY-05` | `POST` | `/api/v1/admin/payments/reconcile` | Đối soát số tiền thanh toán với tổng tiền đơn hàng | `X` |
| `PAY-06` | `POST` | `/api/v1/admin/payments/{paymentId}/refund` | Hoàn tiền giao dịch `PAID` & Tự hủy đơn hàng | `X` |
| `PAY-07` | `GET` | `/api/v1/admin/payments/callback-logs` | Tra cứu nhật ký callback/xác nhận thanh toán | `X` |
| `PAY-08` | `POST\|PATCH` | `/api/v1/admin/payments/{paymentId}/confirm` | Nhân viên/Admin xác nhận thanh toán thủ công & duyệt đơn | `X` |
| `PAY-09` | `POST` | `/api/v1/customer/payments/{orderId}/mock-payment` | Khách giả lập thanh toán QR thành công (FE demo/test) | `X` |
| `PAY-10` | `POST` | `/api/v1/webhooks/payment-callback` | Webhook nhận biến động số dư VietQR *(Alias: `/customer/payments/webhook`)* | `X` |

---

### 📈 MODULE 7: REPORT (Báo Cáo Thống Kê & Phân Tích — 5 APIs) – [`be_docs/modules/report.md`](modules/report.md)

| Mã API | Method | Endpoint URL | Tên tính năng | Trạng thái |
| :---: | :---: | :--- | :--- | :---: |
| `RPT-00` | `GET` | `/api/v1/admin/reports/dashboard` | Dashboard tổng hợp toàn bộ 4 nhóm chỉ số | `X` |
| `RPT-01` | `GET` | `/api/v1/admin/reports/revenue` | Báo cáo doanh thu thực thu theo chuỗi ngày | `X` |
| `RPT-02` | `GET` | `/api/v1/admin/reports/orders` | Báo cáo thống kê đơn hàng & tỷ lệ thành công | `X` |
| `RPT-03` | `GET` | `/api/v1/admin/reports/top-dishes` | Báo cáo danh sách món ăn bán chạy nhất | `X` |
| `RPT-04` | `GET` | `/api/v1/admin/reports/reservations` | Báo cáo số lượt đặt bàn & tỷ lệ lấp đầy bàn | `X` |

---

### 🕸️ MODULE 8: RECOMMENDATION (Động Cơ Gợi Ý Đồ Thị Neo4j — 3 APIs) – [`be_docs/modules/recommendation.md`](modules/recommendation.md)

| Mã API | Method | Endpoint URL | Tên tính năng | Trạng thái |
| :---: | :---: | :--- | :--- | :---: |
| `GRA-01` | `GET` | `/api/v1/customer/dishes/{dishId}/recommendations/graph` | Gợi ý món bán kèm (Cross-sell / Market Basket Analysis) | `X` |
| `GRA-02` | `GET` | `/api/v1/customer/recommendations/personalized` | Gợi ý cá nhân hóa theo lịch sử đặt hàng (Collaborative Filtering) | `X` |
| `GRA-03` | `GET` | `/api/v1/customer/recommendations/graph-stats` | Thống kê số lượng Nodes & Relationships trên đồ thị Neo4j | `X` |

---

### 💬 MODULE 9: CHAT (Trợ Lý Ảo Chatbot AI & Hỗ Trợ Khách Hàng — 13 APIs) – [`be_docs/modules/chat.md`](modules/chat.md)

| Mã API | Method | Endpoint URL | Tên tính năng | Trạng thái |
| :---: | :---: | :--- | :--- | :---: |
| `CHT-01` | `GET` | `/api/v1/customer/chat/sessions/active` | Lấy phiên chat đang mở gần nhất của khách (kèm `messages`) | `X` |
| `CHT-02` | `POST` | `/api/v1/customer/chat/sessions` | Khởi tạo phiên chat mới kèm lời chào cố định từ Bot | `X` |
| `CHT-03` | `POST` | `/api/v1/customer/chat/sessions/{id}/messages` | Khách gửi tin nhắn (tự động kích hoạt AI Bot nếu ở mode `BOT`) | `X` |
| `CHT-04` | `POST` | `/api/v1/customer/chat/sessions/{id}/request-staff` | Yêu cầu chuyển giao sang nhân viên hỗ trợ (`WAITING_STAFF`) | `X` |
| `CHT-05` | `POST` | `/api/v1/customer/chat/sessions/{id}/close` | Khách hàng tự kết thúc & đóng phiên chat | `X` |
| `CHT-06` | `GET` | `/api/v1/customer/chat/sessions` | Danh sách lịch sử các phiên chat của khách hàng | `X` |
| `CHT-07` | `GET` | `/api/v1/customer/chat/sessions/{id}` | Chi tiết một phiên chat & toàn bộ lịch sử tin nhắn | `X` |
| `STAFF-01` | `GET` | `/api/v1/staff/chat/sessions` | Danh sách phiên chat đa năng cho Staff/Admin (lọc `status`, `assigned_to_me`, `search`) | `X` |
| `STAFF-02` | `GET` | `/api/v1/staff/chat/sessions/{id}` | Xem chi tiết phiên chat & toàn bộ tin nhắn dành cho Staff/Admin | `X` |
| `STAFF-03` | `POST` | `/api/v1/staff/chat/sessions/{id}/assign` | Nhân viên tiếp nhận phiên chat (`STAFF_CONNECTED`) | `X` |
| `STAFF-04` | `POST` | `/api/v1/staff/chat/sessions/{id}/messages` | Nhân viên gửi tin nhắn trực tiếp cho khách hàng | `X` |
| `STAFF-05` | `POST` | `/api/v1/staff/chat/sessions/{id}/close` | Nhân viên kết thúc và đóng phiên hỗ trợ | `X` |
| `STAFF-06` | `GET` | `/api/v1/staff/chat/pending` | Danh sách phiên chat đang ở hàng đợi `WAITING_STAFF` | `X` |

---

### ⭐ MODULE 10: REVIEW (Đánh Giá & Nhận Xét Món Ăn — MongoDB — 9 APIs) – [`be_docs/modules/review.md`](modules/review.md)

| Mã API | Method | Endpoint URL | Tên tính năng | Trạng thái |
| :---: | :---: | :--- | :--- | :---: |
| `REV-01` | `GET` | `/api/v1/customer/dishes/{dishId}/reviews` | Danh sách đánh giá `VISIBLE` + `summary` điểm sao (Aggregation) | `X` |
| `REV-02` | `POST` | `/api/v1/customer/dishes/{dishId}/reviews` | Khách gửi đánh giá mới (tự gắn `isVerifiedPurchase`) | `X` |
| `REV-03` | `GET` | `/api/v1/customer/reviews/my` | Lịch sử đánh giá của chính khách hàng | `X` |
| `REV-04` | `PUT` | `/api/v1/customer/reviews/{reviewId}` | Khách tự sửa đánh giá của mình (chống IDOR) | `X` |
| `REV-05` | `DELETE` | `/api/v1/customer/reviews/{reviewId}` | Khách tự xóa đánh giá của mình (chống IDOR) | `X` |
| `REV-06` | `GET` | `/api/v1/admin/reviews` | Danh sách đánh giá quản trị kèm bộ lọc & `stats` | `X` |
| `REV-07` | `POST` | `/api/v1/admin/reviews/{reviewId}/reply` | Admin/Staff phản hồi đánh giá khách (`adminReply`) | `X` |
| `REV-08` | `PATCH` | `/api/v1/admin/reviews/{reviewId}/visibility` | Ẩn / Hiện đánh giá (`VISIBLE` ↔ `HIDDEN`) | `X` |
| `REV-09` | `DELETE` | `/api/v1/admin/reviews/{reviewId}` | Admin/Staff xóa vĩnh viễn đánh giá vi phạm | `X` |

---

## 🧩 4. MODULE CORE / SHARED (Nền Tảng Dùng Chung Toàn Hệ Thống)

- **Vị trí thư mục:** `app/Modules/Core/`
- **Trách nhiệm:** Chứa toàn bộ các thành phần hạ tầng chung mà các module khác phụ thuộc vào:
  - **Base Controller:** `BaseController` (kế thừa `Controller`, tích hợp `ApiResponse`).
  - **Trait:** `ApiResponse` (chuẩn hóa Envelope phản hồi JSON: `success`, `code`, `message`, `data`/`errors`).
  - **11 Backed Enums:** `RoleType`, `AccountStatus`, `OrderStatus`, `OrderItemStatus`, `OrderFulfillmentType`, `TableStatus`, `ReservationStatus`, `PaymentMethod`, `PaymentStatus`, `ChatSessionStatus`, `ChatSenderType`.
  - **Middlewares:** `ForceJsonResponse`, `CheckAccountActive`, `CheckRole`.
  - **Exceptions:** Global Exception Shielding trong `bootstrap/app.php`.
  - **Database Migrations & Seeders:** 14 bảng nghiệp vụ MySQL (`restaurant_laravel`) + `personal_access_tokens` + `password_reset_tokens` và `RestaurantSeeder` tại `database/`.
- **Trạng thái Logic:** `X`
- **Trạng thái Refactor Folder:** `X`
