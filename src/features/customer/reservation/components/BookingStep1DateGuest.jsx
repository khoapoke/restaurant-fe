import { Calendar, Users, Plus, Minus, ArrowRight } from 'lucide-react'

/**
 * Giai Đoạn 1: Chọn Ngày Dùng Bữa & Số Lượng Khách (BookingStep1DateGuest)
 * - Độ dài < 100 dòng
 */
export default function BookingStep1DateGuest({
  date,
  setDate,
  todayStr,
  guestCount,
  setGuestCount,
  onNext,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h3 className="text-sm font-bold text-text-main">
          Giai đoạn 1: Thời gian &amp; Số lượng khách
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Vui lòng chọn ngày dùng bữa và số lượng khách để kiểm tra các bàn ăn khả dụng.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Chọn Ngày */}
        <div>
          <label className="text-xs font-semibold text-text-main flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            <span>Ngày dùng bữa</span>
          </label>
          <input
            type="date"
            value={date}
            min={todayStr}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-subtle text-xs sm:text-sm text-text-main focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
          />
        </div>

        {/* Số Lượng Khách */}
        <div>
          <label className="text-xs font-semibold text-text-main flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-brand-primary" />
            <span>Số lượng thực khách</span>
          </label>
          <div className="flex items-center rounded-xl bg-surface-bg border border-border-subtle p-1">
            <button
              type="button"
              onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
              disabled={guestCount <= 1}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-card disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 text-center font-bold font-mono text-sm sm:text-base text-text-main">
              {guestCount} khách
            </div>
            <button
              type="button"
              onClick={() => setGuestCount((g) => Math.min(20, g + 1))}
              disabled={guestCount >= 20}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-card disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Nút Chuyển Tiếp Sang Giai Đoạn 2 */}
      <div className="flex items-center justify-end pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={onNext}
          disabled={!date || guestCount < 1}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-brand-primary hover:bg-brand-hover active:bg-brand-active text-surface-bg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

