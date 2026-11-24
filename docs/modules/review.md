# ⭐ ĐẶC TẢ MODULE 10: REVIEW (ĐÁNH GIÁ & NHẬN XÉT MÓN ĂN — MONGODB)

> **Cơ sở dữ liệu:** MongoDB 7 (`database: restaurant_reviews`, `collection: dish_reviews`, Web UI: `http://localhost:8081`)  
> **Base URL:** `/api/v1` *(cũng hỗ trợ alias trực tiếp `/api/...`)*  
> **Chuẩn Envelope:** Mọi API tuân thủ `ApiResponse` (`{ success, code, message, data | errors }`).

---

## 1. Tổng quan & Trách nhiệm Bounded Context
Module `Review` quản lý toàn bộ đánh giá và nhận xét món ăn của thực khách, lưu trữ trên **MongoDB (Document Database)** nhằm tối ưu dữ liệu bán cấu trúc (mảng `tags`, mảng `images`, đối tượng nhúng `adminReply`) và tính điểm trung bình + phân bổ 1–5 sao theo thời gian thực qua **MongoDB Aggregation Pipeline**.

- **Phân hệ Khách hàng (`Public` & `CUSTOMER`):** Xem đánh giá + biểu đồ sao món ăn, viết đánh giá (tự động đối chiếu MySQL gắn huy hiệu **"Đã mua hàng"**), xem lịch sử đánh giá của mình, tự sửa & tự xóa.
- **Phân hệ Khách hàng (`Public` & `CUSTOMER`):** Xem đánh giá + biểu đồ sao món ăn, viết đánh giá (tự động đối chiếu MySQL gắn huy hiệu **"Đã mua hàng"** và tự động kiểm duyệt ngôn từ), xem lịch sử đánh giá của mình, tự sửa & tự xóa.
- **Phân hệ Quản trị (`ADMIN`, `STAFF`):** Xem danh sách toàn hệ thống kèm thẻ thống kê (`stats`), lọc theo món/sao/trạng thái/chưa phản hồi/vi phạm ngôn từ, **lọc riêng hàng đợi bình luận tục tĩu/không phù hợp (`REV-10`)**, **ẩn hàng loạt bình luận vi phạm (`REV-11`)**, gửi phản hồi của quán (`adminReply`), ẩn/hiện đánh giá (`VISIBLE`/`HIDDEN`), và xóa spam.

---

## 2. Thành phần Kỹ thuật (`app/Modules/Review/`)
- **Core Client:** `app/Modules/Core/Services/MongoClientService.php` & `config/mongodb.php`
- **Moderation Config & Rule Engine:** `config/review_moderation.php` & `app/Modules/Review/Services/ReviewModerationService.php`
- **Repository:** `app/Modules/Review/Services/ReviewRepository.php` (CRUD MongoDB, Aggregation Pipeline, Indexes `uniq_account_dish`, `idx_dish_status_created`, `idx_moderation_flagged`)
- **Service:** `app/Modules/Review/Services/ReviewService.php`
- **Controllers:**
  - `app/Modules/Review/Http/Controllers/Customer/ReviewController.php`
  - `app/Modules/Review/Http/Controllers/Admin/ReviewController.php`
- **Form Requests:** `CreateReviewRequest`, `UpdateReviewRequest`, `ReplyReviewRequest`, `ToggleReviewVisibilityRequest`
- **Routes:** `app/Modules/Review/Routes/api.php`
- **Artisan Seed Command:** `php artisan mongodb:seed-reviews` (`--fresh` để reset mẫu, `--with-flagged` để thêm 2 mẫu vi phạm demo lọc)

---

## 3. Domain Rules (Quy tắc Nghiệp vụ Bất biến)
1. **Quy tắc Phương án 1A (Đánh giá linh hoạt + Xác thực mua hàng):**
   - Mọi khách hàng đã đăng nhập (`CUSTOMER`) đều được gửi đánh giá, **tối đa 1 đánh giá / 1 món** (gửi trùng trả `409 Conflict`, khách có thể gọi `PUT` để sửa lại đánh giá cũ).
   - Hệ thống tự động kiểm tra MySQL (`DON_HANG.trang_thai = 'Đã giao'` + `CHI_TIET_DON_HANG`): nếu khách đã từng hoàn tất đơn chứa món đó → tự gắn `isVerifiedPurchase: true` và `orderId`; ngược lại `isVerifiedPurchase: false`.
