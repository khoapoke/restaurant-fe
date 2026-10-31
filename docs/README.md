# 📚 Restaurant FE — Documentation Index

> **Dành cho AI Agent:** Đọc file này đầu tiên để biết docs nằm ở đâu.
> Khi làm module nào, **chỉ cần đọc file API tương ứng**, không cần đọc hết.

---

## 📖 Quy ước & Kiến trúc

| File | Nội dung |
|------|---------|
| [`api/_conventions.md`](./api/_conventions.md) | Quy ước API chung: headers, middleware, HTTP status codes, response format |
| [`api/enums.md`](./api/enums.md) | **Tất cả Enum/Status values** — ĐỌC KHI CẦN KIỂM TRA GIÁ TRỊ ENUM |
| [`architecture/fe-standards.md`](./architecture/fe-standards.md) | Coding standards, folder structure, clean code rules |
| [`architecture/project-context.md`](./architecture/project-context.md) | Tổng quan project: mục tiêu, tech stack, DB tables |
| [`architecture/admin-roadmap.md`](./architecture/admin-roadmap.md) | **Kế hoạch & Lộ trình triển khai Phân hệ Admin 5 giai đoạn** |

---

## 🔐 Authentication APIs
| File | Endpoints |
|------|----------|
| [`api/auth.md`](./api/auth.md) | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` |

---

## 👤 Customer APIs

| File | Module | Endpoints chính |
|------|--------|----------------|
| [`api/customer-profile.md`](./api/customer-profile.md) | Hồ sơ, Địa chỉ, Dị ứng | `GET/PUT /customer/profile` |
| [`api/customer-menu.md`](./api/customer-menu.md) | Thực đơn, Tìm kiếm, Thời tiết | `GET /customer/categories`, `GET /customer/dishes`, `GET /customer/recommendations/weather` |
| [`api/customer-cart.md`](./api/customer-cart.md) | Giỏ hàng | `GET/POST/PUT/DELETE /customer/cart/items` |
| [`api/customer-order.md`](./api/customer-order.md) | Đơn hàng & Thanh toán QR | `POST /customer/orders/checkout`, `POST /customer/payments/{id}/qr` |
| [`api/customer-reservation.md`](./api/customer-reservation.md) | Đặt bàn | `GET /customer/tables/available`, `POST/PUT /customer/reservations` |

---

## 🛡️ Admin APIs

| File | Module | Endpoints chính |
|------|--------|----------------|
| [`api/admin-account.md`](./api/admin-account.md) | Quản lý tài khoản | `GET /admin/accounts`, `PATCH /admin/accounts/{id}/lock\|unlock` |
| [`api/admin-dish.md`](./api/admin-dish.md) | Danh mục & Món ăn CRUD | `POST/PUT/PATCH/DELETE /admin/categories`, `/admin/dishes` |
| [`api/admin-order.md`](./api/admin-order.md) | Đơn hàng & Thanh toán | `PATCH /admin/orders/{id}/status`, `POST /admin/payments/{id}/refund` |
| [`api/admin-table-report.md`](./api/admin-table-report.md) | Bàn ăn, Đặt bàn & Dashboard | `GET/POST/PUT /admin/tables`, `GET /admin/reports/dashboard` |

---

## 📝 Tài liệu hướng dẫn khác
| File | Mô tả |
|------|-------|
| [`PROMPT_CHEATSHEET.md`](./PROMPT_CHEATSHEET.md) | Mẫu prompt copy-paste cho user khi làm việc với AI |

> **Lưu ý:** Tất cả URL API đều có prefix `/api/v1`. Ví dụ: `/customer/cart` → `GET /api/v1/customer/cart`.
