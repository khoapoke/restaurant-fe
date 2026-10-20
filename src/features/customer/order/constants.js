/**
 * Order & Payment Constants & Enums
 * Tuân thủ docs/api/enums.md và docs/api/customer-order.md
 */

export const OrderStatus = {
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DELIVERING: 'DELIVERING',
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
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    step: 2,
  },
  PREPARING: {
    label: 'Bếp đang nấu',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    step: 3,
  },
  READY: {
    label: 'Món đã sẵn sàng',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    step: 4,
  },
  DELIVERING: {
    label: 'Đang giao hàng',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    step: 5,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    step: 6,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    step: 0,
  },
}

export const FulfillmentType = {
  DELIVERY: 'DELIVERY',
  DINE_IN: 'DINE_IN',
  TAKEAWAY: 'TAKEAWAY',
}

export const FULFILLMENT_CONFIG = {
  DELIVERY: { label: 'Giao hàng tận nơi' },
  DINE_IN: { label: 'Ăn tại nhà hàng' },
  TAKEAWAY: { label: 'Tự đến mang về' },
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
  PAID: { label: 'Đã thanh toán', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  FAILED: { label: 'Thanh toán lỗi', color: 'text-red-400', bg: 'bg-red-500/10' },
}
