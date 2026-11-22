# 🕸️ MODULE: RECOMMENDATION – Business Logic & API Spec

> **Vị trí thư mục:** `app/Modules/Recommendation/`  
> **Namespace:** `App\Modules\Recommendation\`  
> **Kiến trúc:** Polyglot Persistence (MySQL 8.0 + Neo4j Graph DB Bolt 7687 + Redis)  
> **Phiên bản:** 2.0 (Streamlined Edition)

---

## 1. Tổng quan & Trách nhiệm

Module **Recommendation** là động cơ trí tuệ đề xuất món ăn thông minh:
- **Market Basket Analysis (GRA-01):** Phân tích giỏ hàng đồng xuất hiện trong lịch sử đơn hàng để gợi ý món bán kèm (Cross-sell).
- **Collaborative Filtering (GRA-02):** Khai phá đồ thị tìm kiếm nhóm khách hàng có khẩu vị tương đồng để đề xuất cá nhân hóa.
- **Graph Statistics (GRA-03):** Đo lường quy mô đồ thị (Nodes & Relationships).
- **Graceful Fallback:** Khi Neo4j timeout/ngắt kết nối, tự động fallback truy vấn MySQL (cùng danh mục) mà không làm sập ứng dụng.

---

## 2. Thành phần kỹ thuật

| Thành phần | Lớp / Đường dẫn thực tế | Trách nhiệm |
| :--- | :--- | :--- |
| **Services** | `Neo4jClientService`<br>`DishRecommendationService` | Quản lý kết nối Bolt 7687, thực thi Cypher queries, Fallback MySQL, ghi nhận đơn hàng vào đồ thị (`recordOrder`). |
| **Controller**| `Customer\RecommendationController` | Tiếp nhận request và trả về chuẩn `ApiResponse`. |
| **Command** | `SyncGraphDataCommand` (`php artisan neo4j:sync`) | Đồng bộ toàn bộ dữ liệu MySQL sang đồ thị Neo4j. |
| **Config** | `config/neo4j.php` | Tham số kết nối Bolt: host, port (7687), username, password. |
| **Routes** | `app/Modules/Recommendation/Routes/api.php` | Định tuyến `/api/v1/customer/recommendations/*`. |

---

## 3. Domain Rules & Cypher Queries

### 3.1. Cô Lập Ngoại Lệ & Graceful Fallback (Non-blocking Guarantee)
- Mọi truy vấn Neo4j đều được bọc trong khối `try ... catch (\Throwable $e)`.
- Nếu Neo4j gặp sự cố $\rightarrow$ ghi log `Log::warning` và tự động bù đắp bằng các món cùng danh mục từ MySQL với cờ `"source": "catalog_supplement"`. Tuyệt đối không làm chết request của khách hàng.

### 3.2. Thuật Toán Gợi Ý Món Bán Kèm (Market Basket Analysis - GRA-01)
```cypher
MATCH (target:Dish {dishId: $dishId})<-[:INCLUDES]-(o:Order)-[:INCLUDES]->(rec:Dish)
WHERE rec.dishId <> $dishId
RETURN rec.dishId AS dishId,
       rec.name AS dishName,
       rec.price AS price,
       rec.imageUrl AS imageUrl,
       rec.categoryName AS categoryName,
       count(o) AS pairedCount
ORDER BY pairedCount DESC, rec.dishId ASC
LIMIT $limit
```

### 3.3. Thuật Toán Lọc Cộng Tác Cá Nhân Hóa (Collaborative Filtering - GRA-02)
```cypher
MATCH (me:Customer {customerId: $customerId})-[:ORDERED]->(:Order)-[:INCLUDES]->(d:Dish)
MATCH (other:Customer)-[:ORDERED]->(:Order)-[:INCLUDES]->(d)
WHERE other.customerId <> me.customerId
MATCH (other)-[:ORDERED]->(:Order)-[:INCLUDES]->(rec:Dish)
WHERE NOT (me)-[:ORDERED]->(:Order)-[:INCLUDES]->(rec)
RETURN rec.dishId AS dishId,
       rec.name AS dishName,
       rec.price AS price,
       rec.imageUrl AS imageUrl,
       rec.categoryName AS categoryName,
       count(DISTINCT other) AS affinityScore
ORDER BY affinityScore DESC, rec.dishId ASC
LIMIT $limit
```
> [!NOTE]
> **Lưu ý hiện trạng:** `DishRecommendationService::getPersonalizedRecommendations()` hiện thực hiện lọc cộng tác theo lịch sử đơn hàng và fallback `trending_supplement` từ MySQL; **chưa tự động lọc `userProfile.allergies`** (chức năng lọc dị ứng hiện nằm tại `Menu` Weather/Filter).

---

## 4. Schemas Dữ Liệu Chuẩn Dành Cho Frontend

### Schema 4.1: Gợi Ý Món Bán Kèm (`GRA-01` — Trả Mảng Phẳng trong `data`)
```json
[
  {
    "dishId": 12,
    "dishName": "Trà đào cam sả",
    "price": 45000,
    "imageUrl": "/img/tra-dao.jpg",
    "categoryName": "Đồ uống",
    "pairedCount": 15,
    "source": "neo4j_graph"
  }
]
```
*(Fallback MySQL trả `"pairedCount": 0, "source": "catalog_supplement"`.)*

### Schema 4.2: Gợi Ý Cá Nhân Hóa (`GRA-02` — Trả Mảng Phẳng trong `data`)
```json
[
  {
    "dishId": 8,
    "dishName": "Lẩu hải sản chua cay",
    "price": 280000,
    "imageUrl": "/img/lau-hai-san.jpg",
    "categoryName": "Lẩu & Nướng",
    "affinityScore": 4,
    "source": "neo4j_collaborative"
  }
]
```
*(Fallback MySQL khi khách chưa có đơn hàng trước đó trả `"affinityScore": 0, "source": "trending_supplement"`.)*

---

## 5. Bảng Tổng Hợp 3 Endpoints Đồ Thị Neo4j

| Mã API | Method | Endpoint URL | Phân quyền | Query Parameters | Response Payload | Mã HTTP |
| :---: | :---: | :--- | :---: | :--- | :--- | :---: |
| `GRA-01` | `GET` | `/api/v1/customer/dishes/{dishId}/recommendations/graph` | Public | Query: `limit` (mặc định `4`) | Mảng phẳng món bán kèm (Schema 4.1) | `200` |
| `GRA-02` | `GET` | `/api/v1/customer/recommendations/personalized` | `CUSTOMER` | Query: `limit` (mặc định `5`) | Mảng phẳng món gợi ý cá nhân hóa (Schema 4.2) | `200` |
| `GRA-03` | `GET` | `/api/v1/customer/recommendations/graph-stats` | Public | *(Không)* | `{ "customers", "dishes", "categories", "orders", "includesRelationships", "orderedRelationships" }` | `200` |
