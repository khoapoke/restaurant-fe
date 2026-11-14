# 🗺️ BẢNG TRA CỨU ÁNH XẠ TOÀN DIỆN 63 APIS (API MATRIX CHEATSHEET)

> Bảng tra cứu chéo nhanh chóng giữa **Mã Use Case Backend**, **Đặc tả Frontend**, **Mã nguồn Service JS**, và **Tài liệu Backend Bounded Context**.  
> *(Tất cả liên kết đều dùng đường dẫn tương đối chuẩn — Bạn có thể giữ `Ctrl` + Click để mở file trực tiếp trên VS Code)*

---

## 1. Phân Hệ Xác Thực & Quản Trị Tài Khoản (Auth Module)
| Mã API | Method | Endpoint URL | Frontend Doc | Backend Module | Service Frontend |
|:---:|:---:|:---|:---|:---|:---|
| `USR-01` | `POST` | `/api/v1/auth/register` | [auth.md](./auth.md) | [modules/auth.md](../modules/auth.md) | [`authService.js`](../../src/features/auth/services/authService.js) |
| `USR-02` | `POST` | `/api/v1/auth/login` | [auth.md](./auth.md) | [modules/auth.md](../modules/auth.md) | [`authService.js`](../../src/features/auth/services/authService.js) |
| `USR-03` | `POST` | `/api/v1/auth/logout` | [auth.md](./auth.md) | [modules/auth.md](../modules/auth.md) | [`authService.js`](../../src/features/auth/services/authService.js) |
| `USR-04` | `GET` | `/api/v1/customer/profile` | [customer-profile.md](./customer-profile.md) | [modules/auth.md](../modules/auth.md) | [`profileService.js`](../../src/features/customer/profile/services/profileService.js) |
| `USR-05` | `PUT` | `/api/v1/customer/profile` | [customer-profile.md](./customer-profile.md) | [modules/auth.md](../modules/auth.md) | [`profileService.js`](../../src/features/customer/profile/services/profileService.js) |
| `USR-06` | `PUT` | `/api/v1/customer/password` | [customer-profile.md](./customer-profile.md) | [modules/auth.md](../modules/auth.md) | [`profileService.js`](../../src/features/customer/profile/services/profileService.js) |
| `ADM-01` | `GET` | `/api/v1/admin/accounts` | [admin-account.md](./admin-account.md) | [modules/auth.md](../modules/auth.md) | [`adminAccountService.js`](../../src/features/admin/account/services/adminAccountService.js) |
| `ADM-02` | `POST` | `/api/v1/admin/accounts` | [admin-account.md](./admin-account.md) | [modules/auth.md](../modules/auth.md) | [`adminAccountService.js`](../../src/features/admin/account/services/adminAccountService.js) |
| `ADM-03` | `GET` | `/api/v1/admin/accounts/{id}` | [admin-account.md](./admin-account.md) | [modules/auth.md](../modules/auth.md) | [`adminAccountService.js`](../../src/features/admin/account/services/adminAccountService.js) |
| `ADM-04` | `PATCH`| `/api/v1/admin/accounts/{id}/lock` | [admin-account.md](./admin-account.md) | [modules/auth.md](../modules/auth.md) | [`adminAccountService.js`](../../src/features/admin/account/services/adminAccountService.js) |
| `ADM-05` | `PATCH`| `/api/v1/admin/accounts/{id}/unlock` | [admin-account.md](./admin-account.md) | [modules/auth.md](../modules/auth.md) | [`adminAccountService.js`](../../src/features/admin/account/services/adminAccountService.js) |

---

