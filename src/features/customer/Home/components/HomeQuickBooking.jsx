import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Users, Search } from 'lucide-react'

/**
 * Component Tiện ích Đặt Bàn Nhanh (HomeQuickBooking)
 * Chuẩn mực Design System (design-system/t-resmk/MASTER.md):
 * - Giữ nguyên 100% logic điều hướng API/URL
 * - Tokens: bg-surface-card, bg-surface-input, border-border-subtle, text-brand-primary
 */
export default function HomeQuickBooking() {
  const navigate = useNavigate()

  // Ngày hiện tại định dạng YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  const [bookingData, setBookingData] = useState({
    date: today,
    time: '19:00',
    guestCount: 2,
  })

  const handleQuickSearch = (e) => {
    e.preventDefault()
    navigate(
      `/reservation?date=${bookingData.date}&time=${bookingData.time}&guestCount=${bookingData.guestCount}`
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 mb-16 relative z-20">
      <div className="bg-surface-card border border-border-subtle rounded-xl p-5 sm:p-6 shadow-xl">
        {/* Tiêu đề ngắn gọn chuẩn Content-Minimalist */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-body flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-primary" />
            <span>Đặt bàn trực tuyến</span>
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Giữ chỗ đẹp nhất chỉ trong vài giây, không lo hết bàn
          </p>
        </div>

        <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 items-end">
          {/* 1. Chọn ngày */}
          <div>
            <label className="block text-xs font-medium text-text-body mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              <span>Ngày dùng bữa</span>
            </label>
            <input
              type="date"
              min={today}
              value={bookingData.date}
              onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
              className="w-full bg-surface-input border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
              required
            />
          </div>

          {/* 2. Chọn giờ */}
          <div>
            <label className="block text-xs font-medium text-text-body mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span>Khung giờ đến</span>
            </label>
            <select
              value={bookingData.time}
              onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
              className="w-full bg-surface-input border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
            >
              <option value="11:30">11:30 (Trưa)</option>
              <option value="12:00">12:00 (Trưa)</option>
              <option value="12:30">12:30 (Trưa)</option>
              <option value="18:00">18:00 (Tối)</option>
              <option value="18:30">18:30 (Tối)</option>
              <option value="19:00">19:00 (Tối - Giờ vàng)</option>
              <option value="19:30">19:30 (Tối)</option>
              <option value="20:00">20:00 (Tối)</option>
            </select>
          </div>

          {/* 3. Số lượng khách */}
          <div>
            <label className="block text-xs font-medium text-text-body mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-text-muted" />
              <span>Số lượng khách</span>
            </label>
            <select
              value={bookingData.guestCount}
              onChange={(e) => setBookingData({ ...bookingData, guestCount: Number(e.target.value) })}
              className="w-full bg-surface-input border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
            >
              <option value={2}>2 Khách (Bàn đôi)</option>
              <option value={4}>4 Khách (Bàn tiêu chuẩn)</option>
              <option value={6}>6 Khách (Gia đình)</option>
              <option value={8}>8 Khách (Bàn lớn)</option>
              <option value={10}>10+ Khách (Tiệc riêng)</option>
            </select>
          </div>

          {/* 4. Nút bấm CTA tìm kiếm */}
          <div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-surface-bg bg-brand-primary hover:bg-brand-hover active:bg-brand-active transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Tìm bàn ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
