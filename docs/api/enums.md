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
PENDING_CONFIRMATION → CONFIRMED → PREPARING → READY → COMPLETED
                                                    ↘ CANCELLED
```

| Value | Ý nghĩa | Ai chuyển? |
|-------|---------|-----------|
| `PENDING_CONFIRMATION` | Chờ xác nhận | Hệ thống (khi tạo đơn) |
| `CONFIRMED` | Đã xác nhận | Admin |
| `PREPARING` | Đang chuẩn bị | Admin |
| `READY` | Bếp đã chuẩn bị xong, chờ bàn giao | Admin |
| `COMPLETED` | Đã hoàn tất bàn giao | Hệ thống sau trạng thái giao nhận cuối |
| `CANCELLED` | Đã hủy | Customer (chỉ khi PENDING) hoặc Admin (mọi lúc) |

---

## FulfillmentType (Hình thức nhận hàng)
| Value | Ý nghĩa |
|-------|---------|
| `DELIVERY` | Giao hàng tận nơi |
| `PICKUP` | Khách tự đến lấy |
| `DINE_IN` | Ăn tại nhà hàng, chỉ tạo qua POS |

Checkout online chỉ gửi `DELIVERY` hoặc `PICKUP`; `DINE_IN` không phải một lựa chọn checkout online.

## FulfillmentStatus (Trạng thái bàn giao)
| Value | Áp dụng | Ý nghĩa |
|-------|---------|---------|
| `PENDING` | DELIVERY, PICKUP | Chưa đến bước bàn giao |
| `AWAITING_DRIVER` | DELIVERY | Món sẵn sàng, chờ tài xế |
| `OUT_FOR_DELIVERY` | DELIVERY | Tài xế đang giao |
| `DELIVERED` | DELIVERY | Khách đã nhận hàng |
| `AWAITING_CUSTOMER` | PICKUP | Món sẵn sàng, chờ khách đến lấy |
| `COLLECTED` | PICKUP | Khách đã nhận món |
| `SERVING` | DINE_IN | Đang phục vụ tại bàn |
| `SERVED` | DINE_IN | Phiên tại bàn đã hoàn tất |

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
| `OCCUPIED` | Đang có khách (chỉ POS đặt) |
| `CLEANING` | Chờ vệ sinh sau khi đóng phiên |
| `MAINTENANCE` | Bảo trì, không nhận khách/đặt chỗ |

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

## KitchenItemStatus (Trạng thái món tại bếp)
| Value | Ý nghĩa |
|-------|---------|
| `DRAFT` | Món nháp trong POS, chưa gửi bếp |
| `SENT` | Món mới gửi xuống bếp |
| `QUEUED` | Bếp đã nhận |
| `PREPARING` | Đang chế biến |
| `READY` | Hoàn thành, chờ phục vụ/bàn giao |
| `SERVED` | Đã phục vụ |
| `CANCELLED` | Đã hủy |

## PosSessionStatus (Phiên phục vụ tại bàn)
| Value | Ý nghĩa |
|-------|---------|
| `OPEN` | Đang gọi món |
| `AWAITING_PAYMENT` | Đã lập hóa đơn, chờ thanh toán |
| `CLOSED` | Đã đóng, bàn chờ vệ sinh |
| `CANCELLED` | Hủy do mở nhầm |

## InvoiceStatus (Hóa đơn tại bàn)
| Value | Ý nghĩa |
|-------|---------|
| `OPEN` | Đã chốt, chờ thanh toán |
| `PAID` | Đã thanh toán |
| `VOID` | Đã hủy để gọi thêm món |

## Role bổ sung
| Value | `ma_vai_tro` | Ý nghĩa |
|-------|-------------|---------|
| `STAFF` | 2 | Nhân viên POS/bếp |
