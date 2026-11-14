/**
 * Constants & Enums cho Đặt bàn trực tuyến (Customer)
 * Tham chiếu docs/api/enums.md và docs/api/customer-reservation.md
 */

export const LUNCH_TIME_SLOTS = [
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
]

export const DINNER_TIME_SLOTS = [
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
]

export const ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
}

export const RESERVATION_STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ nhà hàng duyệt',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    desc: 'Nhà hàng đang kiểm tra và chuẩn bị bàn cho bạn',
  },
  CONFIRMED: {
    label: 'Đã xác nhận giữ bàn',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    desc: 'Bàn ăn đã được chuẩn bị sẵn sàng đón bạn',
  },
  COMPLETED: {
    label: 'Đã hoàn tất bữa ăn',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    desc: 'Cảm ơn bạn đã dùng bữa tại T-ResMK',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-gray-400 bg-gray-800 border-gray-700',
    desc: 'Lượt đặt bàn này đã được hủy',
  },
  REJECTED: {
    label: 'Nhà hàng từ chối',
    color: 'text-red-400 bg-red-500/10 border-red-500/30',
    desc: 'Nhà hàng kín chỗ hoặc không thể phục vụ vào giờ này',
  },
}

/**
 * Chuẩn hóa trạng thái đặt bàn từ nhiều định dạng BE có thể trả về
 * (hỗ trợ cả tiếng Anh, tiếng Việt, mã số, hoặc snake_case)
 */
export const normalizeReservationStatus = (status) => {
  if (status === null || status === undefined) return ReservationStatus.PENDING

  const s = String(status).trim().toUpperCase()

  // 1. Chờ duyệt
  if (
    s === 'PENDING' ||
    s === 'PENDING_CONFIRMATION' ||
    s === '0' ||
    s === 'CHO_DUYET' ||
    s === 'CHO_XAC_NHAN' ||
    s.includes('CHO') ||
    s.includes('CHỜ')
  ) {
    return ReservationStatus.PENDING
  }

  // 2. Đã xác nhận / Đã duyệt
  if (
    s === 'CONFIRMED' ||
    s === '1' ||
    s === 'DA_XAC_NHAN' ||
    s === 'DA_DUYET' ||
    s.includes('XAC NHAN') ||
    s.includes('XÁC NHẬN') ||
    s.includes('ĐÃ DUYỆT')
  ) {
    return ReservationStatus.CONFIRMED
  }

  // 3. Hoàn tất bữa ăn
  if (
    s === 'COMPLETED' ||
    s === '2' ||
    s === 'HOAN_THANH' ||
    s === 'DA_HOAN_THANH' ||
    s.includes('HOAN THANH') ||
    s.includes('HOÀN TẤT')
  ) {
    return ReservationStatus.COMPLETED
  }

  // 4. Đã hủy
  if (
    s === 'CANCELLED' ||
    s === 'CANCELED' ||
    s === '3' ||
    s === 'DA_HUY' ||
    s.includes('HUY') ||
    s.includes('HỦY')
  ) {
    return ReservationStatus.CANCELLED
  }

  // 5. Bị từ chối
  if (
    s === 'REJECTED' ||
    s === '4' ||
    s === 'TU_CHOI' ||
    s === 'BI_TU_CHOI' ||
    s.includes('TU CHOI') ||
    s.includes('TỪ CHỐI')
  ) {
    return ReservationStatus.REJECTED
  }

  return ReservationStatus.PENDING
}

/**
 * Trích xuất an toàn danh sách đặt bàn từ bất kỳ cấu trúc ApiResponse / Pagination nào của Laravel
 */
export const extractReservationList = (res) => {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  if (Array.isArray(res.data?.data)) return res.data.data
  if (Array.isArray(res.data?.data?.data)) return res.data.data.data
  if (Array.isArray(res.data?.items)) return res.data.items
  if (Array.isArray(res.data?.data?.items)) return res.data.data.items
  if (Array.isArray(res.data?.reservations)) return res.data.reservations
  if (Array.isArray(res.data?.data?.reservations)) return res.data.data.reservations
  return []
}

