import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, CheckCircle, Search, AlertCircle, Info, Sparkles } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import { LUNCH_TIME_SLOTS, DINNER_TIME_SLOTS } from '../constants'
import { getAvailableTablesApi, createReservationApi } from '../services/reservationService'

export const BookingForm = ({ onSuccess }) => {
  // Lấy ngày hôm nay theo format YYYY-MM-DD
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
          console.error('Fetch available tables error:', err)
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
      setSubmitError('Vui lòng chọn một bàn ăn trống trong danh sách bên dưới.')
      return
    }

    setSubmitting(true)
    try {
      // Format reservationTime: "YYYY-MM-DD HH:mm:00"
      const reservationTime = `${date} ${time.length === 5 ? time + ':00' : time}`
      const payload = {
        tableId: selectedTableId,
        reservationTime,
        guestCount: Number(guestCount),
        note: note.trim(),
      }

      const res = await createReservationApi(payload)
      const newReservationData = res?.data?.data || res?.data || {}

      // Lấy thông tin bàn người dùng vừa chọn để đảm bảo hiển thị đầy đủ ngay cả khi BE chưa eager-load
      const selectedTableObj = availableTables.find(
        (t) => (t.tableId || t.id) === selectedTableId
      )

      const completeReservation = {
        ...newReservationData,
        table: newReservationData.table || selectedTableObj,
        tableName:
          newReservationData.tableName ||
          selectedTableObj?.tableName ||
          selectedTableObj?.table_name ||
          selectedTableObj?.name,
        guestCount: Number(guestCount),
        reservationTime,
        status: newReservationData.status || newReservationData.trang_thai || 'PENDING',
      }

      onSuccess?.(completeReservation)
    } catch (err) {
      console.error('Create reservation error:', err)
      const msg = err?.response?.data?.message || 'Không thể tạo yêu cầu đặt bàn. Vui lòng thử lại!'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Bước 1: Chọn Thông tin cơ bản */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> 1. Thời gian & Số lượng khách
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ngày đặt */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Ngày dùng bữa <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50"
              required
            />
          </div>

          {/* Số khách */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Số lượng khách <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="20"
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50 pl-10"
                required
              />
              <Users className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>
        </div>

        {/* Khung giờ ăn */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Khung giờ đón khách <span className="text-red-400">*</span>
          </label>

          <div className="space-y-2.5">
            <div>
              <span className="text-[11px] font-medium text-gray-400 block mb-1.5">Buổi trưa:</span>
              <div className="flex flex-wrap gap-2">
                {LUNCH_TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      time === slot
                        ? 'bg-amber-500 text-gray-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-gray-950 border border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-gray-400 block mb-1.5">Buổi tối:</span>
              <div className="flex flex-wrap gap-2">
                {DINNER_TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      time === slot
                        ? 'bg-amber-500 text-gray-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-gray-950 border border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bước 2: Chọn Bàn còn trống */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 2. Chọn vị trí bàn ăn thích hợp
          </h3>
          <span className="text-xs text-gray-400">
            {loadingTables ? 'Đang kiểm tra...' : `${availableTables.length} bàn còn trống`}
          </span>
        </div>

        {loadingTables && (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>Đang tra cứu bàn trống vào lúc {time} ngày {date}...</span>
          </div>
        )}

        {searchError && !loadingTables && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {!loadingTables && !searchError && availableTables.length === 0 && (
          <div className="py-8 text-center bg-gray-950/40 rounded-xl border border-dashed border-gray-800">
            <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-medium">
              Không có bàn trống phù hợp cho {guestCount} khách vào lúc {time}.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Bạn vui lòng chọn khung giờ khác hoặc liên hệ hotline để được hỗ trợ sắp xếp.
            </p>
          </div>
        )}

        {!loadingTables && availableTables.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {availableTables.map((tbl) => {
              const tblId = tbl.tableId || tbl.id
              const tblName = tbl.tableName || tbl.table_name || tbl.name || `Bàn số ${tblId}`
              const cap = tbl.capacity || tbl.so_ghe || 4
              const loc = tbl.location || tbl.vi_tri || 'Sảnh chính'
              const isSelected = selectedTableId === tblId

              return (
                <div
                  key={tblId}
                  onClick={() => setSelectedTableId(tblId)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                      : 'bg-gray-950/70 border-gray-800 hover:border-gray-700 text-gray-300 hover:bg-gray-950'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-100">{tblName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{loc}</p>
                    </div>
                    {isSelected ? (
                      <CheckCircle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-medium">
                        Trống
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800/60">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-500" /> Sức chứa: {cap} khách
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bước 3: Ghi chú thêm */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 space-y-3">
        <label className="block text-sm font-semibold text-amber-400">
          3. Yêu cầu hoặc ghi chú đặc biệt (Tùy chọn)
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Cần chuẩn bị ghế ăn dặm cho em bé, vị trí gần cửa sổ, setup tiệc sinh nhật..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50 resize-none placeholder-gray-600"
        />
        <p className="text-[11px] text-gray-500">
          Lưu ý: Quý khách có thể thay đổi hoặc hủy bàn trước giờ hẹn tối thiểu 60 phút.
        </p>
      </div>

      {/* Nút gửi */}
      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon={CheckCircle}
          loading={submitting}
          disabled={!selectedTableId || submitting}
        >
          {submitting ? 'Đang gửi yêu cầu...' : 'Xác nhận Đặt bàn'}
        </Button>
      </div>
    </form>
  )
}

export default BookingForm
