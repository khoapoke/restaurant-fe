import { Calendar, Users, Edit3, XCircle, MessageSquare, QrCode, Clock } from 'lucide-react'
import {
  RESERVATION_STATUS_CONFIG,
  ReservationStatus,
  normalizeReservationStatus,
  DEPOSIT_RATE_PER_GUEST,
} from '../constants'

/**
 * Kiểm tra xem lượt đặt bàn có thể hủy hoặc sửa không
 * Điều kiện: Trạng thái PENDING, PENDING_DEPOSIT hoặc CONFIRMED VÀ cách giờ đến >= 60 phút
 */
export const checkCanModifyOrCancel = (reservationTimeStr, status) => {
  const normStatus = normalizeReservationStatus(status)
  if (
    normStatus !== ReservationStatus.PENDING &&
    normStatus !== ReservationStatus.PENDING_DEPOSIT &&
    normStatus !== ReservationStatus.CONFIRMED
  ) {
    return false
  }
  if (!reservationTimeStr) return false

  try {
    const parsedTime = new Date(String(reservationTimeStr).replace(' ', 'T')).getTime()
    if (isNaN(parsedTime)) return false
    const diffMinutes = (parsedTime - Date.now()) / (1000 * 60)
    return diffMinutes >= 60
  } catch {
    return false
  }
}

export default function ReservationCard({ reservation, onEdit, onCancel, onPayDeposit }) {
  const id = reservation?.reservationId || reservation?.id || reservation?.ma_dat_ban
  const timeStr = reservation?.reservationTime || reservation?.reservation_time || reservation?.thoi_gian
  const guestCount = reservation?.guestCount || reservation?.so_luong_khach || 1
  const rawStatus = reservation?.status || reservation?.trang_thai
  const isTableOccupied = reservation?.table?.status === 'OCCUPIED' || reservation?.ban_an?.trang_thai === 'Đang phục vụ'
  const status = (rawStatus === 'CONFIRMED' && isTableOccupied) ? ReservationStatus.OCCUPIED : normalizeReservationStatus(rawStatus)

  const tableObj = reservation?.table || reservation?.ban_an || {}
  const tableName = tableObj.tableName || reservation?.tableName || (reservation?.tableId ? `Bàn số ${reservation.tableId}` : 'Bàn chuẩn')
  const location = tableObj.location || reservation?.location || 'Sảnh tiệc'
  const note = reservation?.note || reservation?.ghi_chu
  const adminNote = reservation?.adminNote || reservation?.admin_note || reservation?.reason

  const depositAmount = Number(reservation?.depositAmount || reservation?.tien_coc || guestCount * DEPOSIT_RATE_PER_GUEST)
  const isPendingDeposit = status === ReservationStatus.PENDING_DEPOSIT

  const statusConfig = RESERVATION_STATUS_CONFIG[status] || {
    label: status,
    color: 'text-text-muted bg-surface-card border-border-subtle',
  }

  const canAction = checkCanModifyOrCancel(timeStr, status)

  const formattedDateTime = (() => {
    if (!timeStr) return 'Chưa xác định'
    try {
      const d = new Date(timeStr.replace(' ', 'T'))
      if (isNaN(d.getTime())) return timeStr
      return d.toLocaleString('vi-VN', {
        weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return timeStr
    }
  })()

  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle hover:border-border-strong transition-all space-y-4 shadow-sm">
      {/* Hàng 1: Mã đặt & Badge trạng thái */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-brand-primary">
            #{id}
          </span>
          <span className="text-xs font-bold text-text-main">
            {tableName}
          </span>
          <span className="text-[10px] text-text-muted">
            ({location})
          </span>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Thông báo cọc nếu đang PENDING_DEPOSIT */}
      {isPendingDeposit && (
        <div className="p-3 rounded-xl bg-status-warning/10 border border-status-warning/30 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-status-warning shrink-0 animate-pulse" />
            <span className="text-text-body text-[11px]">
              Tiền cọc giữ chỗ: <strong className="font-mono text-brand-primary">{depositAmount.toLocaleString('vi-VN')} VNĐ</strong> (Hạn 15 phút)
            </span>
          </div>
          <button
            type="button"
            onClick={() => onPayDeposit?.(reservation)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-primary hover:bg-brand-hover text-surface-bg transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Quét mã VietQR</span>
          </button>
        </div>
      )}

      {/* Hàng 2: Thời gian hẹn & Số lượng khách */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-body">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-brand-primary shrink-0" />
          <span>Thời gian: <strong className="text-text-main font-mono">{formattedDateTime}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-brand-primary shrink-0" />
          <span>Số lượng: <strong className="text-text-main">{guestCount} khách</strong></span>
        </div>
      </div>

      {/* Ghi chú của khách nếu có */}
      {note && (
        <div className="p-2.5 rounded-lg bg-surface-bg border border-border-subtle text-xs flex items-start gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
          <span className="text-text-muted italic">&ldquo;{note}&rdquo;</span>
        </div>
      )}

      {/* Phản hồi từ nhà hàng nếu có */}
      {adminNote && (
        <div className="p-2.5 rounded-lg bg-brand-subtle border border-border-brand text-xs text-brand-primary">
          <span className="font-semibold">Nhà hàng nhắn:</span> {adminNote}
        </div>
      )}

      {/* Hàng 3: Các nút hành động Sửa / Hủy */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        {canAction ? (
          <div className="flex items-center gap-2 ml-auto">
            {isPendingDeposit && (
              <button
                type="button"
                onClick={() => onPayDeposit?.(reservation)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary hover:bg-brand-hover text-surface-bg transition-colors cursor-pointer shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Thanh toán cọc</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit?.(reservation)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-body hover:text-text-main hover:bg-surface-bg border border-border-subtle transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-brand-primary" />
              <span>Chỉnh sửa</span>
            </button>
            <button
              type="button"
              onClick={() => onCancel?.(reservation)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-status-error hover:bg-surface-bg border border-border-subtle transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Hủy đặt bàn</span>
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-text-dim italic">
            {status === 'OCCUPIED'
              ? 'Quý khách đang dùng bữa tại bàn ăn. Chúc quý khách ngon miệng!'
              : (status === 'PENDING' || status === 'CONFIRMED' || status === 'PENDING_DEPOSIT')
              ? 'Đã sát giờ hẹn (< 60 phút), vui lòng gọi hotline nếu cần điều chỉnh.'
              : 'Phiếu đặt bàn đã đóng lưu trữ.'}
          </span>
        )}
      </div>
    </div>
  )
}
