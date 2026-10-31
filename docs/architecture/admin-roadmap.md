# 🛡️ Kế hoạch & Lộ trình Triển khai Phân hệ Admin (Admin Roadmap)

> **Tài liệu lưu trữ Context chuẩn cho AI Agent & Developer**  
> Dự án: Hệ thống Quản lý Nhà hàng Trực tuyến Lumière  
> Tech Stack: Vite 8 + React 19 (JSX) + Tailwind CSS v4 + React Router v7 + Axios Sanctum

---

## 📌 1. Tổng quan & Cấu trúc Thư mục Chuẩn

Toàn bộ mã nguồn phân hệ Admin được đặt trong thư mục `src/features/admin/`, tuân thủ nguyên tắc kiến trúc Module-based và Clean Code (< 200 dòng/component).

```
src/features/admin/
├── layout/
│   ├── components/
│   │   ├── AdminSidebar.jsx         # Thanh menu điều hướng bên trái (hỗ trợ thu gọn)
│   │   ├── AdminHeader.jsx          # Header hiển thị thông tin Admin, nút Xem website, Logout
│   │   └── AdminBreadcrumb.jsx      # Đường dẫn vị trí hiện tại
│   ├── layouts/
│   │   └── AdminLayout.jsx          # Shell bọc ngoài với Sidebar + Topbar + Outlet
│   └── routes/
│       └── AdminRoute.jsx           # Guard bảo vệ tuyến đường (chỉ cho phép role ADMIN)
│
├── dashboard/                       # [GIAI ĐOẠN 1] Dashboard & Báo cáo thống kê
│   ├── components/
│   │   ├── MetricCard.jsx           # Thẻ chỉ số tổng quan (Doanh thu, Đơn hàng, v.v.)
│   │   ├── RevenueChart.jsx         # Biểu đồ cột doanh thu theo ngày
│   │   ├── TopDishesTable.jsx       # Bảng Top món ăn bán chạy
│   │   └── DashboardFilterBar.jsx   # Bộ chọn khoảng ngày (Hôm nay, 7 ngày, Tháng này, Custom)
│   ├── pages/
│   │   └── AdminDashboardPage.jsx
│   └── services/
│       └── reportService.js         # Gọi API GET /admin/reports/dashboard
│
├── dish/                            # [GIAI ĐOẠN 2] Quản lý Danh mục & Món ăn
│   ├── components/
│   │   ├── DishTable.jsx            # Bảng danh sách món ăn (có toggle còn bán / hiển thị)
│   │   ├── DishFilterBar.jsx        # Lọc theo danh mục, trạng thái còn bán, từ khóa
│   │   ├── DishFormModal.jsx        # Modal Thêm / Chỉnh sửa món ăn (nguyên liệu, dị ứng, tag thời tiết)
│   │   ├── DeleteDishModal.jsx      # Modal xác nhận xóa mềm món ăn
│   │   ├── CategoryTable.jsx        # Bảng danh sách danh mục
│   │   └── CategoryFormModal.jsx    # Modal Thêm / Chỉnh sửa danh mục
│   ├── pages/
│   │   ├── AdminDishPage.jsx
│   │   └── AdminCategoryPage.jsx
│   └── services/
│       └── adminDishService.js      # APIs CRUD categories & dishes
│
├── order/                           # [GIAI ĐOẠN 3] Quản lý Đơn hàng & Thanh toán
│   ├── components/
│   │   ├── AdminOrderTable.jsx      # Bảng đơn hàng có tabs trạng thái
│   │   ├── AdminOrderDetailModal.jsx# Xem chi tiết đơn hàng (món ăn, tiền, khách, địa chỉ)
│   │   ├── ChangeOrderStatusModal.jsx # Modal chuyển trạng thái theo luồng hợp lệ
│   │   ├── AdminCancelOrderModal.jsx# Hủy đơn hàng kèm lý do
│   │   ├── PaymentTable.jsx         # Tra cứu giao dịch thanh toán
│   │   └── RefundModal.jsx          # Ghi nhận hoàn tiền
│   ├── pages/
│   │   ├── AdminOrdersPage.jsx
│   │   └── AdminPaymentsPage.jsx
│   └── services/
│       └── adminOrderService.js     # APIs Orders & Payments
│
├── table/                           # [GIAI ĐOẠN 4] Bàn ăn & Điều phối Đặt bàn
│   ├── components/
│   │   ├── TableGrid.jsx            # Sơ đồ / Danh sách bàn ăn với mã màu trạng thái
│   │   ├── TableFormModal.jsx       # Modal Thêm / Sửa bàn & sức chứa
│   │   ├── ReservationTable.jsx     # Bảng danh sách khách đặt bàn
│   │   └── ReservationActionModal.jsx # Duyệt đặt bàn (gán bàn) / Từ chối kèm lý do
│   ├── pages/
│   │   ├── AdminTablesPage.jsx
│   │   └── AdminReservationsPage.jsx
│   └── services/
│       └── adminTableService.js     # APIs Tables & Reservations
│
└── account/                         # [GIAI ĐOẠN 5] Quản lý Tài khoản Người dùng
    ├── components/
    │   ├── AccountTable.jsx         # Bảng người dùng (Admin, Khách hàng)
    │   ├── AccountFilterBar.jsx     # Lọc theo trạng thái ACTIVE / LOCKED & từ khóa
    │   └── ToggleLockAccountModal.jsx # Modal xác nhận Khóa / Mở khóa tài khoản
    ├── pages/
    │   └── AdminAccountsPage.jsx
    └── services/
        └── adminAccountService.js   # APIs Accounts
```

