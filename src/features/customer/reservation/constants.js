export const RESERVATION_STATUS_LABEL = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Bị từ chối',
}

export const RESERVATION_STATUS_STYLE = {
  PENDING: 'bg-amber-100 text-amber-900',
  CONFIRMED: 'bg-emerald-100 text-emerald-900',
  COMPLETED: 'bg-sky-100 text-sky-900',
  CANCELLED: 'bg-stone-200 text-stone-700',
  REJECTED: 'bg-red-100 text-red-900',
}

export const formatReservationDate = (value) => new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'full',
  timeStyle: 'short',
}).format(new Date(value))
