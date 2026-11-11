# Module Gợi ý Món ăn (Recommendation Module - Neo4j Graph & AI)

## 1. Giới thiệu
Module Recommendation sử dụng cơ sở dữ liệu đồ thị **Neo4j** kết hợp các thuật toán học máy:
- **Market Basket Analysis (MBA):** Phân tích các món thường xuyên xuất hiện cùng nhau trong cùng một đơn hàng (`-[:INCLUDES]->`).
- **Collaborative Filtering:** Gợi ý các món ăn dựa trên sự tương đồng về hành vi ẩm thực giữa các khách hàng (`(me)-[:ORDERED]->(o)-[:INCLUDES]->(d)<-[:INCLUDES]-(o2)<-[:ORDERED]-(other)`).
- **Graceful Fallback:** Tự động bổ sung các món cùng danh mục hoặc món thịnh hành từ CSDL quan hệ SQL Server khi dữ liệu đồ thị chưa đủ số lượng `limit`.

---

## 2. Danh sách Endpoints

### 2.1. Gợi ý món ăn thường được gọi cùng (Paired Dishes)
- **Endpoint:** `GET /api/v1/customer/dishes/{dishId}/recommendations/graph`
- **Quyền truy cập:** Công khai (Public - Không cần đăng nhập)
- **Tham số Query:**
  - `limit` (tùy chọn, mặc định: 4, min: 1, max: 20)

**Cấu trúc Phản hồi Thành công (HTTP 200):**
```json
{
  "success": true,
  "message": "Graph recommendations retrieved successfully",
  "data": [
    {
      "dishId": 12,
      "dishName": "Khoai tây chiên giòn",
      "price": 45000,
      "imageUrl": "/img/veggie-burger.jpg",
      "categoryName": "Khai vị",
      "pairedCount": 15,
      "source": "neo4j_graph"
    },
    {
      "dishId": 8,
      "dishName": "Bò Fuji sốt tiêu đen",
      "price": 280000,
      "imageUrl": "/img/steak-frites.jpg",
      "categoryName": "Món chính",
      "pairedCount": 0,
      "source": "catalog_supplement"
    }
  ]
}
```

---

### 2.2. Gợi ý món cá nhân hóa theo khẩu vị (Personalized Recommendations)
- **Endpoint:** `GET /api/v1/customer/recommendations/personalized`
- **Quyền truy cập:** Khách hàng đã đăng nhập (`auth:sanctum`, `role:CUSTOMER`, `account.active`)
- **Tham số Query:**
  - `limit` (tùy chọn, mặc định: 5, min: 1, max: 20)

**Cấu trúc Phản hồi Thành công (HTTP 200):**
```json
{
  "success": true,
  "message": "Personalized recommendations generated successfully",
  "data": [
    {
      "dishId": 5,
      "dishName": "Mì Ý Carbonara chuẩn vị Rome",
      "price": 165000,
      "imageUrl": "/img/spaghetti-carbonara.jpg",
      "categoryName": "Món chính",
      "affinityScore": 6,
      "source": "neo4j_collaborative"
    },
    {
      "dishId": 3,
      "dishName": "Salad Caesar gà nướng",
      "price": 120000,
      "imageUrl": "/img/caesar-salad.jpg",
      "categoryName": "Khai vị",
      "affinityScore": 0,
      "source": "trending_supplement"
    }
  ]
}
```

---

### 2.3. Thống kê dữ liệu đồ thị Neo4j (Graph Statistics)
- **Endpoint:** `GET /api/v1/customer/recommendations/graph-stats`
- **Quyền truy cập:** Công khai (Public)
- **Mục đích:** Kiểm tra trạng thái đồng bộ dữ liệu và số nút/mối quan hệ trong Neo4j.

**Cấu trúc Phản hồi Thành công (HTTP 200):**
```json
{
  "success": true,
  "message": "Graph database statistics retrieved successfully",
  "data": {
    "customers": 24,
    "dishes": 38,
    "categories": 6,
    "orders": 85,
    "includesRelationships": 240,
    "orderedRelationships": 85
  }
}
```

