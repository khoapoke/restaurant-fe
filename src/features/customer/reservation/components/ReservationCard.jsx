import { Calendar, Clock, Users, MapPin, Edit3, XCircle, MessageSquare } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import {
  RESERVATION_STATUS_CONFIG,
  ReservationStatus,
  normalizeReservationStatus,
} from '../constants'

/**
 * Kiểm tra xem lượt đặt bàn có thể hủy hoặc sửa không
 * Điều kiện: Trạng thái PENDING hoặc CONFIRMED VÀ thời gian còn >= 60 phút
 */
export const checkCanModifyOrCancel = (reservationTimeStr, status) => {
  const normStatus = normalizeReservationStatus(status)
  if (normStatus !== ReservationStatus.PENDING && normStatus !== ReservationStatus.CONFIRMED) {
    return false
  }
  if (!reservationTimeStr) return false

  try {
    // Chuẩn hoá ISO string hoặc "YYYY-MM-DD HH:mm:ss"
    const parsedTime = new Date(String(reservationTimeStr).replace(' ', 'T')).getTime()
    if (isNaN(parsedTime)) return false
    const now = Date.now()
    const diffMinutes = (parsedTime - now) / (1000 * 60)
    return diffMinutes >= 60
  } catch {
    return false
  }
}

export const ReservationCard = ({ reservation, onEdit, onCancel }) => {
  const id = reservation?.reservationId || reservation?.id || reservation?.ma_dat_ban

  const timeStr =
    reservation?.reservationTime ||
    reservation?.reservation_time ||
    reservation?.thoi_gian ||
    reservation?.thoi_gian_dat

  const guestCount =
    reservation?.guestCount ||
    reservation?.guest_count ||
    reservation?.so_luong_khach ||
    reservation?.so_khach ||
    1

  const rawStatus =
    reservation?.status ||
    reservation?.trang_thai ||
    reservation?.reservationStatus ||
    reservation?.reservation_status ||
    reservation?.tinh_trang

  const status = normalizeReservationStatus(rawStatus)

  const tableObj = reservation?.table || reservation?.ban_an || reservation?.banAn || {}
  const tableName =
    tableObj.tableName ||
    tableObj.table_name ||
    tableObj.name ||
    tableObj.ten_ban ||
    reservation?.tableName ||
    reservation?.ten_ban ||
    (reservation?.tableId || reservation?.table_id || reservation?.ma_ban
      ? `Bàn số ${reservation.tableId || reservation.table_id || reservation.ma_ban}`
      : 'Bàn chưa xác định')

  const location =
    tableObj.location ||
    tableObj.vi_tri ||
    reservation?.location ||
    reservation?.vi_tri ||
    'Khu vực chính'

  const capacity = tableObj.capacity || tableObj.so_ghe || reservation?.capacity || reservation?.so_ghe

  const note = reservation?.note || reservation?.ghi_chu || reservation?.customer_note
  const adminNote =
    reservation?.adminNote ||
    reservation?.admin_note ||
    reservation?.ghi_chu_admin ||
    reservation?.reason ||
    reservation?.ly_do_tu_choi

  const statusConfig = RESERVATION_STATUS_CONFIG[status] || {
    label: status,
    color: 'text-gray-400 bg-gray-800 border-gray-700',
    desc: '',
  }

  const canAction = checkCanModifyOrCancel(timeStr, status)

  // Format hiển thị ngày giờ thân thiện
  const formattedDateTime = (() => {
    if (!timeStr) return 'Chưa xác định'
    try {
      const d = new Date(timeStr.replace(' ', 'T'))
      if (isNaN(d.getTime())) return timeStr
      return d.toLocaleString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return timeStr
    }
  })()

  return (
    <div className="bg-gray-900/60 border border-gray-800 hover:border-gray-700/80 rounded-2xl p-5 transition-all space-y-4">
      {/* Header card: ID & Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800/80 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            #{id}
          </span>
          <span className="text-xs text-gray-400">Yêu cầu đặt bàn</span>
        </div>

        <div className="flex flex-col items-end">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Thông tin chính: Thời gian, Bàn, Khách */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-gray-300">
        <div className="flex items-start gap-2.5 bg-gray-950/50 p-3 rounded-xl border border-gray-800/60">
          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] text-gray-500 block">Thời gian hẹn</span>
            <span className="font-medium text-gray-200">{formattedDateTime}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-gray-950/50 p-3 rounded-xl border border-gray-800/60">
          <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] text-gray-500 block">Bàn & Vị trí</span>
            <span className="font-medium text-gray-200">
              {tableName} {capacity ? `(${capacity} chỗ)` : ''}
            </span>
            <span className="text-[10px] text-gray-500 block">{location}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-gray-950/50 p-3 rounded-xl border border-gray-800/60">
          <Users className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] text-gray-500 block">Số lượng khách</span>
            <span className="font-medium text-gray-200">{guestCount} người</span>
          </div>
        </div>
      </div>

      {/* Ghi chú của khách nếu có */}
      {note && (
        <div className="text-xs bg-gray-950/30 p-3 rounded-xl border border-gray-800/40 flex items-start gap-2 text-gray-300">
          <MessageSquare className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-gray-500 font-medium">Ghi chú của bạn: </span>
            <span>{note}</span>
          </div>
        </div>
      )}

      {/* Phản hồi của nhà hàng / Admin nếu có */}
      {adminNote && (
        <div className="text-xs bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 flex items-start gap-2 text-amber-200">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-amber-400 font-medium">Nhà hàng nhắn: </span>
            <span>{adminNote}</span>
          </div>
        </div>
      )}

      {/* Footer Card: Hướng dẫn hoặc Action buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-800/60 text-xs">
        <div>
          {canAction ? (
            <span className="text-[11px] text-gray-500">
              Có thể chỉnh sửa hoặc hủy trước giờ hẹn tối thiểu 60 phút.
            </span>
          ) : (
            (status === ReservationStatus.PENDING || status === ReservationStatus.CONFIRMED) && (
              <span className="text-[11px] text-amber-500/80">
                Đã quá sát giờ hẹn (&lt; 60 phút), không thể tự hủy trên web. Vui lòng gọi hotline.
              </span>
            )
          )}
        </div>

        {canAction && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Edit3}
              onClick={() => onEdit(reservation)}
            >
              Sửa
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              onClick={() => onCancel(reservation)}
            >
              Hủy đặt bàn
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReservationCard
