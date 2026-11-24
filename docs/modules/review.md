# ⭐ ĐẶC TẢ MODULE 10: REVIEW (ĐÁNH GIÁ & NHẬN XÉT MÓN ĂN — MONGODB)

> **Cơ sở dữ liệu:** MongoDB 7 (`database: restaurant_reviews`, `collection: dish_reviews`, Web UI: `http://localhost:8081`)  
> **Base URL:** `/api/v1` *(cũng hỗ trợ alias trực tiếp `/api/...`)*  
> **Chuẩn Envelope:** Mọi API tuân thủ `ApiResponse` (`{ success, code, message, data | errors }`).

---

## 1. Tổng quan & Trách nhiệm Bounded Context
Module `Review` quản lý toàn bộ đánh giá và nhận xét món ăn của thực khách, lưu trữ trên **MongoDB (Document Database)** nhằm tối ưu dữ liệu bán cấu trúc (mảng `tags`, mảng `images`, đối tượng nhúng `adminReply`) và tính điểm trung bình + phân bổ 1–5 sao theo thời gian thực qua **MongoDB Aggregation Pipeline**.

- **Phân hệ Khách hàng (`Public` & `CUSTOMER`):** Xem đánh giá + biểu đồ sao món ăn, viết đánh giá (tự động đối chiếu MySQL gắn huy hiệu **"Đã mua hàng"**), xem lịch sử đánh giá của mình, tự sửa & tự xóa.
- **Phân hệ Quản trị (`ADMIN`, `STAFF`):** Xem danh sách toàn hệ thống kèm thẻ thống kê (`stats`), lọc theo món/sao/trạng thái/chưa phản hồi, gửi phản hồi của quán (`adminReply`), ẩn/hiện đánh giá vi phạm (`VISIBLE`/`HIDDEN`), và xóa spam.

---

## 2. Thành phần Kỹ thuật (`app/Modules/Review/`)
- **Core Client:** `app/Modules/Core/Services/MongoClientService.php` & `config/mongodb.php`
- **Repository:** `app/Modules/Review/Services/ReviewRepository.php` (CRUD MongoDB, Aggregation Pipeline, Index `uniq_account_dish` & `idx_dish_status_created`)
- **Service:** `app/Modules/Review/Services/ReviewService.php`
- **Controllers:**
  - `app/Modules/Review/Http/Controllers/Customer/ReviewController.php`
  - `app/Modules/Review/Http/Controllers/Admin/ReviewController.php`
- **Form Requests:** `CreateReviewRequest`, `UpdateReviewRequest`, `ReplyReviewRequest`, `ToggleReviewVisibilityRequest`
- **Routes:** `app/Modules/Review/Routes/api.php`
- **Artisan Seed Command:** `php artisan mongodb:seed-reviews` (`--fresh` để reset mẫu)

---

## 3. Domain Rules (Quy tắc Nghiệp vụ Bất biến)
1. **Quy tắc Phương án 1A (Đánh giá linh hoạt + Xác thực mua hàng):**
   - Mọi khách hàng đã đăng nhập (`CUSTOMER`) đều được gửi đánh giá, **tối đa 1 đánh giá / 1 món** (gửi trùng trả `409 Conflict`, khách có thể gọi `PUT` để sửa lại đánh giá cũ).
   - Hệ thống tự động kiểm tra MySQL (`DON_HANG.trang_thai = 'Đã giao'` + `CHI_TIET_DON_HANG`): nếu khách đã từng hoàn tất đơn chứa món đó → tự gắn `isVerifiedPurchase: true` và `orderId`; ngược lại `isVerifiedPurchase: false`.
2. **Bảo vệ IDOR:** Khách chỉ được sửa (`REV-04`) hoặc xóa (`REV-05`) đánh giá có `accountId` trùng với chính mình (vi phạm trả `403 Forbidden`).
3. **Kiểm duyệt mềm (`VISIBLE` / `HIDDEN`):** Khi Admin ẩn đánh giá (`HIDDEN`), đánh giá đó lập tức bị loại khỏi danh sách công khai `REV-01` và không còn tính vào `averageRating` / `ratingBreakdown`.
4. **An toàn `ObjectId` & Graceful Fallback:**
   - Truyền `reviewId` không phải chuỗi 24 ký tự hex → trả `404` (không lỗi `500`).
   - Nếu MongoDB tắt: `REV-01` (public) tự fallback trả mảng rỗng & `averageRating: 0` để không sập trang chi tiết món; các API ghi trả `503 Service Unavailable`.

---

## 4. Schema Chuẩn JSON (Dùng Chung Cho Frontend)

