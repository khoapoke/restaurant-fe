import { CheckCircle2, AlertCircle, History, RotateCcw, Calendar, Users } from 'lucide-react'

/**
 * Giai Đoạn 4: Kết Quả Đặt Bàn (BookingStep4Result)
 * - Hiển thị phản hồi Thành công (kèm 2 nút Xem Lịch sử & Đặt thêm)
 * - Hiển thị thông báo Lỗi (kèm nút Quay lại Giai đoạn 1 để chọn lại)
 * - Độ dài < 125 dòng
 */
export default function BookingStep4Result({
  isSuccess = true,
  reservation = null,
  errorMessage = null,
  onGoToHistory,
  onReset,
}) {
  if (!isSuccess) {
    return (
      <div className="py-8 text-center space-y-5 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-status-error/15 border border-status-error/30 text-status-error flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-text-main">
            Đặt Bàn Chưa Thành Công
          </h3>
          <p className="text-xs sm:text-sm text-status-error max-w-md mx-auto mt-1.5 leading-relaxed">
            {errorMessage || 'Bàn ăn hoặc thời gian đã chọn không còn khả dụng. Vui lòng thử lại.'}
          </p>
        </div>

        <div className="pt-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-brand-primary hover:bg-brand-hover text-surface-bg transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Quay lại giai đoạn 1</span>
          </button>
        </div>
      </div>
    )
  }

  const id = reservation?.reservationId || reservation?.id || reservation?.ma_dat_ban
  const tableName = reservation?.tableName || reservation?.table?.tableName || 'Bàn ăn chuẩn'
  const timeStr = reservation?.reservationTime || 'Đang cập nhật'
  const guestCount = reservation?.guestCount || 1

  return (
    <div className="py-6 text-center space-y-6 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-brand-subtle border border-border-brand text-brand-primary flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-text-main">
          Yêu Cầu Giữ Chỗ Đã Được Gửi!
        </h3>
        <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto mt-1.5 leading-relaxed">
          Nhà hàng đã tiếp nhận phiếu đặt bàn của bạn và sẽ tiến hành xác nhận trong ít phút.
        </p>
      </div>

      {/* Thẻ Chi Tiết Phiếu Vừa Đặt */}
      <div className="max-w-md mx-auto p-4 rounded-xl bg-surface-bg border border-border-subtle text-xs text-left space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <span className="text-text-muted">Mã phiếu đặt</span>
          <span className="font-mono font-bold text-brand-primary text-sm">#{id}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-muted flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            <span>Thời gian hẹn</span>
          </span>
          <span className="font-semibold text-text-main font-mono">{timeStr}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-muted flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-primary" />
            <span>Vị trí &amp; Số khách</span>
          </span>
          <span className="font-semibold text-text-main">{tableName} • {guestCount} khách</span>
        </div>
      </div>

      {/* 2 Nút Hành Động Theo Yêu Cầu */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onGoToHistory}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-brand-primary hover:bg-brand-hover active:bg-brand-active text-surface-bg transition-colors cursor-pointer shadow-sm"
        >
          <History className="w-4 h-4" />
          <span>Xem trong Lịch sử đặt bàn</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-text-body hover:text-text-main hover:bg-surface-bg border border-border-subtle transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-brand-primary" />
          <span>Đặt thêm bàn khác</span>
        </button>
      </div>
    </div>
  )
}

