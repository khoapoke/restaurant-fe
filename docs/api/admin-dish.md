# ADMIN — Quản lý Danh mục & Món ăn (`Admin\CategoryController` & `Admin\DishController`)

> **Middleware chung:** `auth:sanctum`, `account.active`, `role:ADMIN`
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md)

---

## Endpoints — Danh mục (`MNU-09` → `MNU-12`)

| Chức năng | Method & URL |
|-----------|-------------|
| Thêm danh mục | `POST /api/v1/admin/categories` |
| Sửa danh mục | `PUT /api/v1/admin/categories/{categoryId}` |
| Ẩn/Hiện danh mục | `PATCH /api/v1/admin/categories/{categoryId}/visibility` |
| Xóa mềm danh mục | `DELETE /api/v1/admin/categories/{categoryId}` |

## Endpoints — Món ăn (`MNU-13` → `MNU-17`)

| Chức năng | Method & URL |
|-----------|-------------|
| Thêm món ăn | `POST /api/v1/admin/dishes` |
| Sửa món ăn | `PUT /api/v1/admin/dishes/{dishId}` |
| Bật/Tắt còn bán | `PATCH /api/v1/admin/dishes/{dishId}/availability` |
| Ẩn/Hiện món ăn | `PATCH /api/v1/admin/dishes/{dishId}/visibility` |
| Xóa mềm món ăn | `DELETE /api/v1/admin/dishes/{dishId}` |

---

## Request Body (`POST /api/v1/admin/dishes`)
```json
{
  "dishName": "Gà nướng Tây Bắc",
  "price": 280000.00,
  "description": "Gà đi bộ nướng mật ong và mắc khén",
  "imageUrl": "ga_nuong.jpg",
  "categoryId": 2,
  "ingredients": ["Gà ta", "Mật ong", "Mắc khén"],
  "allergens": [],
  "weatherTags": ["RAINY_OR_COLD", "PLEASANT_NORMAL"],
  "isAvailable": true,
  "isVisible": true
}
```

## Response (Success - 201 Created / 200 OK)
```json
{
  "success": true,
  "code": 200,
  "message": "Dish saved successfully",
  "data": {
    "dishId": 3,
    "dishName": "Gà nướng Tây Bắc",
    "price": 280000.00,
    "categoryId": 2,
    "isAvailable": true,
    "isVisible": true,
    "isDeleted": false
  }
}
```

## Response (Error - 422 Unprocessable Entity)
```json
{
  "success": false,
  "code": 422,
  "message": "Validation failed",
  "errors": {
    "categoryId": ["The selected category id does not exist in DANH_MUC."]
  }
}
```

---

## Ghi chú nghiệp vụ
> **QUAN TRỌNG:** Khi gọi `DELETE /api/v1/admin/dishes/{dishId}`, tuyệt đối **KHÔNG gọi `$dish->delete()` vật lý** vì sẽ vi phạm khóa ngoại `FK_CTDONHANG_MON_AN` trong bảng `CHI_TIET_DON_HANG`. Thay vào đó, cập nhật cờ xóa mềm (`isDeleted = true`, `isVisible = false`).
