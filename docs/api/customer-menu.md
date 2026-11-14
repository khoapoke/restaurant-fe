# THỰC ĐƠN, TÌM KIẾM & GỢI Ý THỜI TIẾT (CUSTOMER MENU APIs)

> 📌 **Tài liệu nghiệp vụ chuyên sâu Backend:** [modules/menu.md](../modules/menu.md)  
> *(Xem chi tiết: Cơ chế Meilisearch Typo-Tolerance, Redis Caching 3600s, Tự động lọc chất dị ứng theo hồ sơ)*  
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md) và danh mục Enum tại [`enums.md`](./enums.md).

---

## 1. Bảng Tổng Hợp Endpoints

| Mã API | Method | Endpoint URL | Phân quyền | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---:|:---|:---:|
| `MNU-01` | `GET` | `/api/v1/customer/categories` | Public | Danh sách danh mục đang hoạt động (Redis Cache 3600s) | `200` |
| `MNU-02` | `GET` | `/api/v1/customer/dishes` | Public | Danh sách món ăn phân trang, lọc theo giá, danh mục, Meilisearch | `200 / 400` |
| `MNU-03` | `GET` | `/api/v1/customer/dishes/{id}` | Public | Xem chi tiết 1 món ăn kèm dị ứng, tag thời tiết | `200 / 404` |
| `MNU-07` | `GET` | `/api/v1/customer/menu/weather-recommendations` | Public | Gợi ý món ăn theo thời tiết thực tế (OpenWeatherMap) | `200 / 422` |
| `MNU-08` | `GET` | `/api/v1/customer/dishes/featured` | Public | Danh sách các món ăn nổi bật / bán chạy | `200` |

---

## 2. Chi Tiết Request & Response

### 2.1. Lấy danh sách danh mục thực đơn (`MNU-01`)
- **Endpoint:** `GET /api/v1/customer/categories`

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "categoryId": 1,
      "categoryName": "Khai vị",
      "description": "Các món gỏi, súp khai vị nhẹ nhàng",
      "isActive": true
    },
    {
      "categoryId": 2,
      "categoryName": "Món chính",
      "description": "Các món thịt bò, hải sản, cơm và mì đặc sản",
      "isActive": true
    }
  ],
  "errors": null
}
```

---

### 2.2. Lấy danh sách món ăn phân trang & tìm kiếm (`MNU-02`)
- **Endpoint:** `GET /api/v1/customer/dishes`
- **Query Parameters:**
  - `keyword`: Tìm kiếm (Meilisearch chịu lỗi chính tả + tiếng Việt không dấu).
  - `categoryId`: Lọc theo ID danh mục.
  - `minPrice`, `maxPrice`: Khoảng giá tìm kiếm.
  - `isAvailable`: Lọc theo trạng thái còn bán (`true`/`false`).
  - `page`: Trang hiện tại (mặc định 1).
  - `perPage`: Số món mỗi trang (mặc định 12).

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Dishes retrieved successfully",
  "data": {
    "items": [
      {
        "dishId": 5,
        "dishName": "Gỏi ngó sen tôm thịt",
        "price": 85000,
        "imageUrl": "https://example.com/images/goi-ngo-sen.jpg",
        "isAvailable": true,
        "category": {
          "categoryId": 1,
          "categoryName": "Khai vị"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "perPage": 12,
      "totalItems": 45,
      "lastPage": 4
    }
  },
  "errors": null
}
```

---

### 2.3. Xem chi tiết món ăn (`MNU-03`)
- **Endpoint:** `GET /api/v1/customer/dishes/{id}`

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Dish details retrieved successfully",
  "data": {
    "dishId": 5,
    "dishName": "Gỏi ngó sen tôm thịt",
    "price": 85000,
    "description": "Ngó sen tươi giòn trộn tôm sú và thịt ba chỉ nước mắm chua ngọt",
    "imageUrl": "https://example.com/images/goi-ngo-sen.jpg",
    "isAvailable": true,
    "allergens": ["SHELLFISH", "PEANUT"],
    "weatherTags": ["HOT_SUNNY", "PLEASANT_NORMAL"],
    "category": {
      "categoryId": 1,
      "categoryName": "Khai vị"
    }
  },
  "errors": null
}
```

#### Response Lỗi (`404 Not Found`):
```json
{
  "success": false,
  "code": 404,
  "message": "Dish not found or has been disabled",
  "data": null,
  "errors": null
}
```

---

### 2.4. Gợi ý món ăn theo thời tiết (`MNU-07`)
- **Endpoint:** `GET /api/v1/customer/menu/weather-recommendations`
- **Query Parameters:**
  - `lat`: Vĩ độ (VD: `10.7769`)
  - `lon`: Kinh độ (VD: `106.7009`)

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Weather recommendations retrieved successfully",
  "data": {
    "weather": {
      "temperature": 32.5,
      "condition": "HOT_SUNNY",
      "description": "Trời nắng gắt, đề xuất các món thanh nhiệt và đồ uống giải khát"
    },
    "dishes": [
      {
        "dishId": 12,
        "dishName": "Trà đào cam sả",
        "price": 45000,
        "imageUrl": "https://example.com/images/tra-dao.jpg",
        "categoryName": "Đồ uống"
      }
    ]
  },
  "errors": null
}
```
