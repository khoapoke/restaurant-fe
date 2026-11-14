# GỢI Ý MÓN ĂN THÔNG MINH (NEO4J GRAPH & AI RECOMMENDATION APIs)

> 📌 **Tài liệu nghiệp vụ chuyên sâu Backend:** [modules/recommendation.md](../modules/recommendation.md)  
> *(Xem chi tiết: Câu truy vấn Cypher, Thuật toán Market Basket & Collaborative Filtering, Graceful Fallback MySQL)*  
> Xem quy ước chung tại [`_conventions.md`](./_conventions.md) và danh mục Enum tại [`enums.md`](./enums.md).

---

## 1. Bảng Tổng Hợp Endpoints

| Mã API | Method | Endpoint URL | Phân quyền | Mô tả chức năng | Mã HTTP |
|:---:|:---:|:---|:---:|:---|:---:|
| `GRA-01` | `GET` | `/api/v1/customer/dishes/{dishId}/recommendations/graph` | Public | Gợi ý món bán kèm (Cross-sell qua Market Basket Analysis) | `200 / 404` |
| `GRA-02` | `GET` | `/api/v1/customer/recommendations/personalized` | `CUSTOMER` | Gợi ý món cá nhân hóa theo khẩu vị (Collaborative Filtering) | `200 / 401` |
| `GRA-03` | `GET` | `/api/v1/customer/recommendations/graph-stats` | Public | Thống kê số lượng Nodes & Relationships trên đồ thị Neo4j | `200` |

---

## 2. Chi Tiết Request & Response

### 2.1. Gợi ý món ăn bán kèm theo món đang xem (`GRA-01`)
- **Endpoint:** `GET /api/v1/customer/dishes/{dishId}/recommendations/graph`
- **Query Parameters:** `limit` (mặc định 4)

#### Response Thành công (`200 OK` - `CrossSellResponse`):
```json
{
  "success": true,
  "code": 200,
  "message": "Graph recommendations retrieved successfully",
  "data": {
    "targetDishId": 5,
    "source": "neo4j_graph",
    "recommendations": [
      {
        "dishId": 12,
        "dishName": "Trà đào cam sả",
        "price": 45000,
        "imageUrl": "https://example.com/images/tra-dao.jpg",
        "score": 15,
        "recommendationReason": "Thường được gọi cùng món này trong các đơn hàng trước"
      }
    ]
  },
  "errors": null
}
```

---

### 2.2. Gợi ý món cá nhân hóa theo lịch sử dùng món (`GRA-02`)
- **Endpoint:** `GET /api/v1/customer/recommendations/personalized`
- **Headers:** `Authorization: Bearer <token>`, `Accept: application/json`
- **Query Parameters:** `limit` (mặc định 6)

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Personalized recommendations generated successfully",
  "data": [
    {
      "dishId": 5,
      "dishName": "Mì Ý Carbonara chuẩn vị Rome",
      "price": 165000,
      "imageUrl": "https://example.com/images/spaghetti.jpg",
      "categoryName": "Món chính",
      "affinityScore": 6,
      "source": "neo4j_collaborative"
    }
  ],
  "errors": null
}
```

---

### 2.3. Thống kê quy mô đồ thị Neo4j (`GRA-03`)
- **Endpoint:** `GET /api/v1/customer/recommendations/graph-stats`

#### Response Thành công (`200 OK`):
```json
{
  "success": true,
  "code": 200,
  "message": "Graph statistics retrieved successfully",
  "data": {
    "customers": 24,
    "dishes": 38,
    "categories": 6,
    "orders": 85,
    "includesRelationships": 240,
    "orderedRelationships": 85
  },
  "errors": null
}
```
