# XÁC THỰC TÀI KHOẢN (SHARED AUTHENTICATION APIs)

> 📌 **Tài liệu nghiệp vụ chuyên sâu Backend:** [modules/auth.md](../modules/auth.md)  
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md) và danh mục Enum tại [`enums.md`](./enums.md).

---

## 1. Bảng Tổng Hợp Endpoints

| Mã API | Method | Endpoint URL | Phân quyền | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---:|:---|:---:|
| `USR-01` | `POST` | `/api/v1/auth/register` | Public | Đăng ký tài khoản khách hàng mới | `201 / 422` |
| `USR-02` | `POST` | `/api/v1/auth/login` | Public | Đăng nhập hệ thống (cấp Sanctum Token) | `200 / 401 / 403 / 422` |
| `USR-03` | `POST` | `/api/v1/auth/logout` | `auth:sanctum` | Đăng xuất (thu hồi Token hiện tại) | `200 / 401` |

---

## 2. Chi Tiết Request & Response

### 2.1. Đăng ký tài khoản Khách hàng (`USR-01`)
- **Endpoint:** `POST /api/v1/auth/register`
- **Headers:** `Content-Type: application/json`, `Accept: application/json`

#### Request Body:
```json
{
  "username": "khachhang_moi",
  "password": "Password@123",
  "passwordConfirmation": "Password@123",
  "email": "khachhang_moi@example.com",
  "fullName": "Nguyễn Minh Tuấn",
  "phoneNumber": "0987654321",
  "birthDate": "1999-08-15",
  "address": "140 Lê Trọng Tấn, Quận Tân Phú, TP.HCM"
}
```

#### Response Thành công (`201 Created`):
```json
{
  "success": true,
  "code": 201,
  "message": "Account registered successfully",
  "data": {
    "accessToken": "1|laravel_sanctum_token_string_example_abc123",
    "tokenType": "Bearer",
    "account": {
      "accountId": 5,
      "username": "khachhang_moi",
      "email": "khachhang_moi@example.com",
      "status": "ACTIVE",
      "role": "CUSTOMER",
      "userProfile": {
        "userId": 5,
        "fullName": "Nguyễn Minh Tuấn",
        "phoneNumber": "0987654321",
        "birthDate": "1999-08-15",
        "address": "140 Lê Trọng Tấn, Quận Tân Phú, TP.HCM"
      },
      "cartId": 4
    }
  },
  "errors": null
}
```

#### Response Lỗi (`422 Unprocessable Entity`):
```json
{
  "success": false,
  "code": 422,
  "message": "The given data was invalid.",
  "data": null,
  "errors": {
    "username": ["Tên đăng nhập đã tồn tại trong hệ thống."],
    "email": ["Email đã được sử dụng."],
    "phoneNumber": ["Số điện thoại không đúng định dạng Việt Nam."]
  }
}
```

---

### 2.2. Đăng nhập hệ thống (`USR-02`)
- **Endpoint:** `POST /api/v1/auth/login`
- **Headers:** `Content-Type: application/json`, `Accept: application/json`

#### Request Body:
```json
{
  "username": "khachhang1",
  "password": "Password@123",
  "rememberMe": true
}
```

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "2|sanctum_token_xyz987654321",
    "tokenType": "Bearer",
    "account": {
      "accountId": 3,
      "username": "khachhang1",
      "email": "khachhang1@gmail.com",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "userProfile": {
        "userId": 3,
        "fullName": "Lê Hoàng Hùng",
        "phoneNumber": "0923456789",
        "birthDate": "1995-08-15",
        "address": "789 Cách Mạng Tháng 8, Q.10, TP.HCM"
      }
    }
  },
  "errors": null
}
```

#### Response Lỗi:
- **`401 Unauthorized`** (Sai thông tin đăng nhập):
```json
{
  "success": false,
  "code": 401,
  "message": "Invalid username or password",
  "data": null,
  "errors": null
}
```
- **`403 Forbidden`** (Tài khoản bị khóa `LOCKED`):
```json
{
  "success": false,
  "code": 403,
  "message": "Account has been locked. Please contact administrator.",
  "data": null,
  "errors": null
}
```

---

### 2.3. Đăng xuất hệ thống (`USR-03`)
- **Endpoint:** `POST /api/v1/auth/logout`
- **Headers:** `Authorization: Bearer <token>`, `Accept: application/json`

#### Request Body: *(Không)*

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Logged out successfully",
  "data": null,
  "errors": null
}
```