2. **Bảo vệ IDOR:** Khách chỉ được sửa (`REV-04`) hoặc xóa (`REV-05`) đánh giá có `accountId` trùng với chính mình (vi phạm trả `403 Forbidden`).
3. **Kiểm duyệt ngôn từ tục tĩu tự động (Rule Engine 1A + 2A):**
   - Mọi bình luận khi tạo (`REV-02`) hoặc chỉnh sửa (`REV-04`) đều được quét tự động qua `ReviewModerationService` (hỗ trợ tiếng Việt có dấu, không dấu, từ che ký tự lách luật như `đ.m`, `v*l`, `f*ck`, spam URL và chống bắt nhầm từ ẩm thực như `bún`, `đủ`, `lớn`, `cắt`, `500cc`).
   - **Mức `HIGH` (tục tĩu/chửi thề nặng):** Tự động đặt `status = "HIDDEN"` ngay lập tức (không hiển thị công khai) và gắn `moderation.isFlagged = true` để Admin xem trong `REV-10`.
   - **Mức `MEDIUM` / `LOW` (xúc phạm/công kích/spam):** Giữ `status = "VISIBLE"` kèm cờ `moderation.isFlagged = true` để Admin kiểm duyệt qua `REV-10` hoặc ẩn hàng loạt bằng `REV-11`.
4. **Kiểm duyệt mềm (`VISIBLE` / `HIDDEN`):** Khi Admin ẩn đánh giá (`HIDDEN`), đánh giá đó lập tức bị loại khỏi danh sách công khai `REV-01` và không còn tính vào `averageRating` / `ratingBreakdown`.
5. **An toàn `ObjectId` & Graceful Fallback:**
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
  "moderation": {
    "isFlagged": false,
    "severity": "NONE",
    "categories": [],
    "matchedTerms": [],
    "reason": null,
    "checkedBy": "RULE_ENGINE",
    "checkedAt": "2026-11-24T15:05:00+07:00"
  },
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
*(Nếu quán chưa trả lời thì `adminReply` là `null`. Giá trị `moderation.severity` gồm `NONE` | `LOW` | `MEDIUM` | `HIGH`; `moderation.categories` gồm `PROFANITY` | `INSULT` | `SPAM`.)*

---

## 5. Chi Tiết 11 API Endpoints Cho Frontend

### Bảng Tóm Tắt Nhanh

