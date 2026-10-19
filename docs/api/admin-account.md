# ADMIN — Quản lý Người dùng (`Admin\AccountController`)

> **Middleware chung:** `auth:sanctum`, `account.active`, `role:ADMIN`
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md)

---

## Endpoints

| Chức năng | Method & URL | Use Case |
|-----------|-------------|----------|
| Danh sách & tìm kiếm (`USR-07`, `USR-08`) | `GET /api/v1/admin/accounts?keyword=Hung&status=ACTIVE&page=1` | Quản lý tài khoản |
| Khóa tài khoản (`USR-09`) | `PATCH /api/v1/admin/accounts/{accountId}/lock` | Khóa user vi phạm |
| Mở khóa tài khoản (`USR-10`) | `PATCH /api/v1/admin/accounts/{accountId}/unlock` | Mở khóa user |

---

## Response (Success - 200 OK — Khóa tài khoản)
```json
{
  "success": true,
  "code": 200,
  "message": "Account locked successfully",
  "data": {
    "accountId": 3,
    "username": "kh1",
    "email": "khachhang1@gmail.com",
    "status": "LOCKED",
    "roleName": "Khách hàng",
    "fullName": "Lê Hoàng Hùng",
    "phoneNumber": "0923456789"
  }
}
```

## Response (Error - 400 Bad Request)
```json
{
  "success": false,
  "code": 400,
  "message": "Admin cannot lock their own account",
  "errors": null
}
```

---

## Ghi chú nghiệp vụ
- Trong Model `Account`, thuộc tính `$hidden = ['mat_khau']` đảm bảo mật khẩu không bao giờ xuất hiện trong JSON.
- Khi khóa tài khoản, gọi `$targetAccount->tokens()->delete()` để đăng xuất cưỡng bức người dùng đó ngay lập tức.
