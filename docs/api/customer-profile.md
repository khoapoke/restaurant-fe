# HỒ SƠ, ĐỊA CHỈ & DỊ ỨNG KHÁCH HÀNG (CUSTOMER PROFILE APIs)

> 📌 **Tài liệu nghiệp vụ chuyên sâu Backend:** [modules/auth.md](../modules/auth.md)  
> Middleware bắt buộc: `auth:sanctum`, `role:CUSTOMER`.  
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md) và danh mục Enum tại [`enums.md`](./enums.md).

---

## 1. Bảng Tổng Hợp Endpoints

| Mã API | Method | Endpoint URL | Phân quyền | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---:|:---|:---:|
| `USR-04` | `GET` | `/api/v1/customer/profile` | `CUSTOMER` | Lấy chi tiết hồ sơ cá nhân và cảnh báo dị ứng | `200 / 401` |
| `USR-05` | `PUT` | `/api/v1/customer/profile` | `CUSTOMER` | Cập nhật hồ sơ cá nhân, địa chỉ, dị ứng | `200 / 401 / 422` |
| `USR-06` | `PUT` | `/api/v1/customer/password` | `CUSTOMER` | Đổi mật khẩu tài khoản (thu hồi token cũ) | `200 / 400 / 401 / 422` |

---

## 2. Chi Tiết Request & Response

### 2.1. Tra cứu thông tin hồ sơ cá nhân (`USR-04`)
- **Endpoint:** `GET /api/v1/customer/profile`
- **Headers:** `Authorization: Bearer <token>`, `Accept: application/json`

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "userId": 1,
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "birthDate": "1995-08-15",
    "defaultAddress": "123 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM",
    "savedAddresses": [
      {
        "label": "Văn phòng",
        "address": "456 Nguyễn Thị Minh Khai, Q.3, TP.HCM",
        "isDefault": false
      }
    ],
    "allergies": ["SHELLFISH", "PEANUT"],
    "dietaryPreferences": ["LESS_SUGAR"],
    "username": "customer1",
    "role": "CUSTOMER"
  },
  "errors": null
}
```

---

### 2.2. Cập nhật hồ sơ, địa chỉ & dị ứng (`USR-05`)
- **Endpoint:** `PUT /api/v1/customer/profile`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`, `Accept: application/json`

#### Request Body:
```json
{
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567",
  "birthDate": "1995-08-15",
  "defaultAddress": "123 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM",
  "savedAddresses": [
    {
      "label": "Văn phòng",
      "address": "456 Nguyễn Thị Minh Khai, Q.3, TP.HCM",
      "isDefault": false
    }
  ],
  "allergies": ["SHELLFISH", "PEANUT"],
  "dietaryPreferences": ["LESS_SUGAR", "HIGH_PROTEIN"]
}
```

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Profile updated successfully",
  "data": {
    "userId": 1,
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "birthDate": "1995-08-15",
    "defaultAddress": "123 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM",
    "savedAddresses": [
      {
        "label": "Văn phòng",
        "address": "456 Nguyễn Thị Minh Khai, Q.3, TP.HCM",
        "isDefault": false
      }
    ],
    "allergies": ["SHELLFISH", "PEANUT"],
    "dietaryPreferences": ["LESS_SUGAR", "HIGH_PROTEIN"],
    "username": "customer1",
    "role": "CUSTOMER"
  },
  "errors": null
}
```

#### Response Lỗi (`422 Unprocessable Entity`):
```json
{
  "success": false,
  "code": 422,
  "message": "Validation failed",
  "data": null,
  "errors": {
    "phoneNumber": ["Số điện thoại không đúng định dạng."],
    "birthDate": ["Ngày sinh không hợp lệ (định dạng Y-m-d)."]
  }
}
```

---

### 2.3. Đổi mật khẩu tài khoản (`USR-06`)
- **Endpoint:** `PUT /api/v1/customer/password`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`, `Accept: application/json`

#### Request Body:
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@456",
  "newPassword_confirmation": "NewPassword@456"
}
```

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Password changed successfully. All previous sessions revoked.",
  "data": null,
  "errors": null
}
```

#### Response Lỗi:
- **`400 Bad Request`**: Mật khẩu hiện tại (`currentPassword`) không chính xác.
- **`422 Unprocessable Entity`**: Mật khẩu mới quá ngắn ($< 8$ ký tự) hoặc xác nhận mật khẩu không khớp.