### Object `ReviewItem`
```json
{
  "reviewId": "6741a2b3c4d5e6f7a8b9c0d1",
  "dishId": 4,
  "dishName": "Phở bò đặc biệt",
  "accountId": 4,
  "customerName": "Lê Hoàng Hùng",
  "orderId": 12,
  "isVerifiedPurchase": true,
  "rating": 5,
  "comment": "Nước dùng đậm đà, thịt bò tái mềm ngọt!",
  "tags": ["Ngon miệng", "Nóng hổi", "Đóng gói kỹ"],
  "images": ["https://example.com/photo1.jpg"],
  "status": "VISIBLE",
  "adminReply": {
    "staffId": 2,
    "staffName": "Nguyễn Văn Quản Trị",
    "content": "Cảm ơn anh Hùng đã ủng hộ T-ResMK!",
    "repliedAt": "2026-11-24T01:10:00+07:00"
  },
  "createdAt": "2026-11-24T01:05:00+07:00",
  "updatedAt": "2026-11-24T01:10:00+07:00"
}
```
*(Nếu quán chưa trả lời thì `adminReply` là `null`.)*

---

## 5. Chi Tiết 9 API Endpoints Cho Frontend

### Bảng Tóm Tắt Nhanh

| Mã | Method | Endpoint | Phân quyền | Mô tả |
| :---: | :---: | :--- | :---: | :--- |
| `REV-01` | `GET` | `/api/v1/customer/dishes/{dishId}/reviews` | Public | Danh sách đánh giá `VISIBLE` + `summary` điểm sao |
| `REV-02` | `POST` | `/api/v1/customer/dishes/{dishId}/reviews` | `CUSTOMER` | Gửi đánh giá mới cho món ăn |
| `REV-03` | `GET` | `/api/v1/customer/reviews/my` | `CUSTOMER` | Lịch sử đánh giá của tôi |
| `REV-04` | `PUT` | `/api/v1/customer/reviews/{reviewId}` | `CUSTOMER` | Sửa đánh giá của chính mình |
| `REV-05` | `DELETE` | `/api/v1/customer/reviews/{reviewId}` | `CUSTOMER` | Xóa đánh giá của chính mình |
| `REV-06` | `GET` | `/api/v1/admin/reviews` | `ADMIN,STAFF` | Quản lý toàn bộ đánh giá + bộ lọc + `stats` |
| `REV-07` | `POST` | `/api/v1/admin/reviews/{reviewId}/reply` | `ADMIN,STAFF` | Phản hồi đánh giá của khách |
| `REV-08` | `PATCH` | `/api/v1/admin/reviews/{reviewId}/visibility` | `ADMIN,STAFF` | Ẩn / Hiện đánh giá (`VISIBLE` ↔ `HIDDEN`) |
| `REV-09` | `DELETE` | `/api/v1/admin/reviews/{reviewId}` | `ADMIN,STAFF` | Xóa vĩnh viễn đánh giá |

---