## 2. Phân Hệ Thực Đơn & Món Ăn (Menu Module)
| Mã API | Method | Endpoint URL | Frontend Doc | Backend Module | Service Frontend |
|:---:|:---:|:---|:---|:---|:---|
| `MNU-01` | `GET` | `/api/v1/customer/categories` | [customer-menu.md](./customer-menu.md) | [modules/menu.md](../modules/menu.md) | [`menuService.js`](../../src/features/customer/menu/services/menuService.js) |
| `MNU-02` | `GET` | `/api/v1/customer/dishes` | [customer-menu.md](./customer-menu.md) | [modules/menu.md](../modules/menu.md) | [`menuService.js`](../../src/features/customer/menu/services/menuService.js) |
| `MNU-03` | `GET` | `/api/v1/customer/dishes/{id}` | [customer-menu.md](./customer-menu.md) | [modules/menu.md](../modules/menu.md) | [`menuService.js`](../../src/features/customer/menu/services/menuService.js) |
| `MNU-04` | `POST` | `/api/v1/admin/dishes` | [admin-dish.md](./admin-dish.md) | [modules/menu.md](../modules/menu.md) | [`adminDishService.js`](../../src/features/admin/dish/services/adminDishService.js) |
| `MNU-05` | `PUT` | `/api/v1/admin/dishes/{id}` | [admin-dish.md](./admin-dish.md) | [modules/menu.md](../modules/menu.md) | [`adminDishService.js`](../../src/features/admin/dish/services/adminDishService.js) |
| `MNU-06` | `DELETE`| `/api/v1/admin/dishes/{id}` | [admin-dish.md](./admin-dish.md) | [modules/menu.md](../modules/menu.md) | [`adminDishService.js`](../../src/features/admin/dish/services/adminDishService.js) |
| `MNU-07` | `GET` | `/api/v1/customer/menu/weather-recommendations` | [customer-menu.md](./customer-menu.md) | [modules/menu.md](../modules/menu.md) | [`menuService.js`](../../src/features/customer/menu/services/menuService.js) |
| `MNU-08` | `GET` | `/api/v1/customer/dishes/featured` | [customer-menu.md](./customer-menu.md) | [modules/menu.md](../modules/menu.md) | [`menuService.js`](../../src/features/customer/menu/services/menuService.js) |
| `MNU-09` | `POST` | `/api/v1/admin/categories` | [admin-dish.md](./admin-dish.md) | [modules/menu.md](../modules/menu.md) | [`adminDishService.js`](../../src/features/admin/dish/services/adminDishService.js) |
| `MNU-10` | `PUT` | `/api/v1/admin/categories/{id}` | [admin-dish.md](./admin-dish.md) | [modules/menu.md](../modules/menu.md) | [`adminDishService.js`](../../src/features/admin/dish/services/adminDishService.js) |
| `MNU-11` | `PATCH`| `/api/v1/admin/categories/{id}/visibility` | [admin-dish.md](./admin-dish.md) | [modules/menu.md](../modules/menu.md) | [`adminDishService.js`](../../src/features/admin/dish/services/adminDishService.js) |
| `MNU-12` | `DELETE`| `/api/v1/admin/categories/{id}` | [admin-dish.md](./admin-dish.md) | [modules/menu.md](../modules/menu.md) | [`adminDishService.js`](../../src/features/admin/dish/services/adminDishService.js) |
| `MNU-13` | `PATCH`| `/api/v1/admin/dishes/{id}/availability` | [admin-dish.md](./admin-dish.md) | [modules/menu.md](../modules/menu.md) | [`adminDishService.js`](../../src/features/admin/dish/services/adminDishService.js) |
| `MNU-14` | `PATCH`| `/api/v1/admin/dishes/{id}/visibility` | [admin-dish.md](./admin-dish.md) | [modules/menu.md](../modules/menu.md) | [`adminDishService.js`](../../src/features/admin/dish/services/adminDishService.js) |

---

## 3. Phân Hệ Giỏ Hàng (Cart Module)
| Mã API | Method | Endpoint URL | Frontend Doc | Backend Module | Service Frontend |
|:---:|:---:|:---|:---|:---|:---|
| `CRT-01` | `GET` | `/api/v1/customer/cart` | [customer-cart.md](./customer-cart.md) | [modules/cart.md](../modules/cart.md) | [`cartService.js`](../../src/features/customer/cart/services/cartService.js) |
| `CRT-02` | `POST` | `/api/v1/customer/cart/items` | [customer-cart.md](./customer-cart.md) | [modules/cart.md](../modules/cart.md) | [`cartService.js`](../../src/features/customer/cart/services/cartService.js) |
| `CRT-03` | `PUT` | `/api/v1/customer/cart/items/{dishId}` | [customer-cart.md](./customer-cart.md) | [modules/cart.md](../modules/cart.md) | [`cartService.js`](../../src/features/customer/cart/services/cartService.js) |
| `CRT-04` | `DELETE`| `/api/v1/customer/cart/items/{dishId}` | [customer-cart.md](./customer-cart.md) | [modules/cart.md](../modules/cart.md) | [`cartService.js`](../../src/features/customer/cart/services/cartService.js) |
| `CRT-05` | `DELETE`| `/api/v1/customer/cart/clear` | [customer-cart.md](./customer-cart.md) | [modules/cart.md](../modules/cart.md) | [`cartService.js`](../../src/features/customer/cart/services/cartService.js) |

---

