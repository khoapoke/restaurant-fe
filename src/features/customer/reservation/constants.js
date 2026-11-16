/**
 * Constants & Enums cho Đặt bàn trực tuyến (Customer)
 * Tham chiếu docs/system_conventions.md và docs/modules/reservation.md
 * 100% Centralized Design Tokens
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
  PENDING_DEPOSIT: 'PENDING_DEPOSIT',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  OCCUPIED: 'OCCUPIED',
  SEATED: 'OCCUPIED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
}

export const RESERVATION_STATUS_CONFIG = {
  PENDING_DEPOSIT: {
    label: 'Chờ đặt cọc (15 phút)',
    color: 'text-status-warning bg-status-warning/10 border-status-warning/30 animate-pulse font-bold',
    desc: 'Vui lòng quét mã VietQR để hoàn tất đặt cọc giữ bàn trong vòng 15 phút',
  },
  PENDING: {
    label: 'Chờ duyệt',
    color: 'text-status-warning bg-status-warning/10 border-status-warning/30',
    desc: 'Nhà hàng đang kiểm tra và chuẩn bị bàn cho bạn',
  },
  CONFIRMED: {
    label: 'Đã xác nhận giữ bàn',
    color: 'text-status-success bg-status-success/10 border-status-success/30 font-semibold',
    desc: 'Bàn ăn đã được chuẩn bị sẵn sàng đón bạn',
  },
  OCCUPIED: {
    label: 'Đang dùng bữa',
    color: 'text-brand-hover bg-brand-primary/10 border-brand-primary/30 font-bold',
    desc: 'Quý khách đang thưởng thức bữa ăn tại nhà hàng',
  },
  SEATED: {
    label: 'Đang dùng bữa',
    color: 'text-brand-hover bg-brand-primary/10 border-brand-primary/30 font-bold',
    desc: 'Quý khách đang thưởng thức bữa ăn tại nhà hàng',
  },
  COMPLETED: {
    label: 'Đã hoàn tất bữa ăn',
    color: 'text-status-info bg-status-info/10 border-status-info/30',
    desc: 'Cảm ơn bạn đã dùng bữa tại T-ResMK',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-text-muted bg-surface-subtle border-border-subtle',
    desc: 'Lượt đặt bàn này đã được hủy',
  },
  REJECTED: {
    label: 'Nhà hàng từ chối',
    color: 'text-status-error bg-status-error/10 border-status-error/30',
    desc: 'Nhà hàng kín chỗ hoặc không thể phục vụ vào giờ này',
  },
}

export const DEPOSIT_RATE_PER_GUEST = 50000 // 50.000 VNĐ / khách

/**
 * Kiểm tra xem khung giờ và số lượng khách có rơi vào diện yêu cầu đặt cọc không
 * Điều kiện: Số lượng khách >= 6 VÀ khung giờ cao điểm (11:30-13:30 hoặc 18:00-20:30)
 */
export const isPeakHourDepositRequired = (timeStr, guestCount) => {
  const count = Number(guestCount || 0)
  if (count < 6 || !timeStr) return false

  const cleanTime = String(timeStr).trim().substring(0, 5) // "11:30"
  const isLunchPeak = cleanTime >= '11:30' && cleanTime <= '13:30'
  const isDinnerPeak = cleanTime >= '18:00' && cleanTime <= '20:30'

  return isLunchPeak || isDinnerPeak
}

/**
 * Chuẩn hóa trạng thái đặt bàn từ nhiều định dạng BE
 */
export const normalizeReservationStatus = (status) => {
  if (status === null || status === undefined) return ReservationStatus.PENDING

  const s = String(status).trim().toUpperCase()

  if (s === 'PENDING_DEPOSIT' || s.includes('COC') || s.includes('CỌC')) {
    return ReservationStatus.PENDING_DEPOSIT
  }
  if (
    s === 'PENDING' ||
    s === '0' ||
    s === 'CHO_DUYET' ||
    s === 'CHO_XAC_NHAN' ||
    s.includes('CHO') ||
    s.includes('CHỜ')
  ) {
    return ReservationStatus.PENDING
  }
  if (s === 'CONFIRMED' || s === '1' || s.includes('XAC NHAN') || s.includes('XÁC NHẬN')) {
    return ReservationStatus.CONFIRMED
  }
  if (
    s === 'OCCUPIED' ||
    s === 'SEATED' ||
    s.includes('CO KHACH') ||
    s.includes('CÓ KHÁCH') ||
    s.includes('DUNG BUA') ||
    s.includes('DÙNG BỮA')
  ) {
    return ReservationStatus.OCCUPIED
  }
  if (s === 'COMPLETED' || s === '2' || s.includes('HOAN THANH') || s.includes('HOÀN TẤT')) {
    return ReservationStatus.COMPLETED
  }
  if (s === 'CANCELLED' || s === 'CANCELED' || s === '3' || s.includes('HUY') || s.includes('HỦY')) {
    return ReservationStatus.CANCELLED
  }
  if (s === 'REJECTED' || s === '4' || s.includes('TU CHOI') || s.includes('TỪ CHỐI')) {
    return ReservationStatus.REJECTED
  }

  return ReservationStatus.PENDING
}

export const extractReservationList = (res) => {
  if (!res) return []
  if (Array.isArray(res)) return res
  const raw = res.data?.data ?? res.data
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.items)) return raw.items
  if (Array.isArray(raw?.data)) return raw.data
  return []
}