### `REV-01`: Xem Đánh Giá & Điểm Sao Món Ăn (Public)
- **URL:** `GET /api/v1/customer/dishes/{dishId}/reviews`
- **Query Params (tùy chọn):**
  - `page` (int, mặc định `1`), `perPage` (int, mặc định `10`, tối đa `50`)
  - `rating` (`1` | `2` | `3` | `4` | `5`): Lọc theo số sao
  - `hasImages` (`true` | `false`): Chỉ xem đánh giá có ảnh
  - `sort` (`newest` | `oldest` | `highest` | `lowest`, mặc định `newest`)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Lấy danh sách đánh giá món ăn thành công.",
    "data": {
      "dishId": 4,
      "dishName": "Phở bò đặc biệt",
      "summary": {
        "averageRating": 4.5,
        "totalReviews": 2,
        "ratingBreakdown": { "5": 1, "4": 1, "3": 0, "2": 0, "1": 0 }
      },
      "items": [ /* ReviewItem[] */ ],
      "pagination": {
        "currentPage": 1,
        "perPage": 10,
        "totalItems": 2,
        "lastPage": 1,
        "totalPages": 1
      }
    }
  }
  ```
- **Lỗi:** `404` nếu `dishId` không tồn tại trong `MON_AN`.

---

### `REV-02`: Khách Gửi Đánh Giá Mới
- **URL:** `POST /api/v1/customer/dishes/{dishId}/reviews`
- **Headers:** `Authorization: Bearer <customer_token>`
- **Request Body:**
  ```json
  {
    "rating": 5,
    "comment": "Nước dùng đậm đà, thịt bò mềm rất ngon!",
    "tags": ["Ngon miệng", "Nóng hổi"],
    "images": [],
    "orderId": 12
  }
  ```
- **Validation Rules:**
  - `rating`: bắt buộc, số nguyên `1..5`
  - `comment`: bắt buộc, chuỗi `3..1000` ký tự
  - `tags`: tùy chọn, mảng tối đa `6` phần tử, mỗi phần tử $\le 50$ ký tự
  - `images`: tùy chọn, mảng tối đa `5` URL hợp lệ ($\le 500$ ký tự)
  - `orderId`: tùy chọn, số nguyên $\ge 1$
- **Response:** `201 Created` trả về object `ReviewItem`.
- **Lỗi:** `401` (chưa đăng nhập), `404` (món không tồn tại/bị ẩn), `409` (khách đã đánh giá món này rồi), `422` (lỗi validate), `503` (MongoDB offline).

---

### `REV-03`: Lịch Sử Đánh Giá Của Tôi
- **URL:** `GET /api/v1/customer/reviews/my?page=1&perPage=10`
- **Headers:** `Authorization: Bearer <customer_token>`
- **Response `200 OK`:** `data: { items: ReviewItem[], pagination: {...} }`.

---

### `REV-04` & `REV-05`: Khách Tự Sửa / Xóa Đánh Giá
- **Sửa:** `PUT /api/v1/customer/reviews/{reviewId}`
  - **Body (gửi trường muốn đổi):** `{ "rating": 5, "comment": "...", "tags": [...], "images": [...] }`
  - **Response:** `200 OK` trả về `ReviewItem` mới nhất.
- **Xóa:** `DELETE /api/v1/customer/reviews/{reviewId}`
  - **Response:** `200 OK` với `data: { "reviewId": "...", "deleted": true }`.
- **Lỗi:** `403` (không phải chủ sở hữu), `404` (không tìm thấy hoặc `reviewId` sai định dạng).

---

### `REV-06`: Danh Sách Đánh Giá Quản Trị & Thống Kê
- **URL:** `GET /api/v1/admin/reviews`
- **Headers:** `Authorization: Bearer <admin_or_staff_token>`
- **Query Params (tùy chọn):** `dishId`, `rating` (`1..5`), `status` (`VISIBLE` | `HIDDEN`), `hasReply` (`true` | `false`), `search` (hoặc `keyword`), `page`, `perPage`.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Lấy danh sách đánh giá toàn hệ thống thành công.",
    "data": {
      "stats": {
        "totalReviews": 8,
        "visibleCount": 8,
        "hiddenCount": 0,
        "repliedCount": 3,
        "averageRating": 4.5
      },
      "items": [ /* ReviewItem[] */ ],
      "pagination": {
        "currentPage": 1,
        "perPage": 10,
        "totalItems": 8,
        "lastPage": 1,
        "totalPages": 1
      }
    }
  }
  ```

---

### `REV-07`: Admin/Staff Phản Hồi Đánh Giá
- **URL:** `POST /api/v1/admin/reviews/{reviewId}/reply`
- **Request Body:** `{ "content": "Cảm ơn quý khách đã ủng hộ nhà hàng ạ!" }` *(2..1000 ký tự)*
- **Response:** `200 OK` trả về `ReviewItem` đã nhúng `adminReply`.

---

### `REV-08` & `REV-09`: Admin/Staff Ẩn/Hiện & Xóa Đánh Giá
- **Ẩn / Hiện:** `PATCH /api/v1/admin/reviews/{reviewId}/visibility`
  - **Body (tùy chọn):** `{ "status": "HIDDEN" }` hoặc `{ "isVisible": false }` *(nếu gửi body rỗng `{}` sẽ tự động đảo trạng thái `VISIBLE` ↔ `HIDDEN`)*.
  - **Response:** `200 OK` trả về `ReviewItem` với `status` mới.
- **Xóa vĩnh viễn:** `DELETE /api/v1/admin/reviews/{reviewId}`
  - **Response:** `200 OK` với `data: { "reviewId": "...", "deleted": true }`.

---

## 6. Gợi Ý Thẻ Cảm Nhận (Tags) Gợi Mở Cho Giao Diện FE
FE có thể cung cấp sẵn danh sách tag gợi ý để khách bấm chọn nhanh (hoặc tự nhập):
```js
export const REVIEW_TAG_SUGGESTIONS = [
  'Ngon miệng',
  'Nóng hổi',
  'Đóng gói kỹ',
  'Đầy đặn',
  'Vừa miệng',
  'Giao nhanh',
  'Đáng tiền',
  'Tươi ngon',
]
```