## 4. Phân Hệ Đơn Hàng (Order Module)
| Mã API | Method | Endpoint URL | Frontend Doc | Backend Module | Service Frontend |
|:---:|:---:|:---|:---|:---|:---|
| `ORD-01` | `POST` | `/api/v1/customer/orders/checkout` | [customer-order.md](./customer-order.md) | [modules/order.md](../modules/order.md) | [`orderService.js`](../../src/features/customer/order/services/orderService.js) |
| `ORD-02` | `PUT` | `/api/v1/customer/orders/{id}/cancel` | [customer-order.md](./customer-order.md) | [modules/order.md](../modules/order.md) | [`orderService.js`](../../src/features/customer/order/services/orderService.js) |
| `ORD-04` | `GET` | `/api/v1/customer/orders` | [customer-order.md](./customer-order.md) | [modules/order.md](../modules/order.md) | [`orderService.js`](../../src/features/customer/order/services/orderService.js) |
| `ORD-05` | `GET` | `/api/v1/customer/orders/{id}` | [customer-order.md](./customer-order.md) | [modules/order.md](../modules/order.md) | [`orderService.js`](../../src/features/customer/order/services/orderService.js) |
| `ORD-06` | `GET` | `/api/v1/admin/orders` | [admin-order.md](./admin-order.md) | [modules/order.md](../modules/order.md) | [`adminOrderService.js`](../../src/features/admin/order/services/adminOrderService.js) |
| `ORD-07` | `GET` | `/api/v1/admin/orders/{id}` | [admin-order.md](./admin-order.md) | [modules/order.md](../modules/order.md) | [`adminOrderService.js`](../../src/features/admin/order/services/adminOrderService.js) |
| `ORD-08` | `PATCH`| `/api/v1/admin/orders/{id}/status` | [admin-order.md](./admin-order.md) | [modules/order.md](../modules/order.md) | [`adminOrderService.js`](../../src/features/admin/order/services/adminOrderService.js) |

---

## 5. Phân Hệ Đặt Bàn & Sơ Đồ Bàn Ăn (Reservation Module)
| Mã API | Method | Endpoint URL | Frontend Doc | Backend Module | Service Frontend |
|:---:|:---:|:---|:---|:---|:---|
| `BKG-01` | `GET` | `/api/v1/customer/reservations/available-tables` | [customer-reservation.md](./customer-reservation.md) | [modules/reservation.md](../modules/reservation.md) | [`reservationService.js`](../../src/features/customer/reservation/services/reservationService.js) |
| `BKG-02` | `POST` | `/api/v1/customer/reservations` | [customer-reservation.md](./customer-reservation.md) | [modules/reservation.md](../modules/reservation.md) | [`reservationService.js`](../../src/features/customer/reservation/services/reservationService.js) |
| `BKG-03` | `PUT` | `/api/v1/customer/reservations/{id}` | [customer-reservation.md](./customer-reservation.md) | [modules/reservation.md](../modules/reservation.md) | [`reservationService.js`](../../src/features/customer/reservation/services/reservationService.js) |
| `BKG-04` | `PUT` | `/api/v1/customer/reservations/{id}/cancel` | [customer-reservation.md](./customer-reservation.md) | [modules/reservation.md](../modules/reservation.md) | [`reservationService.js`](../../src/features/customer/reservation/services/reservationService.js) |
| `BKG-05` | `GET` | `/api/v1/customer/reservations` | [customer-reservation.md](./customer-reservation.md) | [modules/reservation.md](../modules/reservation.md) | [`reservationService.js`](../../src/features/customer/reservation/services/reservationService.js) |
| `BKG-06` | `GET` | `/api/v1/customer/reservations/{id}` | [customer-reservation.md](./customer-reservation.md) | [modules/reservation.md](../modules/reservation.md) | [`reservationService.js`](../../src/features/customer/reservation/services/reservationService.js) |
| `BKG-07` | `GET` | `/api/v1/admin/tables` | [admin-table-report.md](./admin-table-report.md) | [modules/reservation.md](../modules/reservation.md) | [`adminTableService.js`](../../src/features/admin/table/services/adminTableService.js) |
| `BKG-08` | `PATCH`| `/api/v1/admin/tables/{id}/status` | [admin-table-report.md](./admin-table-report.md) | [modules/reservation.md](../modules/reservation.md) | [`adminTableService.js`](../../src/features/admin/table/services/adminTableService.js) |
| `BKG-09` | `GET` | `/api/v1/admin/reservations` | [admin-table-report.md](./admin-table-report.md) | [modules/reservation.md](../modules/reservation.md) | [`adminTableService.js`](../../src/features/admin/table/services/adminTableService.js) |
| `BKG-10` | `GET` | `/api/v1/admin/reservations/{id}` | [admin-table-report.md](./admin-table-report.md) | [modules/reservation.md](../modules/reservation.md) | [`adminTableService.js`](../../src/features/admin/table/services/adminTableService.js) |
| `BKG-11` | `PATCH`| `/api/v1/admin/reservations/{id}/status` | [admin-table-report.md](./admin-table-report.md) | [modules/reservation.md](../modules/reservation.md) | [`adminTableService.js`](../../src/features/admin/table/services/adminTableService.js) |

