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

export const PAYMENT_METHOD_LABEL = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER_QR: 'Chuyển khoản QR',
}

export const PAYMENT_STATUS_TONE = {
  UNPAID: 'bg-[#6f1d32]/8 text-[#6f1d32]',
  PAID: 'bg-emerald-100 text-emerald-900',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-stone-200 text-stone-800',
}

export const ORDER_STATUS_TONE = {
  PENDING_CONFIRMATION: 'bg-[#6f1d32] text-white moc-inverse',
  CONFIRMED: 'bg-sky-100 text-sky-900',
  PREPARING: 'bg-[#6f1d32]/10 text-[#6f1d32]',
  READY: 'bg-emerald-100 text-emerald-900',
  COMPLETED: 'bg-stone-200 text-stone-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export const RESERVATION_STATUS_TONE = {
  PENDING: 'bg-[#6f1d32] text-white moc-inverse',
  CONFIRMED: 'bg-emerald-100 text-emerald-900',
  COMPLETED: 'bg-sky-100 text-sky-900',
  CANCELLED: 'bg-stone-200 text-stone-800',
  REJECTED: 'bg-red-100 text-red-800',
}

/** Trạng thái bàn admin được đặt tay; RESERVED/OCCUPIED do đặt bàn và POS tự cập nhật. */
export const MANUAL_TABLE_STATUSES = ['AVAILABLE', 'CLEANING', 'MAINTENANCE']

export const ROLE_LABEL = {
  ADMIN: 'Quản trị viên',
  STAFF: 'Nhân viên',
  CUSTOMER: 'Khách hàng',
}

export const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(Number(value || 0))

export const formatDateTime = (value) => value
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : '—'
