# CUSTOMER — Quản lý Giỏ hàng (`Customer\CartController`)

> **Middleware chung:** `auth:sanctum`, `account.active`, `role:CUSTOMER`
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md)

---

## Endpoints

| Chức năng | Method & URL | Use Case |
|-----------|-------------|----------|
| Xem giỏ hàng (`CRT-04`) | `GET /api/v1/customer/cart` | Load giỏ hàng |
| Thêm món vào giỏ (`CRT-01`) | `POST /api/v1/customer/cart/items` | Thêm món mới |
| Cập nhật số lượng (`CRT-02`) | `PUT /api/v1/customer/cart/items/{dishId}` | Tăng/giảm số lượng |
| Xóa món khỏi giỏ (`CRT-03`) | `DELETE /api/v1/customer/cart/items/{dishId}` | Xóa 1 món |

---

## Request Body (`POST /api/v1/customer/cart/items`)
```json
{
  "dishId": 1,
  "quantity": 2,
  "selectedOptions": "Chén tiêu chuẩn",
  "itemNote": "Không hành lá"
}
```

## Response (Success - 200 OK)
> **Lưu ý:** Cấu trúc response **đồng nhất cho mọi thao tác** trên giỏ hàng (GET, POST, PUT, DELETE).

```json
{
  "success": true,
  "code": 200,
  "message": "Cart updated successfully",
  "data": {
    "cartId": 1,
    "accountId": 3,
    "items": [
      {
        "dishId": 1,
        "dishName": "Súp bào ngư",
        "imageUrl": "sup_bao_ngu.jpg",
        "unitPrice": 150000.00,
        "quantity": 2,
        "subTotal": 300000.00,
        "isAvailable": true
      },
      {
        "dishId": 2,
        "dishName": "Bò sốt tiêu đen",
        "imageUrl": "bo_tieu_den.jpg",
        "unitPrice": 350000.00,
        "quantity": 1,
        "subTotal": 350000.00,
        "isAvailable": true
      }
    ],
    "totalQuantity": 3,
    "estimatedTotalAmount": 650000.00
  }
}
```

## Response (Error - 400 Bad Request)
```json
{
  "success": false,
  "code": 400,
  "message": "Dish is out of stock or quantity is invalid",
  "errors": null
}
```

---

## Ghi chú nghiệp vụ (Laravel Pivot Handling)
Bảng `MON_AN_GIO_HANG` dùng khóa chính phức hợp `(ma_gio_hang, ma_mon_an)`, Controller sử dụng quan hệ `BelongsToMany` (`$cart->dishes()`):
- **Thêm món:** Nếu đã có trong giỏ → `$cart->dishes()->updateExistingPivot($dishId, ['so_luong' => $newQty])`, nếu chưa → `$cart->dishes()->attach($dishId, ['so_luong' => $qty])`.
- **Xóa món:** `$cart->dishes()->detach($dishId)` — không bao giờ bị lỗi Composite Key.
