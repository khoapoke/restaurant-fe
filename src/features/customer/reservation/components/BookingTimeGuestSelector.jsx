import { Calendar, Users, Sun, Moon, Plus, Minus } from 'lucide-react'
import { LUNCH_TIME_SLOTS, DINNER_TIME_SLOTS } from '../constants'

/**
 * Sub-component Chọn Ngày, Giờ & Số Khách (BookingTimeGuestSelector)
 * - Tách riêng để form đặt bàn tinh gọn dưới 150 dòng
 * - Phân tách rõ ràng khung giờ Trưa & Tối với biểu tượng trực quan
 * - Độ dài < 140 dòng
 */
export default function BookingTimeGuestSelector({
  date,
  setDate,
  time,
  setTime,
  guestCount,
  setGuestCount,
  todayStr,
}) {
  return (
    <div className="space-y-6">
      {/* Hàng 1: Chọn Ngày & Số lượng khách */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Chọn Ngày */}
        <div>
          <label className="text-xs font-semibold text-text-main flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            <span>Ngày dùng bữa</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              min={todayStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-xs sm:text-sm text-text-main focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Số Lượng Khách */}
        <div>
          <label className="text-xs font-semibold text-text-main flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-brand-primary" />
            <span>Số lượng thực khách</span>
          </label>
          <div className="flex items-center rounded-xl bg-surface-card border border-border-subtle p-1">
            <button
              type="button"
              onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
              disabled={guestCount <= 1}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-bg disabled:opacity-40 transition-colors cursor-pointer"
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
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-bg disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hàng 2: Chọn Khung Giờ Ăn (Trưa / Tối) */}
      <div className="space-y-3.5">
        <label className="text-xs font-semibold text-text-main block">
          Khung giờ đón tiếp
        </label>

        {/* Ca Trưa */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted mb-2">
            <Sun className="w-3.5 h-3.5 text-brand-primary" />
            <span>Buổi trưa (11:00 - 13:30)</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {LUNCH_TIME_SLOTS.map((slot) => {
              const active = time === slot
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={`py-2 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-brand-primary text-surface-bg font-bold shadow-sm'
                      : 'bg-surface-card text-text-muted hover:text-text-main border border-border-subtle hover:border-border-strong'
                  }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </div>

        {/* Ca Tối */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted mb-2">
            <Moon className="w-3.5 h-3.5 text-brand-primary" />
            <span>Buổi tối (17:30 - 20:30)</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {DINNER_TIME_SLOTS.map((slot) => {
              const active = time === slot
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={`py-2 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-brand-primary text-surface-bg font-bold shadow-sm'
                      : 'bg-surface-card text-text-muted hover:text-text-main border border-border-subtle hover:border-border-strong'
                  }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