---

## 🎯 2. Chi tiết 5 Giai đoạn Triển khai (Milestones)

### 🔹 Giai đoạn 1: Nền tảng Layout Quản trị & Dashboard Thống kê
* **Mục tiêu:** Xây dựng khung giao diện Admin chuyên nghiệp (Shell layout), cơ chế bảo vệ quyền truy cập Route Guard, và trang Dashboard báo cáo tổng quan hiệu năng nhà hàng.
* **Tài liệu API:** [`docs/api/admin-table-report.md`](../api/admin-table-report.md) (`RPT-01` → `RPT-04`).
* **Endpoints chính:**
  * `GET /api/v1/admin/reports/dashboard?fromDate={YYYY-MM-DD}&toDate={YYYY-MM-DD}`
* **Dữ liệu hiển thị:**
  * Doanh thu tổng đã thanh toán (`totalPaidRevenue`) & biểu đồ chuỗi ngày (`dailySeries`).
  * Chỉ số đơn hàng: Tổng đơn (`totalCount`), đơn hoàn thành (`completedCount`), đơn hủy (`cancelledCount`), tỷ lệ thành công (`completionRate`).
  * Top món ăn bán chạy nhất: Tên món, số lượng bán (`totalSold`), doanh thu tạo ra (`revenue`).
  * Chỉ số đặt bàn: Tổng lượt đặt (`totalBookings`), đã duyệt (`confirmedBookings`), tỷ lệ lấp đầy bàn (`occupancyRatePercent`).
* **Route bảo vệ:** `AdminRoute` chỉ cho phép người dùng có `user?.role === 'ADMIN'`.

---

### 🔹 Giai đoạn 2: Quản lý Danh mục & Món ăn (Catalog Management)
* **Mục tiêu:** Cho phép Admin toàn quyền quản lý thực đơn (CRUD danh mục, món ăn, gắn thẻ dị ứng, dinh dưỡng, gợi ý thời tiết).
* **Tài liệu API:** [`docs/api/admin-dish.md`](../api/admin-dish.md) (`MNU-09` → `MNU-17`).
* **Endpoints Danh mục:**
  * `POST /api/v1/admin/categories` — Tạo danh mục mới
  * `PUT /api/v1/admin/categories/{categoryId}` — Sửa thông tin danh mục
  * `PATCH /api/v1/admin/categories/{categoryId}/visibility` — Bật/Tắt ẩn hiện
  * `DELETE /api/v1/admin/categories/{categoryId}` — Xóa mềm danh mục
