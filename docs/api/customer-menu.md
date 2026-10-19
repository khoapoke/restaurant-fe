# CUSTOMER — Thực đơn, Tìm kiếm, Lọc & Gợi ý Thời tiết (`Customer\MenuController`)

> **Middleware chung:** `auth:sanctum`, `account.active`, `role:CUSTOMER`
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md)

---

## 1. Xem danh sách danh mục & món ăn có bộ lọc (`MNU-01`, `MNU-02`, `MNU-03`)

### Danh mục
- **Method & URL:** `GET /api/v1/customer/categories`

### Danh sách món ăn
- **Method & URL:** `GET /api/v1/customer/dishes`
- **Query Params:**
  | Param | Type | Required | Mô tả |
  |-------|------|----------|-------|
  | `keyword` | string | ❌ | Tìm kiếm theo `ten_mon_an` |
  | `categoryId` | int | ❌ | Lọc theo `ma_danh_muc` |
  | `minPrice` | numeric | ❌ | Lọc giá tối thiểu |
  | `maxPrice` | numeric | ❌ | Lọc giá tối đa |
  | `isAvailable` | boolean | ❌ | Lọc theo tình trạng còn bán |
  | `excludeAllergens` | string | ❌ | Chuỗi chất dị ứng cách nhau dấu phẩy (VD: `SHELLFISH,PEANUT`) |
  | `page` | int | ❌ | Mặc định `1` |
  | `perPage` | int | ❌ | Mặc định `12` |

- **Response (Success - 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Dishes retrieved successfully",
  "data": {
    "items": [
      {
        "dishId": 2,
        "dishName": "Bò sốt tiêu đen",
        "price": 350000.00,
        "description": "Thịt bò Mỹ mềm ngon kèm sốt tiêu đen đậm đà",
        "imageUrl": "bo_tieu_den.jpg",
        "categoryId": 2,
        "categoryName": "Món chính",
        "isAvailable": true,
        "ingredients": ["Thịt bò Mỹ", "Tiêu đen", "Bơ lạt"],
        "allergens": ["DAIRY"]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "perPage": 12,
      "totalItems": 1,
      "lastPage": 1
    }
  }
}
```
- **Response (Error - 400 Bad Request):**
```json
{
  "success": false,
  "code": 400,
  "message": "minPrice cannot be greater than maxPrice",
  "errors": null
}
```
- **Ghi chú nghiệp vụ:** Sử dụng Eloquent Local Scope `Dish::query()->active()->with('category')->when(...)` để lọc linh hoạt và loại bỏ các món có chứa `excludeAllergens`.

---

## 2. Xem chi tiết món ăn (`MNU-07`)
- **Method & URL:** `GET /api/v1/customer/dishes/{dishId}`
- **Response (Success - 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Dish detail fetched successfully",
  "data": {
    "dishId": 1,
    "dishName": "Súp bào ngư",
    "price": 150000.00,
    "description": "Súp bào ngư thượng hạng giàu dinh dưỡng",
    "imageUrl": "sup_bao_ngu.jpg",
    "category": {
      "categoryId": 1,
      "categoryName": "Khai vị"
    },
    "isAvailable": true,
    "ingredients": ["Bào ngư tươi", "Nấm đông cô", "Trứng gà"],
    "allergens": ["SHELLFISH", "EGG"]
  }
}
```
- **Response (Error - 404 Not Found):**
```json
{
  "success": false,
  "code": 404,
  "message": "Dish not found or unavailable",
  "errors": null
}
```
- **Ghi chú nghiệp vụ:** Truy vấn `Dish::active()->with('category')->findOrFail($dishId)`.

---

## 3. Gợi ý món ăn theo Thời tiết & Tự động loại trừ Dị ứng (Extended Feature)
- **Method & URL:** `GET /api/v1/customer/recommendations/weather`
- **Query Params:** `lat` (numeric, required), `lon` (numeric, required).
- **Response (Success - 200 OK):**
```json
{
  "success": true,
  "code": 200,
  "message": "Weather recommendations generated successfully",
  "data": {
    "weather": {
      "city": "Ho Chi Minh City",
      "temperatureCelsius": 33.8,
      "condition": "HOT_SUNNY",
      "advice": "Trời nắng nóng (33.8°C), ưu tiên các món thanh mát. Đã lọc bỏ món chứa chất gây dị ứng: SHELLFISH, PEANUT."
    },
    "excludedAllergens": ["SHELLFISH", "PEANUT"],
    "recommendedDishes": [
      {
        "dishId": 4,
        "dishName": "Trà đào cam sả",
        "price": 45000.00,
        "imageUrl": "tra_dao.jpg",
        "categoryName": "Đồ uống",
        "allergens": []
      }
    ]
  }
}
```
- **Response (Error - 422 Unprocessable Entity):**
```json
{
  "success": false,
  "code": 422,
  "message": "Coordinates lat and lon are required",
  "errors": {
    "lat": ["The lat field is required."],
    "lon": ["The lon field is required."]
  }
}
```
- **Ghi chú nghiệp vụ:** Dùng `Http::timeout(5)->get('https://api.openweathermap.org/data/2.5/weather', ...)` kết hợp `Cache::remember()` trong 15 phút theo tọa độ làm tròn để tối ưu tốc độ (<3 giây) và loại bỏ 100% món chứa chất dị ứng của khách.
