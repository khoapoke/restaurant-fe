/**
 * Order & Payment Constants & Enums
 * Tuân thủ docs/system_conventions.md, docs/modules/order.md và docs/modules/payment.md
 * 100% Centralized Design Tokens
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
    color: 'text-status-warning',
    bg: 'bg-status-warning/10',
    border: 'border-status-warning/30',
    step: 1,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-status-info',
    bg: 'bg-status-info/10',
    border: 'border-status-info/30',
    step: 2,
  },
  PREPARING: {
    label: 'Đang chuẩn bị',
    color: 'text-brand-hover',
    bg: 'bg-brand-primary/10',
    border: 'border-brand-primary/30',
    step: 3,
  },
  READY: {
    label: 'Món đã sẵn sàng',
    color: 'text-status-info',
    bg: 'bg-status-info/10',
    border: 'border-status-info/30',
    step: 4,
  },
  DELIVERING: {
    label: 'Đang giao hàng',
    color: 'text-brand-primary',
    bg: 'bg-brand-primary/15',
    border: 'border-brand-primary/30',
    step: 5,
  },
  COMPLETED: {
    label: 'Đã hoàn tất',
    color: 'text-status-success',
    bg: 'bg-status-success/10',
    border: 'border-status-success/30',
    step: 6,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-status-error',
    bg: 'bg-status-error/10',
    border: 'border-status-error/30',
    step: 0,
  },
}

export const FulfillmentType = {
  DELIVERY: 'DELIVERY',
  PICKUP: 'PICKUP',
}

export const FULFILLMENT_CONFIG = {
  DELIVERY: { label: 'Giao hàng tận nơi' },
  PICKUP: { label: 'Nhận tại nhà hàng' },
}

export const PaymentMethod = {
  BANK_TRANSFER_QR: 'BANK_TRANSFER_QR',
  CASH: 'CASH',
}

export const PAYMENT_METHOD_CONFIG = {
  BANK_TRANSFER_QR: { label: 'Chuyển khoản VietQR' },
  CASH: { label: 'Tiền mặt khi nhận hàng' },
}

export const PaymentStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
}

export const PAYMENT_STATUS_CONFIG = {
  UNPAID: { label: 'Chưa thanh toán', color: 'text-status-warning', bg: 'bg-status-warning/10' },
  PAID: { label: 'Đã thanh toán', color: 'text-status-success', bg: 'bg-status-success/10' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
  FAILED: { label: 'Thanh toán lỗi', color: 'text-status-error', bg: 'bg-status-error/10' },
}
