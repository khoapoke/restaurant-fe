# QUẢN LÝ GIỎ HÀNG (CUSTOMER CART APIs)

> 📌 **Tài liệu nghiệp vụ chuyên sâu Backend:** [modules/cart.md](../modules/cart.md)  
> *(Xem chi tiết: Xử lý Pivot Composite Key `MON_AN_GIO_HANG`, cơ chế tự động khởi tạo Cart qua firstOrCreate)*  
> Middleware bắt buộc: `auth:sanctum`, `role:CUSTOMER`.  
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md) và danh mục Enum tại [`enums.md`](./enums.md).

---

## 1. Bảng Tổng Hợp Endpoints

| Mã API | Method | Endpoint URL | Request Body | Response Payload | Mã HTTP |
|:---:|:---:|:---|:---|:---|:---:|
| `CRT-01` | `GET` | `/api/v1/customer/cart` | *(Không)* | `CartResource` | `200 / 401` |
| `CRT-02` | `POST` | `/api/v1/customer/cart/items` | `{ "dishId": int, "quantity": int >= 1 }` | `CartResource` (cộng dồn số lượng) | `200 / 400 / 422` |
| `CRT-03` | `PUT` | `/api/v1/customer/cart/items/{dishId}` | `{ "quantity": int >= 0 }` | `CartResource` (nếu qty = 0 tự xóa) | `200 / 400 / 422` |
| `CRT-04` | `DELETE`| `/api/v1/customer/cart/items/{dishId}` | *(Không)* | `CartResource` đã trừ món | `200 / 404` |
| `CRT-05` | `DELETE`| `/api/v1/customer/cart/clear` | *(Không)* | `{ "message": "Cart cleared successfully" }` | `200` |

---

## 2. Chi Tiết Request & Response

### 2.1. Tra cứu giỏ hàng hiện tại (`CRT-01`)
- **Endpoint:** `GET /api/v1/customer/cart`
- **Headers:** `Authorization: Bearer <token>`, `Accept: application/json`

#### Response Thành công (`200 OK` - `CartResource`):
```json
{
  "success": true,
  "code": 200,
  "message": "Cart retrieved successfully",
  "data": {
    "cartId": 10,
    "items": [
      {
        "dishId": 5,
        "dishName": "Gỏi ngó sen tôm thịt",
        "price": 85000,
        "quantity": 2,
        "itemTotal": 170000,
        "imageUrl": "https://example.com/images/goi-ngo-sen.jpg",
        "isAvailable": true
      }
    ],
    "totalItems": 1,
    "totalQuantity": 2,
    "estimatedTotal": 170000
  },
  "errors": null
}
```

---

### 2.2. Thêm món vào giỏ hàng (`CRT-02`)
- **Endpoint:** `POST /api/v1/customer/cart/items`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`, `Accept: application/json`

#### Request Body:
```json
{
  "dishId": 5,
  "quantity": 2
}
```

#### Response Thành công (`200 OK`): Trả về `CartResource` đã cập nhật.

#### Response Lỗi (`400 Bad Request`):
```json
{
  "success": false,
  "code": 400,
  "message": "Món ăn hiện không còn bán hoặc đã bị ngừng phục vụ",
  "data": null,
  "errors": null
}
```

---

### 2.3. Cập nhật số lượng món ăn (`CRT-03`)
- **Endpoint:** `PUT /api/v1/customer/cart/items/{dishId}`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`, `Accept: application/json`

#### Request Body:
```json
{
  "quantity": 3
}
```
*(Nếu gửi `quantity: 0`, hệ thống sẽ tự động detach món ra khỏi giỏ)*

---

### 2.4. Xóa món ăn khỏi giỏ hàng (`CRT-04`)
- **Endpoint:** `DELETE /api/v1/customer/cart/items/{dishId}`
- **Response (`200 OK`):** Trả về `CartResource` sau khi đã xóa món.

---

### 2.5. Làm rỗng giỏ hàng (`CRT-05`)
- **Endpoint:** `DELETE /api/v1/customer/cart/clear`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "code": 200,
  "message": "Cart cleared successfully",
  "data": null,
  "errors": null
}
```
