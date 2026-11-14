# QUẢN LÝ DANH MỤC & MÓN ĂN (ADMIN MENU & DISH APIs)

> 📌 **Tài liệu nghiệp vụ chuyên sâu Backend:** [modules/menu.md](../modules/menu.md)  
> *(Xem chi tiết: Nguyên tắc Xóa mềm Soft Delete bảo toàn khóa ngoại `CHI_TIET_DON_HANG`, Chiến lược xóa bộ nhớ đệm Cache Busting `menu:categories:active`)*  
> Middleware bắt buộc: `auth:sanctum`, `account.active`, `role:ADMIN`.  
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md) và danh mục Enum tại [`enums.md`](./enums.md).

---

## 1. Bảng Tổng Hợp Endpoints

### 1.1. Quản lý Danh mục (Category Endpoints)
| Mã API | Method | Endpoint URL | Request Body | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---|:---|:---:|
| `MNU-09` | `POST` | `/api/v1/admin/categories` | `{ "categoryName", "description"? }` | Thêm danh mục mới (Busting Cache) | `201 / 422` |
| `MNU-10` | `PUT` | `/api/v1/admin/categories/{id}` | `{ "categoryName", "description"? }` | Sửa thông tin danh mục | `200 / 404 / 422` |
| `MNU-11` | `PATCH`| `/api/v1/admin/categories/{id}/visibility` | `{ "isVisible": boolean }` | Bật/tắt trạng thái hiển thị danh mục | `200 / 404` |
| `MNU-12` | `DELETE`| `/api/v1/admin/categories/{id}` | *(Không)* | Xóa mềm danh mục (tự động ẩn món bên trong) | `200 / 404` |

### 1.2. Quản lý Món ăn (Dish Endpoints)
| Mã API | Method | Endpoint URL | Request Body | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---|:---|:---:|
| `MNU-04` | `POST` | `/api/v1/admin/dishes` | Schema Create Dish | Tạo món ăn mới vào thực đơn | `201 / 422` |
| `MNU-05` | `PUT` | `/api/v1/admin/dishes/{id}` | Schema Update Dish | Chỉnh sửa chi tiết món ăn | `200 / 404 / 422` |
| `MNU-06` | `DELETE`| `/api/v1/admin/dishes/{id}` | *(Không)* | Xóa mềm món (`da_xoa = true, hien_thi = false`) | `200 / 404` |
| `MNU-13` | `PATCH`| `/api/v1/admin/dishes/{id}/availability` | `{ "isAvailable": boolean }` | Bật/tắt trạng thái Còn hàng / Hết hàng | `200 / 404` |
| `MNU-14` | `PATCH`| `/api/v1/admin/dishes/{id}/visibility` | `{ "isVisible": boolean }` | Bật/tắt Ẩn/Hiện món khỏi thực đơn khách | `200 / 404` |

---

## 2. Chi Tiết Request & Response Món Ăn

### 2.1. Thêm món ăn mới (`MNU-04`)
- **Endpoint:** `POST /api/v1/admin/dishes`
- **Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`, `Accept: application/json`

#### Request Body:
```json
{
  "dishName": "Gà nướng Tây Bắc",
  "price": 280000,
  "description": "Gà ri thả đồi nướng than hoa kèm mắc khén và hạt dổi",
  "imageUrl": "/img/dishes/ga-nuong.jpg",
  "categoryId": 2,
  "isAvailable": true,
  "isVisible": true,
  "allergens": [],
  "weatherTags": ["RAINY_OR_COLD", "PLEASANT_NORMAL"]
}
```

#### Response Thành công (`201 Created` - `AdminDishResource`):
```json
{
  "success": true,
  "code": 201,
  "message": "Dish created successfully",
  "data": {
    "dishId": 18,
    "dishName": "Gà nướng Tây Bắc",
    "price": 280000,
    "description": "Gà ri thả đồi nướng than hoa kèm mắc khén và hạt dổi",
    "imageUrl": "/img/dishes/ga-nuong.jpg",
    "isAvailable": true,
    "isVisible": true,
    "isDeleted": false,
    "allergens": [],
    "weatherTags": ["RAINY_OR_COLD", "PLEASANT_NORMAL"],
    "category": {
      "categoryId": 2,
      "categoryName": "Món chính"
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
  "message": "Validation failed",
  "data": null,
  "errors": {
    "price": ["Giá món ăn phải là số nguyên dương lớn hơn 0."],
    "categoryId": ["Danh mục được chọn không tồn tại trong hệ thống."]
  }
}
```

---

### 2.2. Xóa mềm món ăn (`MNU-06`)
- **Endpoint:** `DELETE /api/v1/admin/dishes/{id}`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "code": 200,
  "message": "Xóa mềm món ăn thành công",
  "data": null,
  "errors": null
}
```
*(Ghi chú: Bản ghi trong CSDL được cập nhật `da_xoa = 1, hien_thi = 0`, tuyệt đối không xóa cứng để bảo vệ khóa ngoại đơn hàng)*
