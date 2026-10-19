# RESTAURANT FE — Project Context

## Mục tiêu dự án
Xây dựng hệ thống quản lý nhà hàng trực tuyến với 2 phân hệ:
1. **Customer (Khách hàng):** Xem menu, đặt món, giỏ hàng, thanh toán QR, đặt bàn
2. **Admin (Quản trị):** Quản lý tài khoản, menu, đơn hàng, bàn ăn, báo cáo

## Tech Stack (Frontend)
- **Build Tool:** Vite 8.x
- **Framework:** React 19.x (JSX, không dùng TypeScript)
- **Styling:** _(chưa cài đặt — cần quyết định: Tailwind CSS, vanilla CSS, hoặc CSS modules)_
- **HTTP Client:** _(chưa cài đặt — nên dùng Axios)_
- **State Management:** _(chưa cài đặt — nên dùng Zustand hoặc React Context)_
- **Routing:** _(chưa cài đặt — nên dùng React Router v7)_

## Backend
- **Framework:** Laravel 10/11
- **Auth:** Laravel Sanctum (Token-based)
- **Database:** SQL Server
- **API Prefix:** `/api/v1`

## Bảng Database chính (tên tiếng Việt trong DB)
| Bảng | Ý nghĩa | Model Laravel |
|------|---------|---------------|
| `NGUOI_DUNG` | Hồ sơ người dùng | `UserProfile` |
| `TAI_KHOAN` | Tài khoản đăng nhập | `Account` |
| `VAI_TRO` | Vai trò (Admin/Customer) | `Role` |
| `DANH_MUC` | Danh mục món ăn | `Category` |
| `MON_AN` | Món ăn | `Dish` |
| `GIO_HANG` | Giỏ hàng | `Cart` |
| `MON_AN_GIO_HANG` | Chi tiết giỏ hàng (pivot) | — |
| `DON_HANG` | Đơn hàng | `Order` |
| `CHI_TIET_DON_HANG` | Chi tiết đơn hàng (pivot) | — |
| `THANH_TOAN` | Thanh toán | `Payment` |
| `BAN_AN` | Bàn ăn | `Table` |
| `DAT_BAN` | Lượt đặt bàn | `Reservation` |

## Mapping tên cột DB → JSON Key
Backend đã transform tên cột tiếng Việt sang camelCase tiếng Anh trong API response. Frontend chỉ cần làm việc với JSON key, **KHÔNG cần biết tên cột DB**.

Ví dụ: `ma_tai_khoan` → `accountId`, `ten_mon_an` → `dishName`, `trang_thai` → `status`.
