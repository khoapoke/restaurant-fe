# SHARED AUTHENTICATION APIs (`AuthController`)

> Xem quy ước chung tại [`_conventions.md`](./_conventions.md)

---

## 1. Đăng ký tài khoản Khách hàng (`USR-01`)
- **Method & URL:** `POST /api/v1/auth/register`
- **Controller & FormRequest:** `AuthController@register` | `RegisterRequest`
- **Request Body:**
```json
{
  "username": "khachhang_moi",
  "password": "Password@123",
  "passwordConfirmation": "Password@123",
  "email": "khachhang_moi@gmail.com",
  "fullName": "Nguyễn Minh Tuấn",
  "phoneNumber": "0987654321",
  "birthDate": "1999-08-15",
  "address": "140 Lê Trọng Tấn, Quận Tân Phú, TP.HCM"
}
```
- **Response (Success - 201 Created):**
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
      "email": "khachhang_moi@gmail.com",
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
  }
}
```
- **Response (Error - 422 Unprocessable Entity):**
```json
{
  "success": false,
  "code": 422,
  "message": "The given data was invalid.",
  "errors": {
    "username": ["The username has already been taken."],
    "phoneNumber": ["The phone number format is invalid."]
  }
}
```
- **Ghi chú nghiệp vụ:** Sử dụng Rule `unique:TAI_KHOAN,ten_dang_nhap` và `unique:TAI_KHOAN,email` trong `RegisterRequest`. Bọc trong `DB::transaction()` để tạo tuần tự: `UserProfile` → `Account` (với `ma_vai_tro = 3`, `mat_khau = Hash::make()`) → `Cart`.

---

## 2. Đăng nhập hệ thống (`USR-02`)
- **Method & URL:** `POST /api/v1/auth/login`
- **Controller & FormRequest:** `AuthController@login` | `LoginRequest`
- **Request Body:**
```json
{
  "username": "kh1",
  "password": "123",
  "rememberMe": true
}
```
- **Response (Success - 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "2|sanctum_token_xyz987654321",
    "tokenType": "Bearer",
    "expiresAt": "2026-07-10T08:05:00Z",
    "account": {
      "accountId": 3,
      "username": "kh1",
      "email": "khachhang1@gmail.com",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "userProfile": {
        "userId": 3,
        "fullName": "Lê Hoàng Hùng",
        "phoneNumber": "0923456789",
        "address": "789 Cách Mạng Tháng 8"
      }
    }
  }
}
```
- **Response (Error - 401 Unauthorized):**
```json
{
  "success": false,
  "code": 401,
  "message": "Invalid credentials or account has been locked",
  "errors": null
}
```
- **Ghi chú nghiệp vụ:** Tìm `Account::where('ten_dang_nhap', $request->username)->first()`. Hỗ trợ tự động nâng cấp mật khẩu mẫu `'123'` sang `BCrypt` nếu DB vừa chạy script SQL mẫu. Cấp Sanctum Token qua `$account->createToken('auth_token', [$roleAbility], $expiresAt)->plainTextToken`.

---

## 3. Đăng xuất hệ thống
- **Method & URL:** `POST /api/v1/auth/logout`
- **Middleware:** `auth:sanctum`
- **Response (Success - 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Logged out successfully",
  "data": null
}
```
- **Ghi chú nghiệp vụ:** Thực thi `$request->user()->currentAccessToken()->delete()` để hủy Token hiện tại.
