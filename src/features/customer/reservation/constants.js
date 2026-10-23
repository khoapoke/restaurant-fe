export const RESERVATION_STATUS_LABEL = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Bị từ chối',
  EXPIRED: 'Hết hạn chờ xác nhận',
  NO_SHOW: 'Không đến',
}

/** Giờ khách đến được nhận đặt bàn (config/restaurant.php · hours). */
export const RESERVATION_HOURS = { opensAt: '10:00', lastReservationAt: '21:30' }

export const RESERVATION_STATUS_STYLE = {
  PENDING: 'bg-amber-100 text-amber-900',
  CONFIRMED: 'bg-emerald-100 text-emerald-900',
  COMPLETED: 'bg-sky-100 text-sky-900',
  CANCELLED: 'bg-stone-200 text-stone-700',
  REJECTED: 'bg-red-100 text-red-900',
  EXPIRED: 'bg-stone-200 text-stone-700',
  NO_SHOW: 'bg-amber-100 text-amber-900',
}

export const formatReservationDate = (value) => new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'full',
  timeStyle: 'short',
}).format(new Date(value))
