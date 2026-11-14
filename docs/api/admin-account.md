# QUẢN LÝ TÀI KHOẢN HỆ THỐNG (ADMIN ACCOUNT APIs)

> 📌 **Tài liệu nghiệp vụ chuyên sâu Backend:** [modules/auth.md](../modules/auth.md)  
> *(Xem chi tiết: Rule AUTH-LOCK không tự khóa chính mình, Thu hồi toàn bộ Sanctum tokens khi khóa tài khoản)*  
> Middleware bắt buộc: `auth:sanctum`, `account.active`, `role:ADMIN`.  
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md) và danh mục Enum tại [`enums.md`](./enums.md).

---

## 1. Bảng Tổng Hợp Endpoints

| Mã API | Method | Endpoint URL | Phân quyền | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---:|:---|:---:|
| `ADM-01` | `GET` | `/api/v1/admin/accounts` | `ADMIN` | Danh sách tài khoản phân trang, lọc theo vai trò, trạng thái | `200` |
| `ADM-02` | `POST` | `/api/v1/admin/accounts` | `ADMIN` | Tạo tài khoản nhân viên phục vụ (`STAFF`) mới | `201 / 422` |
| `ADM-03` | `GET` | `/api/v1/admin/accounts/{id}` | `ADMIN` | Xem chi tiết 1 tài khoản người dùng | `200 / 404` |
| `ADM-04` | `PATCH`| `/api/v1/admin/accounts/{id}/lock` | `ADMIN` | Khóa tài khoản & cưỡng chế đăng xuất tức thì | `200 / 400 / 404` |
| `ADM-05` | `PATCH`| `/api/v1/admin/accounts/{id}/unlock`| `ADMIN` | Mở khóa kích hoạt lại tài khoản | `200 / 404` |

---

## 2. Chi Tiết Request & Response

### 2.1. Tra cứu danh sách tài khoản phân trang (`ADM-01`)
- **Endpoint:** `GET /api/v1/admin/accounts`
- **Headers:** `Authorization: Bearer <admin_token>`, `Accept: application/json`
- **Query Parameters:**
  - `page`: Số trang (mặc định 1)
  - `perPage`: Số bản ghi mỗi trang (mặc định 10)
  - `search`: Từ khóa tìm theo `username`, `fullName`, `phoneNumber`
  - `role`: Lọc vai trò (`ADMIN`, `STAFF`, `CUSTOMER`)
  - `status`: Lọc trạng thái (`ACTIVE`, `LOCKED`)

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Accounts retrieved successfully",
  "data": {
    "items": [
      {
        "accountId": 2,
        "username": "staff1",
        "status": "ACTIVE",
        "createdAt": "2026-11-01 08:00:00",
        "role": {
          "roleId": 2,
          "roleCode": "STAFF",
          "roleName": "Nhân viên phục vụ"
        },
        "userProfile": {
          "fullName": "Trần Thị B",
          "phoneNumber": "0912345678",
          "birthDate": "1998-05-20"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "perPage": 10,
      "totalItems": 25,
      "lastPage": 3
    }
  },
  "errors": null
}
```

---

### 2.2. Khóa tài khoản người dùng (`ADM-04`)
- **Endpoint:** `PATCH /api/v1/admin/accounts/{id}/lock`

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Account locked successfully",
  "data": {
    "accountId": 2,
    "status": "LOCKED"
  },
  "errors": null
}
```

#### Response Lỗi (`400 Bad Request` khi tự khóa chính mình):
```json
{
  "success": false,
  "code": 400,
  "message": "Quản trị viên không thể tự khóa chính tài khoản của mình",
  "data": null,
  "errors": null
}
```

---

### 2.3. Mở khóa tài khoản người dùng (`ADM-05`)
- **Endpoint:** `PATCH /api/v1/admin/accounts/{id}/unlock`

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Account unlocked successfully",
  "data": {
    "accountId": 2,
    "status": "ACTIVE"
  },
  "errors": null
}
```