* **Endpoints Món ăn:**
  * `POST /api/v1/admin/dishes` — Thêm món mới (ảnh, giá, nguyên liệu, dị ứng, thẻ thời tiết)
  * `PUT /api/v1/admin/dishes/{dishId}` — Sửa thông tin món
  * `PATCH /api/v1/admin/dishes/{dishId}/availability` — Bật/Tắt trạng thái còn bán (`isAvailable`)
  * `PATCH /api/v1/admin/dishes/{dishId}/visibility` — Bật/Tắt ẩn hiện với khách hàng (`isVisible`)
  * `DELETE /api/v1/admin/dishes/{dishId}` — Xóa mềm món ăn (`isDeleted = true`)
* **Lưu ý nghiệp vụ:** Tuyệt đối không xóa vật lý món ăn để bảo vệ dữ liệu lịch sử đơn hàng.

---

### 🔹 Giai đoạn 3: Quản lý Đơn hàng & Thanh toán (Order & Payment Management)
* **Mục tiêu:** Theo dõi toàn bộ đơn hàng của khách, điều phối quy trình bếp - giao hàng theo luồng trạng thái chuẩn FSM, tra cứu giao dịch và xử lý hoàn tiền.
* **Tài liệu API:** [`docs/api/admin-order.md`](../api/admin-order.md) (`ORD-07` → `ORD-12`, `PAY-04` → `PAY-07`).
* **Luồng trạng thái đơn hàng (FSM):**
  ```
  PENDING_CONFIRMATION → CONFIRMED → PREPARING → READY → DELIVERING → COMPLETED
                                                                     ↘ CANCELLED
  ```
* **Endpoints Đơn hàng:**
  * `GET /api/v1/admin/orders?status=...&page=...` — Lọc đơn hàng theo từng tab trạng thái
  * `PATCH /api/v1/admin/orders/{orderId}/status` — Chuyển trạng thái đơn kế tiếp hợp lệ
  * `POST /api/v1/admin/orders/{orderId}/cancel` — Hủy đơn kèm lý do của Admin
* **Endpoints Thanh toán:**
  * `GET /api/v1/admin/payments` — Tra cứu lịch sử thanh toán
  * `POST /api/v1/admin/payments/reconcile` — Đối soát số tiền
  * `POST /api/v1/admin/payments/{paymentId}/refund` — Ghi nhận hoàn tiền cho đơn đã `PAID`
  * `GET /api/v1/admin/payments/callback-logs` — Xem log giao dịch từ Webhook cổng thanh toán

---

### 🔹 Giai đoạn 4: Quản lý Bàn ăn & Điều phối Đặt bàn (Table & Reservation)
* **Mục tiêu:** Quản lý sức chứa và số lượng bàn ăn tại nhà hàng, tiếp nhận các yêu cầu đặt bàn trực tuyến từ khách hàng.
* **Tài liệu API:** [`docs/api/admin-table-report.md`](../api/admin-table-report.md) (`BKG-05` → `BKG-12`).
* **Endpoints Bàn ăn:**
  * `GET /api/v1/admin/tables` — Danh sách bàn và trạng thái (`AVAILABLE`, `RESERVED`, `OCCUPIED`)
  * `POST /api/v1/admin/tables` — Thêm bàn mới
  * `PUT /api/v1/admin/tables/{tableId}` — Sửa số bàn và sức chứa ghế
* **Endpoints Đặt bàn:**
  * `GET /api/v1/admin/reservations` — Danh sách khách đặt bàn theo ngày/giờ
  * `PATCH /api/v1/admin/reservations/{reservationId}/status` — Duyệt (`CONFIRMED` $\rightarrow$ gán bàn), hoàn thành (`COMPLETED`), từ chối (`REJECTED`) hoặc hủy (`CANCELLED`)
