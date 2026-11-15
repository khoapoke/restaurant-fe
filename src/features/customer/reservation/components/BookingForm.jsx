import { useState, useEffect, useMemo, useCallback } from 'react'
import BookingStepper from './BookingStepper'
import BookingStep1DateGuest from './BookingStep1DateGuest'
import BookingStep2TimeTable from './BookingStep2TimeTable'
import BookingStep3ReviewNote from './BookingStep3ReviewNote'
import BookingStep4Result from './BookingStep4Result'
import { getAvailableTablesApi, createReservationApi } from '../services/reservationService'

/**
 * Component Form Đặt Bàn Khách Hàng (BookingForm)
 * - Điều phối tiến trình 4 giai đoạn hoàn chỉnh:
 *   Giai đoạn 1: Chọn ngày & số khách
 *   Giai đoạn 2: Chọn giờ & bàn ăn khả dụng
 *   Giai đoạn 3: Xem lại thông tin & ghi chú
 *   Giai đoạn 4: Hiển thị kết quả thành công hoặc báo lỗi kèm nút quay lại
 * - Độ dài < 165 dòng
 */
export default function BookingForm({ onSuccess, onGoToHistory }) {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const [currentStep, setCurrentStep] = useState(1)
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
  const [createdReservation, setCreatedReservation] = useState(null)

  // Tự động tìm bàn trống khi ngày, giờ hoặc số khách thay đổi
  useEffect(() => {
    let isMounted = true
    const fetchTables = async () => {
      if (!date || !time || !guestCount) return
      setLoadingTables(true)
      setSearchError(null)

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

  const selectedTableObj = useMemo(() => {
    return availableTables.find((t) => (t.tableId || t.id) === selectedTableId)
  }, [availableTables, selectedTableId])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setSubmitError(null)

    if (!selectedTableId) {
      setSubmitError('Vui lòng chọn bàn ăn trước khi xác nhận.')
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
      const data = res?.data?.data || res?.data || {}

      const completeReservation = {
        ...data,
        table: data.table || selectedTableObj,
        tableName: data.tableName || selectedTableObj?.tableName || selectedTableObj?.name,
        guestCount: Number(guestCount),
        reservationTime,
        status: data.status || 'PENDING',
      }

      setCreatedReservation(completeReservation)
      onSuccess?.(completeReservation)
      setCurrentStep(4)
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Không thể tạo phiếu đặt bàn. Bàn vừa có khách khác đặt hoặc quá sát giờ.')
      setCurrentStep(4)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetToStep1 = useCallback(() => {
    setSelectedTableId(null)
    setNote('')
    setSubmitError(null)
    setCreatedReservation(null)
    setCurrentStep(1)
  }, [])

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-border-subtle shadow-sm space-y-6">
      {/* Thanh Tiến Trình 4 Giai Đoạn */}
      <BookingStepper currentStep={currentStep} />

      {/* Giai đoạn 1: Ngày & Khách */}
      {currentStep === 1 && (
        <BookingStep1DateGuest
          date={date}
          setDate={setDate}
          todayStr={todayStr}
          guestCount={guestCount}
          setGuestCount={setGuestCount}
          onNext={() => setCurrentStep(2)}
        />
      )}

      {/* Giai đoạn 2: Giờ & Chọn bàn */}
      {currentStep === 2 && (
        <BookingStep2TimeTable
          time={time}
          setTime={setTime}
          availableTables={availableTables}
          loadingTables={loadingTables}
          searchError={searchError}
          selectedTableId={selectedTableId}
          setSelectedTableId={setSelectedTableId}
          date={date}
          guestCount={guestCount}
          onBack={() => setCurrentStep(1)}
          onNext={() => setCurrentStep(3)}
        />
      )}

      {/* Giai đoạn 3: Xem lại & Ghi chú */}
      {currentStep === 3 && (
        <BookingStep3ReviewNote
          date={date}
          time={time}
          guestCount={guestCount}
          selectedTable={selectedTableObj}
          note={note}
          setNote={setNote}
          submitting={submitting}
          submitError={submitError}
          onBack={() => setCurrentStep(2)}
          onSubmit={handleSubmit}
        />
      )}

      {/* Giai đoạn 4: Kết quả phản hồi */}
      {currentStep === 4 && (
        <BookingStep4Result
          isSuccess={!submitError && Boolean(createdReservation)}
          reservation={createdReservation}
          errorMessage={submitError}
          onGoToHistory={onGoToHistory}
          onReset={handleResetToStep1}
        />
      )}
    </div>
  )
}
