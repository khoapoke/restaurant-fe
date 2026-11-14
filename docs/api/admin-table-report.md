# QUẢN LÝ BÀN ĂN, ĐIỀU PHỐI ĐẶT BÀN & BÁO CÁO THỐNG KÊ (ADMIN TABLE & REPORT APIs)

> 📌 **Tài liệu nghiệp vụ chuyên sâu Backend:**  
> - Bàn ăn & Đặt bàn: [modules/reservation.md](../modules/reservation.md)  
> - Báo cáo Tổng hợp Executive Dashboard: [modules/report.md](../modules/report.md)  
> *(Xem chi tiết: Ma trận tự động đồng bộ trạng thái bàn khi duyệt/hủy/vào bàn, High-Performance Aggregates tránh Memory Leak)*  
> Middleware bắt buộc: `auth:sanctum`, `account.active`, `role:ADMIN`.  
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md) và danh mục Enum tại [`enums.md`](./enums.md).

---

## 1. Bảng Tổng Hợp Endpoints

### 1.1. Bàn ăn & Đặt bàn (Reservation & Tables)
| Mã API | Method | Endpoint URL | Request Body | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---|:---|:---:|
| `BKG-07` | `GET` | `/api/v1/admin/tables` | Query: `status` | Sơ đồ bàn ăn (AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE) | `200` |
| `BKG-08` | `PATCH`| `/api/v1/admin/tables/{id}/status` | `{ "status": "AVAILABLE\|MAINTENANCE" }` | Chuyển nhanh bàn sang trạng thái Bảo trì hoặc Trống | `200 / 404` |
| `BKG-09` | `GET` | `/api/v1/admin/reservations` | Query: `page`, `date`, `status` | Danh sách phiếu đặt bàn phân trang | `200` |
| `BKG-10` | `GET` | `/api/v1/admin/reservations/{id}`| *(Không)* | Xem chi tiết 1 phiếu đặt bàn | `200 / 404` |
| `BKG-11` | `PATCH`| `/api/v1/admin/reservations/{id}/status` | Schema Status Update | Duyệt, Vào bàn (`SEATED`), Hoàn thành, Hủy phiếu | `200 / 400 / 409` |

### 1.2. Báo cáo Doanh thu & Vận hành (Executive Reports)
| Mã API | Method | Endpoint URL | Query Parameters | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---|:---|:---:|
| `RPT-00` | `GET` | `/api/v1/admin/reports/dashboard` | `fromDate`, `toDate`, `limit`? | Tổng hợp 4 nhóm chỉ số (Doanh thu, Đơn, Món, Bàn) | `200 / 422` |
| `RPT-01` | `GET` | `/api/v1/admin/reports/revenue` | `fromDate`, `toDate` | Chi tiết doanh thu theo chuỗi ngày `dailySeries` | `200 / 422` |
| `RPT-02` | `GET` | `/api/v1/admin/reports/orders` | `fromDate`, `toDate` | Thống kê số lượng đơn hàng và tỷ lệ hoàn thành | `200 / 422` |
| `RPT-03` | `GET` | `/api/v1/admin/reports/top-dishes` | `fromDate`, `toDate`, `limit` | Xếp hạng top món ăn bán chạy nhất | `200 / 422` |
| `RPT-04` | `GET` | `/api/v1/admin/reports/reservations` | `fromDate`, `toDate` | Thống kê lượt đặt bàn và tỷ lệ lấp đầy bàn ăn | `200 / 422` |

---

## 2. Chi Tiết Request & Response

### 2.1. Cập nhật trạng thái phiếu đặt bàn (`BKG-11`)
- **Endpoint:** `PATCH /api/v1/admin/reservations/{id}/status`
- **Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`, `Accept: application/json`

#### Request Body:
```json
{
  "targetStatus": "CONFIRMED",
  "tableId": 3,
  "tableStatus": "RESERVED",
  "adminNote": "Đã giữ Bàn VIP 01 cạnh cửa sổ"
}
```
*(Khi khách đến nhận bàn: gửi `targetStatus: "SEATED"` $\rightarrow$ Bàn chuyển sang `OCCUPIED`)*  
*(Khi khách thanh toán hoặc hủy: gửi `targetStatus: "COMPLETED"` hoặc `"CANCELLED"` $\rightarrow$ Bàn tự giải phóng về `AVAILABLE`)*

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Reservation confirmed successfully",
  "data": {
    "reservationId": 25,
    "status": "CONFIRMED",
    "tableId": 3,
    "tableStatus": "RESERVED"
  },
  "errors": null
}
```

#### Response Lỗi (`409 Conflict`):
```json
{
  "success": false,
  "code": 409,
  "message": "Bàn đã có đơn đặt trùng thời gian ca ăn khác",
  "data": null,
  "errors": null
}
```

---

### 2.2. Báo cáo Tổng quan Dashboard Điều hành (`RPT-00`)
- **Endpoint:** `GET /api/v1/admin/reports/dashboard`
- **Query Parameters:** `fromDate=2026-11-01&toDate=2026-11-13&limit=5`

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Dashboard report retrieved successfully",
  "data": {
    "period": {
      "fromDate": "2026-11-01",
      "toDate": "2026-11-13"
    },
    "revenue": {
      "totalRevenue": 45200000,
      "dailySeries": [
        { "date": "2026-11-10", "revenue": 5200000 },
        { "date": "2026-11-11", "revenue": 6800000 }
      ]
    },
    "orders": {
      "totalOrders": 120,
      "completedOrders": 105,
      "cancelledOrders": 15,
      "completionRate": 87.5
    },
    "topDishes": [
      {
        "dishId": 5,
        "dishName": "Gỏi ngó sen tôm thịt",
        "totalSold": 85,
        "revenue": 7225000
      }
    ],
    "reservations": {
      "totalReservations": 45,
      "confirmedReservations": 38,
      "totalTables": 15,
      "occupancyRatePercent": 63.3
    }
  },
  "errors": null
}
```