* **Lưu ý nghiệp vụ:** Khi Admin duyệt đặt bàn (`CONFIRMED`), trạng thái bàn liên kết tự động chuyển sang `RESERVED`; khi hoàn tất hoặc hủy, bàn tự động chuyển lại `AVAILABLE`.

---

### 🔹 Giai đoạn 5: Quản lý Tài khoản Người dùng (Account Management)
* **Mục tiêu:** Quản trị danh sách người dùng toàn hệ thống, kiểm soát truy cập và khóa tài khoản có hành vi gian lận/vi phạm.
* **Tài liệu API:** [`docs/api/admin-account.md`](../api/admin-account.md) (`USR-07` → `USR-10`).
* **Endpoints chính:**
  * `GET /api/v1/admin/accounts?keyword=...&status=...&page=...` — Danh sách tài khoản có phân trang và tìm kiếm
  * `PATCH /api/v1/admin/accounts/{accountId}/lock` — Khóa tài khoản (cưỡng chế logout tài khoản bị khóa)
  * `PATCH /api/v1/admin/accounts/{accountId}/unlock` — Mở khóa tài khoản
* **Lưu ý nghiệp vụ:** Chặn không cho phép Admin tự khóa chính mình trên giao diện.

---

## 📋 3. Bảng Theo dõi Tiến độ (Progress Checklist)

| Giai đoạn | Nội dung Module | Trạng thái | Ghi chú |
|:---:|---|:---:|---|
| **Giai đoạn 1** | **Admin Layout Shell & Dashboard Báo cáo** | ✅ **Hoàn thành** | Sidebar, Header, Route Guard, Báo cáo Doanh thu/Top món |
| **Giai đoạn 2** | **Quản lý Món ăn & Danh mục** | ✅ **Hoàn thành** | Bảng món ăn, thêm/sửa, dị ứng, tag thời tiết, xóa mềm |
| **Giai đoạn 3** | **Quản lý Đơn hàng & Thanh toán** | ✅ **Hoàn thành** | Tabs trạng thái, duyệt đơn, hủy đơn, hoàn tiền |
| **Giai đoạn 4** | **Bàn ăn & Điều phối Đặt bàn** | ⏳ **Sẵn sàng thực thi** | Sơ đồ bàn, duyệt đặt bàn, gán bàn |
| **Giai đoạn 5** | **Quản lý Tài khoản Người dùng** | ⏸️ Chờ Giai đoạn 4 | Tìm kiếm tài khoản, Khóa / Mở khóa |

---

## ⚠️ 4. Tiêu chuẩn Phát triển Bắt buộc (Rules for Development)
1. **Tuân thủ quy trình 2 pha:** Phân tích & chốt phương án trước khi viết code.
2. **Strict Anti-guessing:** Chỉ sử dụng các endpoint có trong tài liệu `docs/api/`. Không tự bịa URL.
3. **Enum IN HOA tiếng Anh:** Mọi giá trị Enum (`ADMIN`, `CUSTOMER`, `ACTIVE`, `LOCKED`, `COMPLETED`, v.v.) phải viết hoa chính xác.
4. **4 Trạng thái UI bắt buộc:** Mọi màn hình danh sách và thao tác đều phải có đủ:
   - **Loading:** Hiệu ứng Skeleton hoặc Spinner chuyên nghiệp
   - **Error:** Thông báo lỗi kèm nút "Thử lại"
   - **Empty:** Trạng thái rỗng trực quan khi không có dữ liệu
   - **Data:** Giao diện hiển thị dữ liệu đầy đủ
5. **Clean Code & UX:** Mỗi component không vượt quá 200 dòng, các nút thao tác nguy hiểm (Xóa, Hủy, Khóa) bắt buộc có Modal xác nhận.

