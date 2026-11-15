import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, History, CheckCircle2, Lock, Flame } from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import HomeHeader from '../../Home/components/HomeHeader'
import HomeFooter from '../../Home/components/HomeFooter'
import BookingForm from '../components/BookingForm'
import ReservationHistoryTab from '../components/ReservationHistoryTab'
import CancelReservationModal from '../components/CancelReservationModal'
import EditReservationModal from '../components/EditReservationModal'
import { getCustomerReservationsApi } from '../services/reservationService'
import { extractReservationList, normalizeReservationStatus } from '../constants'

/**
 * Trang Đặt Bàn Trực Tuyến Khách Hàng (CustomerReservationPage)
 * Chuẩn mực Design System:
 * - Đồng bộ Navbar HomeHeader & HomeFooter
 * - Quy trình 3 khối trực quan: Thời gian -> Chọn bàn -> Xác nhận
 * - Tab Lịch sử đặt bàn với bộ lọc trạng thái và modal sửa/hủy
 * - Độ dài < 170 dòng
 */
export default function CustomerReservationPage() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('booking') // 'booking' | 'history'
  const [reservations, setReservations] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')

  const [cancelModalItem, setCancelModalItem] = useState(null)
  const [editModalItem, setEditModalItem] = useState(null)
  const [successBanner, setSuccessBanner] = useState(null)

  const fetchReservations = useCallback(async () => {
    if (!isAuthenticated) return
    setLoadingHistory(true)
    setHistoryError(null)
    try {
      const res = await getCustomerReservationsApi()
      setReservations(extractReservationList(res))
    } catch (err) {
      setHistoryError(err?.response?.data?.message || 'Không thể tải lịch sử đặt bàn.')
    } finally {
      setLoadingHistory(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (activeTab === 'history' && isAuthenticated) {
      fetchReservations()
    }
  }, [activeTab, isAuthenticated, fetchReservations])

  const handleBookingSuccess = (newReservation) => {
    if (newReservation) {
      setReservations((prev) => [newReservation, ...prev])
    }
    fetchReservations()
  }

  const counts = useMemo(() => {
    const map = { ALL: reservations.length, PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0, REJECTED: 0 }
    reservations.forEach((r) => {
      const st = normalizeReservationStatus(r.status || r.trang_thai)
      if (map[st] !== undefined) map[st]++
    })
    return map
  }, [reservations])

  return (
    <div className="min-h-screen bg-surface-bg text-text-body flex flex-col selection:bg-brand-primary selection:text-surface-bg">
      <HomeHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Banner Tiêu Đề & Tab Pill Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle text-xs font-semibold text-brand-primary mb-2.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Dịch vụ giữ chỗ trực tuyến đẳng cấp</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
              Đặt Bàn Trực Tuyến
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
              Chọn thời gian và vị trí bàn yêu thích cho bữa tiệc hoàn hảo của bạn.
            </p>
          </div>

          <div className="flex items-center p-1 bg-surface-card border border-border-subtle rounded-xl self-start sm:self-auto shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'booking' ? 'bg-brand-primary text-surface-bg shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Đặt bàn mới</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'history' ? 'bg-brand-primary text-surface-bg shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Lịch sử đặt bàn</span>
            </button>
          </div>
        </div>

        {/* Thông báo thành công */}
        {successBanner && (
          <div className="p-4 rounded-xl bg-brand-subtle border border-border-brand text-brand-primary text-xs sm:text-sm flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessBanner(null)}
              className="text-brand-primary font-bold hover:underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Tab 1: Form Đặt Bàn Mới */}
        {activeTab === 'booking' && (
          <div className="space-y-6">
            {!isAuthenticated && (
              <div className="p-4 rounded-xl bg-surface-card border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-text-muted text-xs">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 shrink-0 text-brand-primary" />
                  <span>Vui lòng đăng nhập tài khoản Khách hàng để hoàn tất việc xác nhận đặt bàn trực tuyến.</span>
                </div>
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary hover:bg-brand-hover text-surface-bg transition-colors shrink-0"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            )}
            <BookingForm
              onSuccess={handleBookingSuccess}
              onGoToHistory={() => {
                setActiveTab('history')
                setFilterStatus('ALL')
              }}
            />
          </div>
        )}

        {/* Tab 2: Lịch Sử Đặt Bàn */}
        {activeTab === 'history' && (
          <ReservationHistoryTab
            isAuthenticated={isAuthenticated}
            reservations={reservations}
            loadingHistory={loadingHistory}
            historyError={historyError}
            onRefresh={fetchReservations}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            counts={counts}
            onEdit={(res) => setEditModalItem(res)}
            onCancel={(res) => setCancelModalItem(res)}
            onGoToBooking={() => setActiveTab('booking')}
          />
        )}
      </main>

      <CancelReservationModal
        isOpen={Boolean(cancelModalItem)}
        reservation={cancelModalItem}
        onClose={() => setCancelModalItem(null)}
        onSuccess={() => { setSuccessBanner('Đã hủy lượt đặt bàn thành công.'); fetchReservations(); }}
      />

      <EditReservationModal
        isOpen={Boolean(editModalItem)}
        reservation={editModalItem}
        onClose={() => setEditModalItem(null)}
        onSuccess={() => { setSuccessBanner('Đã cập nhật thông tin lượt đặt bàn thành công.'); fetchReservations(); }}
      />

      <HomeFooter />
    </div>
  )
}
