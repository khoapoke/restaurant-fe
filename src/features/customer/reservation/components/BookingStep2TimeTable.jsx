import { Sun, Moon, ArrowLeft, ArrowRight } from 'lucide-react'
import {
  LUNCH_TIME_SLOTS,
  DINNER_TIME_SLOTS,
  isTimeSlotAvailableForDate,
} from '../constants'
import BookingTablePicker from './BookingTablePicker'

/**
 * Giai Đoạn 2: Chọn Khung Giờ & Bàn Ăn Khả Dụng (BookingStep2TimeTable)
 * - Tự động khóa (disabled) các khung giờ đã qua trong ngày hôm nay (yêu cầu đặt trước >= 30 phút)
 * - Độ dài < 155 dòng
 */
export default function BookingStep2TimeTable({
  time,
  setTime,
  availableTables = [],
  loadingTables = false,
  searchError = null,
  selectedTableId = null,
  setSelectedTableId,
  date,
  guestCount,
  onBack,
  onNext,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h3 className="text-sm font-bold text-text-main">
          Giai đoạn 2: Chọn khung giờ &amp; vị trí bàn
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Khảo sát bàn trống cho <strong className="text-brand-primary">{guestCount} khách</strong> vào ngày <strong className="text-text-main">{date}</strong> (đặt trước tối thiểu 30 phút).
        </p>
      </div>

      {/* Bộ Chọn Khung Giờ Ăn */}
      <div className="space-y-3.5">
        <label className="text-xs font-semibold text-text-main block">
          Chọn khung giờ đến
        </label>

        {/* Buổi Trưa */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted mb-2">
            <Sun className="w-3.5 h-3.5 text-brand-primary" />
            <span>Buổi trưa (11:00 - 13:30)</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {LUNCH_TIME_SLOTS.map((slot) => {
              const isValid = isTimeSlotAvailableForDate(date, slot)
              const active = time === slot && isValid
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={!isValid}
                  onClick={() => isValid && setTime(slot)}
                  title={!isValid ? 'Khung giờ này đã qua hoặc còn dưới 30 phút' : `Chọn ${slot}`}
                  className={`py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                    !isValid
                      ? 'bg-surface-bg/40 text-text-dim line-through opacity-40 border border-border-subtle cursor-not-allowed'
                      : active
                      ? 'bg-brand-primary text-surface-bg font-bold shadow-sm cursor-pointer'
                      : 'bg-surface-bg text-text-muted hover:text-text-main border border-border-subtle hover:border-border-strong cursor-pointer'
                  }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </div>

        {/* Buổi Tối */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted mb-2">
            <Moon className="w-3.5 h-3.5 text-brand-primary" />
            <span>Buổi tối (17:30 - 20:30)</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {DINNER_TIME_SLOTS.map((slot) => {
              const isValid = isTimeSlotAvailableForDate(date, slot)
              const active = time === slot && isValid
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={!isValid}
                  onClick={() => isValid && setTime(slot)}
                  title={!isValid ? 'Khung giờ này đã qua hoặc còn dưới 30 phút' : `Chọn ${slot}`}
                  className={`py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                    !isValid
                      ? 'bg-surface-bg/40 text-text-dim line-through opacity-40 border border-border-subtle cursor-not-allowed'
                      : active
                      ? 'bg-brand-primary text-surface-bg font-bold shadow-sm cursor-pointer'
                      : 'bg-surface-bg text-text-muted hover:text-text-main border border-border-subtle hover:border-border-strong cursor-pointer'
                  }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lưới Bàn Ăn Khả Dụng */}
      <BookingTablePicker
        tables={availableTables}
        loading={loadingTables}
        error={searchError}
        selectedTableId={selectedTableId}
        onSelectTable={setSelectedTableId}
      />

      {/* Điều Hướng Trước / Sau */}
      <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface-bg border border-border-subtle transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!selectedTableId || loadingTables}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-brand-primary hover:bg-brand-hover active:bg-brand-active text-surface-bg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

