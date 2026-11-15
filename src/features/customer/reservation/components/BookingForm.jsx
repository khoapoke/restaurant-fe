import { useState, useEffect } from 'react'
import { CalendarDays, AlertCircle, MessageSquare } from 'lucide-react'
import BookingTimeGuestSelector from './BookingTimeGuestSelector'
import BookingTablePicker from './BookingTablePicker'
import { getAvailableTablesApi, createReservationApi } from '../services/reservationService'

/**
 * Component Form Đặt Bàn Khách Hàng (BookingForm)
 * - Tinh gọn, kết hợp BookingTimeGuestSelector và BookingTablePicker
 * - Tuyệt đối không dùng Sparkles, đảm bảo < 150 dòng
 */
export default function BookingForm({ onSuccess }) {
  const todayStr = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(todayStr)
  const [time, setTime] = useState('18:30')
  const [guestCount, setGuestCount] = useState(2)
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [note, setNote] = useState('')

  const [availableTables, setAvailableTables] = useState([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Tự động tìm bàn trống khi ngày, giờ hoặc số khách thay đổi
  useEffect(() => {
    let isMounted = true
    const fetchTables = async () => {
      if (!date || !time || !guestCount) return
      setLoadingTables(true)
      setSearchError(null)
      setSelectedTableId(null)

      try {
        const res = await getAvailableTablesApi({
          date,
          time,
          guestCount: Number(guestCount),
        })
        if (isMounted) {
          const list = res?.data?.data || res?.data || []
          setAvailableTables(Array.isArray(list) ? list : [])
        }
      } catch (err) {
        if (isMounted) {
          setSearchError(err?.response?.data?.message || 'Không thể tải danh sách bàn trống vào thời gian này.')
          setAvailableTables([])
        }
      } finally {
        if (isMounted) setLoadingTables(false)
      }
    }

    fetchTables()
    return () => {
      isMounted = false
    }
  }, [date, time, guestCount])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    if (!selectedTableId) {
      setSubmitError('Vui lòng chọn một bàn ăn trống trong danh sách trước khi xác nhận.')
      return
    }

    setSubmitting(true)
    try {
      const reservationTime = `${date} ${time.length === 5 ? time + ':00' : time}`
      const payload = {
        tableId: selectedTableId,
        reservationTime,
        guestCount: Number(guestCount),
        note: note.trim(),
      }

      const res = await createReservationApi(payload)
      const newReservationData = res?.data?.data || res?.data || {}
      const selectedTableObj = availableTables.find((t) => (t.tableId || t.id) === selectedTableId)

      const completeReservation = {
        ...newReservationData,
        table: newReservationData.table || selectedTableObj,
        tableName: newReservationData.tableName || selectedTableObj?.tableName || selectedTableObj?.name,
        guestCount: Number(guestCount),
        reservationTime,
        status: newReservationData.status || 'PENDING',
      }

      onSuccess?.(completeReservation)
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Không thể tạo phiếu đặt bàn. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-surface-card border border-border-subtle shadow-sm space-y-6">
      {/* Khối 1: Chọn Ngày, Giờ & Số Khách */}
      <BookingTimeGuestSelector
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
        guestCount={guestCount}
        setGuestCount={setGuestCount}
        todayStr={todayStr}
      />

      {/* Khối 2: Lựa Chọn Bàn Ăn Khả Dụng */}
      <BookingTablePicker
        tables={availableTables}
        loading={loadingTables}
        error={searchError}
        selectedTableId={selectedTableId}
        onSelectTable={(id) => {
          setSelectedTableId(id)
          setSubmitError(null)
        }}
      />

      {/* Khối 3: Ghi Chú & Xác Nhận Đặt Bàn */}
      <div className="space-y-4 pt-2 border-t border-border-subtle">
        <div>
          <label className="text-xs font-semibold text-text-main flex items-center gap-1.5 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
            <span>Yêu cầu đặc biệt (tùy chọn)</span>
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Kỷ niệm ngày cưới, cần ghế trẻ em, dị ứng hải sản, ưu tiên bàn yên tĩnh..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-subtle text-xs sm:text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors resize-none"
          />
        </div>

        {submitError && (
          <div className="p-3.5 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || loadingTables || !selectedTableId}
          className="w-full py-3 px-6 rounded-xl text-sm font-semibold bg-brand-primary hover:bg-brand-hover active:bg-brand-active text-surface-bg transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
        >
          <CalendarDays className="w-4 h-4" />
          <span>{submitting ? 'Đang gửi yêu cầu giữ chỗ...' : 'Xác nhận đặt bàn ngay'}</span>
        </button>
      </div>
    </form>
  )
}
