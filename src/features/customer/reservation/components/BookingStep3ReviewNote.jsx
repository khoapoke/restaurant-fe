import { Calendar, Users, MessageSquare, ArrowLeft, CalendarDays, AlertCircle, Info, ShieldAlert } from 'lucide-react'
import { isPeakHourDepositRequired, DEPOSIT_RATE_PER_GUEST } from '../constants'

/**
 * Giai Đoạn 3: Xem Lại Thông Tin & Ghi Chú (BookingStep3ReviewNote)
 * - Tóm tắt toàn bộ dữ liệu đã chọn ở các bước trước
 * - Hiển thị thông báo nhỏ mức tiền cọc nếu rơi vào giờ cao điểm & >= 6 khách
 * - Cho phép nhập thêm ghi chú phục vụ và kích hoạt đặt bàn
 * - Độ dài < 150 dòng
 */
export default function BookingStep3ReviewNote({
  date,
  time,
  guestCount,
  selectedTable,
  note,
  setNote,
  submitting = false,
  submitError = null,
  onBack,
  onSubmit,
}) {
  const tableName = selectedTable?.tableName || selectedTable?.name || 'Bàn ăn chuẩn'
  const location = selectedTable?.location || (tableName.toLowerCase().includes('vip') ? 'Phòng VIP' : 'Sảnh tiệc')

  const requiresDeposit = isPeakHourDepositRequired(time, guestCount)
  const depositAmount = Number(guestCount || 0) * DEPOSIT_RATE_PER_GUEST

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h3 className="text-sm font-bold text-text-main">
          Giai đoạn 3: Xem lại thông tin &amp; Xác nhận
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Vui lòng kiểm tra lại thông tin phiếu đặt trước khi gửi yêu cầu giữ chỗ.
        </p>
      </div>

      {/* Thông Báo Nhỏ Mức Tiền Cọc (Nếu rơi vào giờ cao điểm & >= 6 khách) */}
      {requiresDeposit && (
        <div className="p-3.5 rounded-2xl bg-status-warning/10 border border-status-warning/30 text-xs space-y-1 animate-in fade-in">
          <div className="flex items-center gap-2 font-semibold text-status-warning">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Chính sách đặt cọc giữ chỗ giờ cao điểm</span>
          </div>
          <p className="text-[11px] text-text-body pl-6 leading-relaxed">
            Đoàn từ <strong className="text-text-main">{guestCount} khách</strong> vào khung giờ cao điểm ({time}) yêu cầu đặt cọc{' '}
            <strong className="text-brand-primary">{DEPOSIT_RATE_PER_GUEST.toLocaleString('vi-VN')}đ / khách</strong>.
            Tạm tính: <strong className="font-mono text-brand-primary font-bold">{depositAmount.toLocaleString('vi-VN')} VNĐ</strong>.
          </p>
          <p className="text-[10px] text-text-muted pl-6 italic">
            * Sau khi xác nhận, bạn sẽ có 15 phút để quét mã VietQR giữ bàn trước khi hệ thống tự động giải phóng chỗ.
          </p>
        </div>
      )}

      {/* Thẻ Tóm Tắt Thông Tin Đã Chọn */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-bg border border-border-subtle space-y-3.5">
        <h4 className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
          Tóm tắt phiếu đặt bàn
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-1">
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand-primary" />
              <span>Thời gian</span>
            </span>
            <p className="font-bold font-mono text-text-main">
              {time} • {date}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-1">
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-brand-primary" />
              <span>Số lượng khách</span>
            </span>
            <p className="font-bold text-text-main">
              {guestCount} thực khách
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-1">
            <span className="text-[11px] text-text-muted">Vị trí bàn ăn</span>
            <p className="font-bold text-text-main truncate">
              {tableName} <span className="text-[11px] font-normal text-text-muted">({location})</span>
            </p>
          </div>
        </div>

        <p className="text-[11px] text-text-muted italic pt-1">
          * Nhà hàng giữ bàn tối đa 15 phút kể từ giờ hẹn. Quý khách có thể hủy hoặc sửa miễn phí trước giờ đến &ge; 60 phút.
        </p>
      </div>

      {/* Ô Nhập Ghi Chú Phục Vụ */}
      <div>
        <label className="text-xs font-semibold text-text-main flex items-center gap-1.5 mb-2">
          <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
          <span>Ghi chú phục vụ (tùy chọn)</span>
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Kỷ niệm ngày cưới, cần ghế trẻ em, có người ăn kiêng hoặc dị ứng hải sản..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-subtle text-xs sm:text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors resize-none"
        />
      </div>

      {submitError && (
        <div className="p-3.5 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Nút Điều Hướng: Quay lại hoặc Xác nhận */}
      <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface-bg border border-border-subtle transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-brand-primary hover:bg-brand-hover active:bg-brand-active text-surface-bg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <CalendarDays className="w-4 h-4" />
          <span>{submitting ? 'Đang gửi yêu cầu giữ chỗ...' : requiresDeposit ? 'Xác nhận & Chuyển sang đặt cọc' : 'Xác nhận đặt bàn ngay'}</span>
        </button>
      </div>
    </div>
  )
}