---

## 6. Phân Hệ Thanh Toán (Payment Module)
| Mã API | Method | Endpoint URL | Frontend Doc | Backend Module | Service Frontend |
|:---:|:---:|:---|:---|:---|:---|
| `PAY-01` | `GET` | `/api/v1/admin/payments` | [admin-order.md](./admin-order.md) | [modules/payment.md](../modules/payment.md) | [`adminOrderService.js`](../../src/features/admin/order/services/adminOrderService.js) |
| `PAY-02` | `GET` | `/api/v1/admin/payments/{id}` | [admin-order.md](./admin-order.md) | [modules/payment.md](../modules/payment.md) | [`adminOrderService.js`](../../src/features/admin/order/services/adminOrderService.js) |
| `PAY-03` | `PATCH`| `/api/v1/admin/payments/{id}/confirm` | [admin-order.md](./admin-order.md) | [modules/payment.md](../modules/payment.md) | [`adminOrderService.js`](../../src/features/admin/order/services/adminOrderService.js) |
| `PAY-04` | `GET` | `/api/v1/customer/payments/{orderId}` | [customer-order.md](./customer-order.md) | [modules/payment.md](../modules/payment.md) | [`orderService.js`](../../src/features/customer/order/services/orderService.js) |
| `PAY-05` | `POST` | `/api/v1/admin/payments/{id}/refund` | [admin-order.md](./admin-order.md) | [modules/payment.md](../modules/payment.md) | [`adminOrderService.js`](../../src/features/admin/order/services/adminOrderService.js) |
| `PAY-06` | `GET` | `/api/v1/customer/payments/{orderId}/status` | [customer-order.md](./customer-order.md) | [modules/payment.md](../modules/payment.md) | [`orderService.js`](../../src/features/customer/order/services/orderService.js) |
| `PAY-07` | `POST` | `/api/v1/customer/payments/webhook` | [customer-order.md](./customer-order.md) | [modules/payment.md](../modules/payment.md) | *(Webhook Ngân hàng)* |

---

## 7. Phân Hệ Báo Cáo Thống Kê (Report Module)
| Mã API | Method | Endpoint URL | Frontend Doc | Backend Module | Service Frontend |
|:---:|:---:|:---|:---|:---|:---|
| `RPT-00` | `GET` | `/api/v1/admin/reports/dashboard` | [admin-table-report.md](./admin-table-report.md) | [modules/report.md](../modules/report.md) | [`reportService.js`](../../src/features/admin/dashboard/services/reportService.js) |
| `RPT-01` | `GET` | `/api/v1/admin/reports/revenue` | [admin-table-report.md](./admin-table-report.md) | [modules/report.md](../modules/report.md) | [`reportService.js`](../../src/features/admin/dashboard/services/reportService.js) |
| `RPT-02` | `GET` | `/api/v1/admin/reports/orders` | [admin-table-report.md](./admin-table-report.md) | [modules/report.md](../modules/report.md) | [`reportService.js`](../../src/features/admin/dashboard/services/reportService.js) |
| `RPT-03` | `GET` | `/api/v1/admin/reports/top-dishes` | [admin-table-report.md](./admin-table-report.md) | [modules/report.md](../modules/report.md) | [`reportService.js`](../../src/features/admin/dashboard/services/reportService.js) |
| `RPT-04` | `GET` | `/api/v1/admin/reports/reservations` | [admin-table-report.md](./admin-table-report.md) | [modules/report.md](../modules/report.md) | [`reportService.js`](../../src/features/admin/dashboard/services/reportService.js) |

---

## 8. Phân Hệ Đồ Thị Gợi Ý Món Ăn Neo4j AI (Recommendation Module)
| Mã API | Method | Endpoint URL | Frontend Doc | Backend Module | Service Frontend |
|:---:|:---:|:---|:---|:---|:---|
| `GRA-01` | `GET` | `/api/v1/customer/dishes/{dishId}/recommendations/graph` | [customer-recommendation.md](./customer-recommendation.md) | [modules/recommendation.md](../modules/recommendation.md) | [`recommendationService.js`](../../src/features/customer/menu/services/recommendationService.js) |
| `GRA-02` | `GET` | `/api/v1/customer/recommendations/personalized` | [customer-recommendation.md](./customer-recommendation.md) | [modules/recommendation.md](../modules/recommendation.md) | [`recommendationService.js`](../../src/features/customer/menu/services/recommendationService.js) |
| `GRA-03` | `GET` | `/api/v1/customer/recommendations/graph-stats` | [customer-recommendation.md](./customer-recommendation.md) | [modules/recommendation.md](../modules/recommendation.md) | [`recommendationService.js`](../../src/features/customer/menu/services/recommendationService.js) |
