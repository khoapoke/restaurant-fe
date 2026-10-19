# CUSTOMER — Hồ sơ, Địa chỉ & Dị ứng (`Customer\ProfileController`)

> **Middleware chung:** `auth:sanctum`, `account.active`, `role:CUSTOMER`
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md)

---

## 1. Xem hồ sơ cá nhân (`USR-03`)
- **Method & URL:** `GET /api/v1/customer/profile`
- **Response (Success - 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "accountId": 3,
    "username": "kh1",
    "email": "khachhang1@gmail.com",
    "userId": 3,
    "fullName": "Lê Hoàng Hùng",
    "birthDate": "1995-12-01",
    "phoneNumber": "0923456789",
    "defaultAddress": "789 Cách Mạng Tháng 8, Quận 3, TP.HCM",
    "savedAddresses": [
      {
        "addressId": "addr_1",
        "recipientName": "Lê Hoàng Hùng",
        "recipientPhone": "0923456789",
        "fullAddress": "789 Cách Mạng Tháng 8, Quận 3, TP.HCM",
        "isDefault": true
      }
    ],
    "allergies": ["PEANUT", "SHELLFISH"],
    "dietaryPreferences": ["LOW_SUGAR"]
  }
}
```
- **Response (Error - 401 Unauthorized):**
```json
{
  "success": false,
  "code": 401,
  "message": "Unauthenticated.",
  "errors": null
}
```
- **Ghi chú nghiệp vụ:** Sử dụng `$request->user()->load('userProfile')` và trả về qua `CustomerProfileResource`.

---

## 2. Cập nhật hồ sơ, địa chỉ & thông tin dị ứng (`USR-04`, `USR-05`, `USR-06`)
- **Method & URL:** `PUT /api/v1/customer/profile`
- **Request Body:**
```json
{
  "fullName": "Lê Hoàng Hùng",
  "birthDate": "1995-12-01",
  "phoneNumber": "0923456789",
  "email": "khachhang1_new@gmail.com",
  "defaultAddress": "789 Cách Mạng Tháng 8, Quận 3, TP.HCM",
  "savedAddresses": [
    {
      "addressId": "addr_1",
      "recipientName": "Lê Hoàng Hùng",
      "recipientPhone": "0923456789",
      "fullAddress": "789 Cách Mạng Tháng 8, Quận 3, TP.HCM",
      "isDefault": true
    }
  ],
  "allergies": ["PEANUT", "SHELLFISH"],
  "dietaryPreferences": ["HIGH_PROTEIN"]
}
```
- **Response (Success - 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Profile updated successfully",
  "data": {
    "accountId": 3,
    "email": "khachhang1_new@gmail.com",
    "fullName": "Lê Hoàng Hùng",
    "phoneNumber": "0923456789",
    "defaultAddress": "789 Cách Mạng Tháng 8, Quận 3, TP.HCM",
    "allergies": ["PEANUT", "SHELLFISH"],
    "dietaryPreferences": ["HIGH_PROTEIN"]
  }
}
```
- **Response (Error - 422 Unprocessable Entity):**
```json
{
  "success": false,
  "code": 422,
  "message": "Validation failed",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```
- **Ghi chú nghiệp vụ:** Cập nhật bảng `TAI_KHOAN` (`email`) và bảng `NGUOI_DUNG` (`ho_ten`, `ngay_sinh`, `so_dien_thoai`, `dia_chi`, cùng các trường mảng JSON `allergies`, `dietaryPreferences`).
