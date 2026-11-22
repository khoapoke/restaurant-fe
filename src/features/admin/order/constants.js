/**
 * Constants & Enums cho Quản lý Đơn hàng & Thanh toán (Admin)
 * Tham chiếu docs/system_conventions.md, docs/modules/order.md và docs/modules/payment.md
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
    color: 'text-status-warning bg-status-warning/10 border-status-warning/30',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-status-info bg-status-info/10 border-status-info/30',
  },
  PREPARING: {
    label: 'Đang chuẩn bị',
    color: 'text-brand-hover bg-brand-primary/10 border-brand-primary/30',
  },
  READY: {
    label: 'Món sẵn sàng',
    color: 'text-status-info bg-status-info/10 border-status-info/30',
  },
  DELIVERING: {
    label: 'Đang giao hàng',
    color: 'text-brand-primary bg-brand-primary/15 border-brand-primary/30',
  },
  COMPLETED: {
    label: 'Đã hoàn tất',
    color: 'text-status-success bg-status-success/10 border-status-success/30',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-status-error bg-status-error/10 border-status-error/30',
  },
}

// Luồng chuyển trạng thái 1 chạm (Next Step Transition theo FSM)
export const NEXT_STATUS_MAP = {
  PENDING_CONFIRMATION: {
    target: 'CONFIRMED',
    actionLabel: 'Xác nhận đơn',
    btnVariant: 'primary',
  },
  CONFIRMED: {
    target: 'PREPARING',
    actionLabel: 'Bắt đầu nấu',
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

/**
 * Helper xác định bước chuyển trạng thái kế tiếp phù hợp theo loại hình đơn (DELIVERY / PICKUP / DINE_IN)
 */
export const getNextOrderAction = (status, fulfillmentType = 'DELIVERY') => {
  if (fulfillmentType === 'DINE_IN') {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return { target: 'CONFIRMED', actionLabel: 'Xác nhận bàn', btnVariant: 'primary' }
      case 'CONFIRMED':
        return { target: 'PREPARING', actionLabel: 'Bắt đầu nấu', btnVariant: 'secondary' }
      case 'PREPARING':
        return { target: 'READY', actionLabel: 'Món đã xong', btnVariant: 'secondary' }
      case 'READY':
        return { target: 'DELIVERING', actionLabel: 'Đã bưng đủ món', btnVariant: 'secondary' }
      case 'DELIVERING':
        return { target: 'COMPLETED', actionLabel: 'Hoàn tất & Đóng bàn', btnVariant: 'primary' }
      default:
        return null
    }
  }

  if (fulfillmentType === 'PICKUP') {
    switch (status) {
      case 'PREPARING':
        return { target: 'READY', actionLabel: 'Sẵn sàng tại quầy', btnVariant: 'secondary' }
      case 'READY':
        return { target: 'DELIVERING', actionLabel: 'Giao khách tại quầy', btnVariant: 'secondary' }
      default:
        return NEXT_STATUS_MAP[status] || null
    }
  }

  return NEXT_STATUS_MAP[status] || null
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
    color: 'text-status-warning bg-status-warning/10 border-status-warning/30',
  },
  PAID: {
    label: 'Đã thanh toán',
    color: 'text-status-success bg-status-success/10 border-status-success/30',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/30',
  },
  FAILED: {
    label: 'Thất bại',
    color: 'text-status-error bg-status-error/10 border-status-error/30',
  },
}

export const PaymentMethod = {
  BANK_TRANSFER_QR: 'BANK_TRANSFER_QR',
  CASH: 'CASH',
}

export const PAYMENT_METHOD_CONFIG = {
  BANK_TRANSFER_QR: { label: 'Chuyển khoản VietQR' },
  CASH: { label: 'Tiền mặt' },
}

// ==================== KITCHEN & DINE-IN (KDS) ====================

export const OrderItemStatus = {
  PENDING: 'PENDING',
  COOKING: 'COOKING',
  READY: 'READY',
  SERVED: 'SERVED',
}

export const ORDER_ITEM_STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ chế biến',
    color: 'text-status-warning bg-status-warning/10 border-status-warning/30',
    dotColor: 'bg-status-warning',
  },
  COOKING: {
    label: 'Đang nấu',
    color: 'text-brand-hover bg-brand-primary/10 border-brand-primary/30',
    dotColor: 'bg-brand-primary animate-pulse',
  },
  READY: {
    label: 'Đã sẵn sàng',
    color: 'text-status-info bg-status-info/10 border-status-info/30',
    dotColor: 'bg-status-info',
  },
  SERVED: {
    label: 'Đã phục vụ',
    color: 'text-status-success bg-status-success/10 border-status-success/30',
    dotColor: 'bg-status-success',
  },
}

export const OrderFulfillmentType = {
  DELIVERY: 'DELIVERY',
  PICKUP: 'PICKUP',
  DINE_IN: 'DINE_IN',
}

export const ORDER_FULFILLMENT_CONFIG = {
  DELIVERY: {
    label: 'Giao tận nơi',
    color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/30',
  },
  PICKUP: {
    label: 'Tự đến lấy',
    color: 'text-status-info bg-status-info/10 border-status-info/30',
  },
  DINE_IN: {
    label: 'Dùng tại bàn',
    color: 'text-status-success bg-status-success/10 border-status-success/30',
  },
}
