# ENUMS & STATUS VALUES (Tổng hợp)

> Tất cả Enum/Status trong hệ thống **BẮT BUỘC** dùng tiếng Anh IN HOA.
> Frontend phải sử dụng đúng các giá trị này khi gửi request và hiển thị.

---

## AccountStatus (Trạng thái tài khoản)
| Value | Ý nghĩa |
|-------|---------|
| `ACTIVE` | Tài khoản đang hoạt động |
| `LOCKED` | Tài khoản bị khóa |

## Role (Vai trò)
| Value | `ma_vai_tro` | Ý nghĩa |
|-------|-------------|---------|
| `ADMIN` | 1 | Quản trị viên |
| `CUSTOMER` | 3 | Khách hàng |

---

## OrderStatus (Trạng thái đơn hàng)

### Luồng trạng thái hợp lệ:
```
PENDING_CONFIRMATION → CONFIRMED → PREPARING → READY → DELIVERING → COMPLETED
                                                                   ↘ CANCELLED
```

| Value | Ý nghĩa | Ai chuyển? |
|-------|---------|-----------|
| `PENDING_CONFIRMATION` | Chờ xác nhận | Hệ thống (khi tạo đơn) |
| `CONFIRMED` | Đã xác nhận | Admin |
| `PREPARING` | Đang chuẩn bị | Admin |
| `READY` | Sẵn sàng giao | Admin |
| `DELIVERING` | Đang giao hàng | Admin |
| `COMPLETED` | Hoàn thành | Admin |
| `CANCELLED` | Đã hủy | Customer (chỉ khi PENDING) hoặc Admin (mọi lúc) |

---

## FulfillmentType (Hình thức nhận hàng)
| Value | Ý nghĩa |
|-------|---------|
| `DELIVERY` | Giao hàng tận nơi |
| `DINE_IN` | Ăn tại nhà hàng |
| `TAKEAWAY` | Mang đi |

---

## PaymentMethod (Phương thức thanh toán)
| Value | Ý nghĩa |
|-------|---------|
| `BANK_TRANSFER_QR` | Chuyển khoản qua QR |
| `CASH` | Tiền mặt |

## PaymentStatus (Trạng thái thanh toán)
| Value | Ý nghĩa |
|-------|---------|
| `UNPAID` | Chưa thanh toán |
| `PAID` | Đã thanh toán |
| `REFUNDED` | Đã hoàn tiền |
| `FAILED` | Thanh toán thất bại |

---

## ReservationStatus (Trạng thái đặt bàn)
| Value | Ý nghĩa |
|-------|---------|
| `PENDING` | Chờ xác nhận |
| `CONFIRMED` | Đã xác nhận |
| `COMPLETED` | Hoàn thành |
| `CANCELLED` | Đã hủy |
| `REJECTED` | Bị từ chối |

## TableStatus (Trạng thái bàn ăn)
| Value | Ý nghĩa |
|-------|---------|
| `AVAILABLE` | Trống, sẵn sàng |
| `RESERVED` | Đã được đặt trước |
| `OCCUPIED` | Đang có khách |

---

## WeatherCondition (Điều kiện thời tiết — cho gợi ý món)
| Value | Ý nghĩa |
|-------|---------|
| `HOT_SUNNY` | Nắng nóng |
| `RAINY_OR_COLD` | Mưa hoặc lạnh |
| `PLEASANT_NORMAL` | Thời tiết dễ chịu |

## Allergens (Chất gây dị ứng)
| Value | Ý nghĩa |
|-------|---------|
| `PEANUT` | Đậu phộng |
| `SHELLFISH` | Hải sản có vỏ |
| `DAIRY` | Sữa |
| `EGG` | Trứng |
| `GLUTEN` | Gluten |
| `SOY` | Đậu nành |

## DietaryPreferences (Sở thích dinh dưỡng)
| Value | Ý nghĩa |
|-------|---------|
| `LOW_SUGAR` | Ít đường |
| `HIGH_PROTEIN` | Nhiều đạm |
| `VEGETARIAN` | Chay |
| `LOW_CARB` | Ít tinh bột |
