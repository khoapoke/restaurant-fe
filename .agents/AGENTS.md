# Restaurant FE — Agent Context

> File này được Antigravity tự động load mỗi conversation mới.

## 🏠 Project Overview
Đây là **Frontend** cho hệ thống quản lý nhà hàng trực tuyến, gồm 2 phân hệ:
- **Customer**: Xem menu, đặt món, giỏ hàng, thanh toán QR, đặt bàn
- **Admin**: Quản lý tài khoản, menu, đơn hàng, bàn ăn, báo cáo dashboard

**Tech Stack:** Vite 8 + React 19 (JSX, không TypeScript) | Backend: Laravel + Sanctum + SQL Server

---

## 📂 Nơi tìm tài liệu

### Đọc đầu tiên:
- **Mục lục tổng:** `docs/README.md`
- **Coding standards:** `docs/architecture/fe-standards.md`
- **Project context:** `docs/architecture/project-context.md`
- **Kế hoạch triển khai Admin:** `docs/architecture/admin-roadmap.md`

### Khi làm một module cụ thể, đọc file API tương ứng:
| Nếu task liên quan đến... | → Đọc file |
|---------------------------|-----------|
| Đăng nhập, đăng ký, logout | `docs/api/auth.md` |
| Hồ sơ khách hàng, địa chỉ, dị ứng | `docs/api/customer-profile.md` |
| Menu, tìm kiếm món, gợi ý thời tiết | `docs/api/customer-menu.md` |
| Giỏ hàng | `docs/api/customer-cart.md` |
| Đơn hàng, checkout, thanh toán QR | `docs/api/customer-order.md` |
| Đặt bàn (khách) | `docs/api/customer-reservation.md` |
| Quản lý tài khoản (admin) | `docs/api/admin-account.md` |
| Quản lý danh mục & món ăn (admin) | `docs/api/admin-dish.md` |
| Quản lý đơn hàng & thanh toán (admin) | `docs/api/admin-order.md` |
| Bàn ăn, đặt bàn, dashboard (admin) | `docs/api/admin-table-report.md` |
| Kiểm tra giá trị Enum/Status | `docs/api/enums.md` |

### Quy ước chung (đọc 1 lần):
- **API conventions** (headers, middleware, error codes): `docs/api/_conventions.md`
- **Agent operating rules** (quy trình 2 pha): `.github/ANTIGRAVITY.md`

---

## ⚠️ Quy tắc quan trọng
1. **KHÔNG tự bịa API endpoint** — phải đọc file spec trước khi code
2. **Enum values phải IN HOA tiếng Anh** — xem `docs/api/enums.md`
3. **Quy trình 2 pha** — Phân tích trước, code sau (xem `.github/ANTIGRAVITY.md`)
4. **4 trạng thái UI bắt buộc** — Loading, Error, Empty, Data