| Mã | Method | Endpoint | Phân quyền | Mô tả |
| :---: | :---: | :--- | :---: | :--- |
| `REV-01` | `GET` | `/api/v1/customer/dishes/{dishId}/reviews` | Public | Danh sách đánh giá `VISIBLE` + `summary` điểm sao |
| `REV-02` | `POST` | `/api/v1/customer/dishes/{dishId}/reviews` | `CUSTOMER` | Gửi đánh giá mới (tự kiểm duyệt & tự ẩn nếu mức `HIGH`) |
| `REV-03` | `GET` | `/api/v1/customer/reviews/my` | `CUSTOMER` | Lịch sử đánh giá của tôi |
| `REV-04` | `PUT` | `/api/v1/customer/reviews/{reviewId}` | `CUSTOMER` | Sửa đánh giá của chính mình (tự quét lại ngôn từ) |
| `REV-05` | `DELETE` | `/api/v1/customer/reviews/{reviewId}` | `CUSTOMER` | Xóa đánh giá của chính mình |
| `REV-06` | `GET` | `/api/v1/admin/reviews` | `ADMIN,STAFF` | Quản lý toàn bộ đánh giá + bộ lọc (`isFlagged`, `severity`...) + `stats` |
| `REV-07` | `POST` | `/api/v1/admin/reviews/{reviewId}/reply` | `ADMIN,STAFF` | Phản hồi đánh giá của khách |
| `REV-08` | `PATCH` | `/api/v1/admin/reviews/{reviewId}/visibility` | `ADMIN,STAFF` | Ẩn / Hiện đánh giá (`VISIBLE` ↔ `HIDDEN`) |
| `REV-09` | `DELETE` | `/api/v1/admin/reviews/{reviewId}` | `ADMIN,STAFF` | Xóa vĩnh viễn đánh giá |
| `REV-10` | `GET` | `/api/v1/admin/reviews/flagged` | `ADMIN,STAFF` | **Lọc danh sách bình luận tục tĩu / ngôn từ không phù hợp + `summary`** |
| `REV-11` | `POST` | `/api/v1/admin/reviews/flagged/auto-hide` | `ADMIN,STAFF` | **Ẩn hàng loạt bình luận vi phạm đang hiển thị (`VISIBLE` → `HIDDEN`)** |

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
- **Query Params (tùy chọn):** `dishId`, `rating` (`1..5`), `status` (`VISIBLE` | `HIDDEN`), `hasReply` (`true` | `false`), `isFlagged` (`true` | `false`), `severity` (`HIGH` | `MEDIUM` | `LOW`), `category` (`PROFANITY` | `INSULT` | `SPAM`), `search` (hoặc `keyword`), `page`, `perPage`.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Lấy danh sách đánh giá toàn hệ thống thành công.",
    "data": {
      "stats": {
        "totalReviews": 10,
        "visibleCount": 9,
        "hiddenCount": 1,
        "repliedCount": 3,
        "flaggedCount": 2,
        "averageRating": 3.8
      },
      "items": [ /* ReviewItem[] */ ],
      "pagination": {
        "currentPage": 1,
        "perPage": 10,
        "totalItems": 10,
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

### `REV-10`: Lọc Danh Sách Bình Luận Tục Tĩu / Ngôn Từ Không Phù Hợp
- **URL:** `GET /api/v1/admin/reviews/flagged`
- **Headers:** `Authorization: Bearer <admin_or_staff_token>`
- **Query Params (tùy chọn):**
  - `severity`: `HIGH` | `MEDIUM` | `LOW` *(hỗ trợ nhiều mức cách nhau bằng dấu phẩy, vd: `HIGH,MEDIUM`)*
  - `category`: `PROFANITY` | `INSULT` | `SPAM`
  - `status`: `VISIBLE` | `HIDDEN`
  - `onlyVisible`: `true` | `false` *(lọc nhanh các bình luận vi phạm vẫn đang hiển thị công khai)*
  - `dishId`: ID món ăn
  - `search` (hoặc `keyword`): Tìm kiếm trong nội dung bình luận, tên món, tên khách
  - `page`, `perPage`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Lọc danh sách bình luận chứa ngôn từ không phù hợp thành công.",
    "data": {
      "summary": {
        "totalFlagged": 2,
        "highCount": 1,
        "mediumCount": 1,
        "lowCount": 0,
        "visibleFlaggedCount": 1,
        "hiddenFlaggedCount": 1
      },
      "items": [
        {
          "reviewId": "6742b9c0d1e2f3a4b5c6d7e8",
          "dishId": 9,
          "dishName": "Salad rong nho mè rang",
          "accountId": 6,
          "customerName": "Khách Bí Ẩn",
          "rating": 1,
          "comment": "Đồ ăn đ.m quá dở, giao hàng lâu vcl.",
          "status": "HIDDEN",
          "moderation": {
            "isFlagged": true,
            "severity": "HIGH",
            "categories": ["PROFANITY"],
            "matchedTerms": ["dm", "vcl"],
            "reason": "Phát hiện ngôn từ tục tĩu/chửi thề — mức độ nghiêm trọng (tự động ẩn).",
            "checkedBy": "RULE_ENGINE",
            "checkedAt": "2026-11-24T15:10:00+07:00"
          },
          "adminReply": null,
          "createdAt": "2026-11-24T15:10:00+07:00",
          "updatedAt": "2026-11-24T15:10:00+07:00"
        }
      ],
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

---

### `REV-11`: Ẩn Hàng Loạt Bình Luận Vi Phạm Đang Hiển Thị
- **URL:** `POST /api/v1/admin/reviews/flagged/auto-hide`
- **Headers:** `Authorization: Bearer <admin_or_staff_token>`
- **Request Body (tùy chọn):**
  ```json
  {
    "severities": ["HIGH", "MEDIUM"]
  }
  ```
  *(Bỏ trống body `{}` sẽ tự động ẩn toàn bộ bình luận vi phạm `HIGH`, `MEDIUM`, `LOW` đang có `status = VISIBLE`.)*
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Đã tự động ẩn 1 bình luận chứa ngôn từ không phù hợp.",
    "data": {
      "hiddenCount": 1,
      "appliedSeverities": ["HIGH", "MEDIUM"],
      "summary": {
        "totalFlagged": 2,
        "highCount": 1,
        "mediumCount": 1,
        "lowCount": 0,
        "visibleFlaggedCount": 0,
        "hiddenFlaggedCount": 2
      }
    }
  }
  ```

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
