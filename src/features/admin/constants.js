export const ORDER_STATUS = {
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}

export const ORDER_STATUS_LABEL = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY: 'Sẵn sàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
}

export const NEXT_ORDER_STATUS = {
  PENDING_CONFIRMATION: ORDER_STATUS.CONFIRMED,
  CONFIRMED: ORDER_STATUS.PREPARING,
  PREPARING: ORDER_STATUS.READY,
}

export const FULFILLMENT_TYPE_LABEL = {
  DELIVERY: 'Giao tận nơi',
  PICKUP: 'Khách tự đến lấy',
  DINE_IN: 'Ăn tại chỗ',
}

export const FULFILLMENT_STATUS_LABEL = {
  PENDING: 'Chờ xử lý',
  AWAITING_DRIVER: 'Chờ tài xế',
  OUT_FOR_DELIVERY: 'Đang giao',
  DELIVERED: 'Đã giao',
  AWAITING_CUSTOMER: 'Chờ khách đến lấy',
  COLLECTED: 'Khách đã nhận',
  SERVING: 'Đang phục vụ',
  SERVED: 'Đã phục vụ',
}

export const NEXT_FULFILLMENT_STATUS = {
  AWAITING_DRIVER: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
  AWAITING_CUSTOMER: 'COLLECTED',
}

export const RESERVATION_STATUS_LABEL = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Từ chối',
}

export const TABLE_STATUS_LABEL = {
  AVAILABLE: 'Sẵn sàng',
  RESERVED: 'Đã đặt',
  OCCUPIED: 'Đang phục vụ',
  CLEANING: 'Chờ vệ sinh',
  MAINTENANCE: 'Bảo trì',
}

export const PAYMENT_STATUS_LABEL = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
}

export const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(Number(value || 0))

export const formatDateTime = (value) => value
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : '—'
