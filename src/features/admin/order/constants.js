/**
 * Constants & Enums cho Quản lý Đơn hàng & Thanh toán (Admin)
 * Tham chiếu docs/api/enums.md và docs/api/admin-order.md
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
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  PREPARING: {
    label: 'Đang nấu món',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  READY: {
    label: 'Sẵn sàng giao',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  DELIVERING: {
    label: 'Đang giao hàng',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-red-400 bg-red-500/10 border-red-500/30',
  },
}

// Luồng chuyển trạng thái 1 chạm (Next Step Transition)
export const NEXT_STATUS_MAP = {
  PENDING_CONFIRMATION: {
    target: 'CONFIRMED',
    actionLabel: 'Xác nhận đơn',
    btnVariant: 'primary',
  },
  CONFIRMED: {
    target: 'PREPARING',
    actionLabel: 'Bếp nấu món',
    btnVariant: 'secondary',
  },
  PREPARING: {
    target: 'READY',
    actionLabel: 'Sẵn sàng giao',
    btnVariant: 'secondary',
  },
  READY: {
    target: 'DELIVERING',
    actionLabel: 'Bắt đầu giao',
    btnVariant: 'secondary',
  },
  DELIVERING: {
    target: 'COMPLETED',
    actionLabel: 'Hoàn thành đơn',
    btnVariant: 'primary',
  },
}

export const PaymentStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
}

export const PAYMENT_STATUS_CONFIG = {
  UNPAID: {
    label: 'Chưa thanh toán',
    color: 'text-gray-400 bg-gray-800 border-gray-700',
  },
  PAID: {
    label: 'Đã thanh toán',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  FAILED: {
    label: 'Thất bại',
    color: 'text-red-400 bg-red-500/10 border-red-500/30',
  },
}

export const PaymentMethod = {
  BANK_TRANSFER_QR: 'BANK_TRANSFER_QR',
  CASH: 'CASH',
}

export const PAYMENT_METHOD_CONFIG = {
  BANK_TRANSFER_QR: { label: 'Chuyển khoản QR' },
  CASH: { label: 'Tiền mặt' },
}

