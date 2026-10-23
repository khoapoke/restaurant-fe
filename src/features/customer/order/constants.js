/**
 * Order & Payment Constants & Enums
 * Tuân thủ docs/api/enums.md và docs/api/customer-order.md
 */

export const OrderStatus = {
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}

export const ORDER_STATUS_CONFIG = {
  PENDING_CONFIRMATION: {
    label: 'Chờ xác nhận',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    step: 1,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    step: 2,
  },
  PREPARING: {
    label: 'Bếp đang nấu',
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    step: 3,
  },
  READY: {
    label: 'Món đã sẵn sàng',
    color: 'text-cyan-800',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    step: 4,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    step: 6,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-red-800',
    bg: 'bg-red-50',
    border: 'border-red-200',
    step: 0,
  },
}

export const FulfillmentType = {
  DELIVERY: 'DELIVERY',
  PICKUP: 'PICKUP',
}

export const FULFILLMENT_CONFIG = {
  DELIVERY: { label: 'Giao hàng tận nơi' },
  PICKUP: { label: 'Tự đến lấy tại Mộc' },
  DINE_IN: { label: 'Ăn tại nhà hàng' },
}

export const FULFILLMENT_STATUS_CONFIG = {
  PENDING: { label: 'Chờ nhà hàng xử lý', color: 'text-gray-800' },
  AWAITING_DRIVER: { label: 'Chờ bàn giao tài xế', color: 'text-amber-400' },
  OUT_FOR_DELIVERY: { label: 'Đang giao đến bạn', color: 'text-purple-800' },
  DELIVERED: { label: 'Đã giao hàng', color: 'text-emerald-800' },
  AWAITING_CUSTOMER: { label: 'Sẵn sàng để đến lấy', color: 'text-cyan-800' },
  COLLECTED: { label: 'Khách đã nhận món', color: 'text-emerald-800' },
  SERVING: { label: 'Đang phục vụ tại bàn', color: 'text-amber-400' },
  SERVED: { label: 'Đã phục vụ', color: 'text-emerald-800' },
  DELIVERY_FAILED: { label: 'Giao chưa thành công', color: 'text-red-800' },
}

export const PaymentMethod = {
  BANK_TRANSFER_QR: 'BANK_TRANSFER_QR',
  CASH: 'CASH',
}

export const PAYMENT_METHOD_CONFIG = {
  BANK_TRANSFER_QR: { label: 'Chuyển khoản QR (VietQR)' },
  CASH: { label: 'Tiền mặt khi nhận hàng' },
}

export const PaymentStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
}

export const PAYMENT_STATUS_CONFIG = {
  UNPAID: { label: 'Chưa thanh toán', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  PAID: { label: 'Đã thanh toán', color: 'text-emerald-800', bg: 'bg-emerald-50' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'text-purple-800', bg: 'bg-purple-50' },
  PARTIALLY_PAID: { label: 'Đã thanh toán một phần', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  PARTIALLY_REFUNDED: { label: 'Đã hoàn một phần', color: 'text-purple-800', bg: 'bg-purple-50' },
  FAILED: { label: 'Thanh toán lỗi', color: 'text-red-800', bg: 'bg-red-50' },
}
