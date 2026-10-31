import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  History,
  UtensilsCrossed,
  ShoppingBag,
  Package,
  User,
  Shield,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import { useCart } from '../../../../contexts/CartContext'
import Button from '../../../../components/ui/Button'
import BookingForm from '../components/BookingForm'
import ReservationCard from '../components/ReservationCard'
import CancelReservationModal from '../components/CancelReservationModal'
import EditReservationModal from '../components/EditReservationModal'
import { getCustomerReservationsApi } from '../services/reservationService'
import { extractReservationList, normalizeReservationStatus } from '../constants'

export const CustomerReservationPage = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalQuantity } = useCart()

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
      const list = extractReservationList(res)
      setReservations(list)
    } catch (err) {
      console.error('Fetch reservations error:', err)
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
    setSuccessBanner('Yêu cầu đặt bàn của bạn đã được gửi thành công! Nhà hàng sẽ duyệt trong ít phút.')
    setActiveTab('history')
    setFilterStatus('ALL')

    // Optimistic update: nếu có dữ liệu lượt đặt mới, đưa ngay vào đầu danh sách
    if (newReservation) {
      setReservations((prev) => {
        const newId =
          newReservation.reservationId || newReservation.id || newReservation.ma_dat_ban
        const exists = prev.some(
          (r) => (r.reservationId || r.id || r.ma_dat_ban) === newId
        )
        return exists ? prev : [newReservation, ...prev]
      })
    }

    // Đồng bộ lại từ API server
    fetchReservations()
  }

  // Đếm số lượng theo từng trạng thái chuẩn hóa
  const counts = {
    ALL: reservations.length,
    PENDING: reservations.filter((r) => {
      const st = normalizeReservationStatus(
        r.status || r.trang_thai || r.reservationStatus || r.reservation_status || r.tinh_trang
      )
      return st === 'PENDING'
    }).length,
    CONFIRMED: reservations.filter((r) => {
      const st = normalizeReservationStatus(
        r.status || r.trang_thai || r.reservationStatus || r.reservation_status || r.tinh_trang
      )
      return st === 'CONFIRMED'
    }).length,
    COMPLETED: reservations.filter((r) => {
      const st = normalizeReservationStatus(
        r.status || r.trang_thai || r.reservationStatus || r.reservation_status || r.tinh_trang
      )
      return st === 'COMPLETED'
    }).length,
    CANCELLED: reservations.filter((r) => {
      const st = normalizeReservationStatus(
        r.status || r.trang_thai || r.reservationStatus || r.reservation_status || r.tinh_trang
      )
      return st === 'CANCELLED'
    }).length,
    REJECTED: reservations.filter((r) => {
      const st = normalizeReservationStatus(
        r.status || r.trang_thai || r.reservationStatus || r.reservation_status || r.tinh_trang
      )
      return st === 'REJECTED'
    }).length,
  }

  const filteredReservations = reservations.filter((r) => {
    if (filterStatus === 'ALL') return true
    const st = normalizeReservationStatus(
      r.status || r.trang_thai || r.reservationStatus || r.reservation_status || r.tinh_trang
    )
    return st === filterStatus
  })

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col">
      {/* Header Điều Hướng */}
      <header className="border-b border-gray-800 bg-gray-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-gray-950 font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold tracking-wider text-white">LUMIÈRE</span>
              <span className="text-[10px] block text-amber-400 tracking-widest uppercase">Restaurant</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/menu"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
              <span>Thực đơn</span>
            </Link>
            <Link
              to="/reservation"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 transition-colors flex items-center gap-1.5"
            >
              <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
              <span>Đặt bàn</span>
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5 text-amber-500" />
                <span>Đơn hàng</span>
              </Link>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 transition-colors flex items-center gap-1.5 ml-2"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Trang Quản trị</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              title="Xem giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-amber-500 text-gray-950 font-bold text-[10px] flex items-center justify-center shadow-md">
                  {totalQuantity}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm" icon={User}>
                  Hồ sơ
                </Button>
              </Link>
              <Button variant="secondary" size="sm" icon={LogOut} onClick={logout}>
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Đăng ký</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner tiêu đề */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-2">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Dịch vụ giữ chỗ trực tuyến</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Đặt bàn tại Lumière
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Chọn thời gian và vị trí bàn yêu thích cho bữa tối hoàn hảo của bạn.
            </p>
          </div>

          {/* Tab Navigation Pill */}
          <div className="flex items-center p-1 bg-gray-900 border border-gray-800 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'booking'
                  ? 'bg-amber-500 text-gray-950 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Đặt bàn mới</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-gray-950 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Lịch sử đặt bàn</span>
            </button>
          </div>
        </div>

        {/* Thông báo thành công nếu có */}
        {successBanner && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{successBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-500 hover:text-emerald-300 text-xs font-bold"
            >
              Đóng
            </button>
          </div>
        )}

        {/* TAB 1: FORM ĐẶT BÀN */}
        {activeTab === 'booking' && (
          <div>
            {!isAuthenticated && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 flex-shrink-0 text-amber-400" />
                  <span>
                    Vui lòng đăng nhập tài khoản Khách hàng để hoàn tất việc xác nhận đặt bàn trực tuyến.
                  </span>
                </div>
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    Đăng nhập ngay
                  </Button>
                </Link>
              </div>
            )}
            <BookingForm onSuccess={handleBookingSuccess} />
          </div>
        )}

        {/* TAB 2: LỊCH SỬ ĐẶT BÀN */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {!isAuthenticated ? (
              <div className="py-16 text-center bg-gray-900/40 rounded-2xl border border-gray-800 p-8 space-y-4">
                <Lock className="w-12 h-12 text-amber-500/60 mx-auto" />
                <h3 className="text-base font-semibold text-white">Yêu cầu đăng nhập</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Bạn cần đăng nhập tài khoản để theo dõi lịch sử đặt bàn và trạng thái duyệt từ nhà hàng.
                </p>
                <Link to="/login">
                  <Button variant="primary" size="md">
                    Đăng nhập tài khoản
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Thanh Lọc & Refresh */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { key: 'ALL', label: 'Tất cả' },
                      { key: 'PENDING', label: 'Chờ duyệt' },
                      { key: 'CONFIRMED', label: 'Đã xác nhận' },
                      { key: 'COMPLETED', label: 'Hoàn tất' },
                      { key: 'CANCELLED', label: 'Đã hủy' },
                      { key: 'REJECTED', label: 'Từ chối' },
                    ].map((tab) => {
                      const count = counts[tab.key] || 0
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setFilterStatus(tab.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                            filterStatus === tab.key
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-800'
                          }`}
                        >
                          <span>{tab.label}</span>
                          {count > 0 && (
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                                filterStatus === tab.key
                                  ? 'bg-amber-500 text-gray-950 font-bold'
                                  : 'bg-gray-800 text-gray-400'
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={RefreshCw}
                    onClick={fetchReservations}
                    loading={loadingHistory}
                  >
                    Làm mới
                  </Button>
                </div>

                {/* 4 Trạng thái UI */}
                {loadingHistory && (
                  <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-400 text-sm">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải lịch sử đặt bàn của bạn...</span>
                  </div>
                )}

                {historyError && !loadingHistory && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{historyError}</span>
                    </div>
                    <Button variant="secondary" size="sm" onClick={fetchReservations}>
                      Thử lại
                    </Button>
                  </div>
                )}

                {!loadingHistory && !historyError && filteredReservations.length === 0 && (
                  <div className="py-16 text-center bg-gray-900/40 rounded-2xl border border-dashed border-gray-800 p-8 space-y-3">
                    <CalendarDays className="w-10 h-10 text-gray-600 mx-auto" />
                    <h4 className="text-sm font-semibold text-gray-300">
                      Không có lượt đặt bàn nào {filterStatus !== 'ALL' ? 'ở trạng thái này' : ''}
                    </h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      {filterStatus !== 'ALL' && reservations.length > 0
                        ? `Bạn đang có ${reservations.length} lượt đặt bàn ở các trạng thái khác.`
                        : 'Bạn chưa gửi yêu cầu đặt bàn nào hoặc các lượt đặt đã hoàn tất.'}
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      {filterStatus !== 'ALL' && reservations.length > 0 ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setFilterStatus('ALL')}
                        >
                          Xem tất cả ({reservations.length} lượt đặt)
                        </Button>
                      ) : null}
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CalendarDays}
                        onClick={() => setActiveTab('booking')}
                      >
                        Đặt bàn mới ngay
                      </Button>
                    </div>
                  </div>
                )}

                {!loadingHistory && !historyError && filteredReservations.length > 0 && (
                  <div className="space-y-4">
                    {filteredReservations.map((item) => (
                      <ReservationCard
                        key={item.reservationId || item.id}
                        reservation={item}
                        onEdit={(res) => setEditModalItem(res)}
                        onCancel={(res) => setCancelModalItem(res)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Modals Hủy và Sửa */}
      <CancelReservationModal
        isOpen={Boolean(cancelModalItem)}
        reservation={cancelModalItem}
        onClose={() => setCancelModalItem(null)}
        onSuccess={() => {
          setSuccessBanner('Đã hủy lượt đặt bàn thành công.')
          fetchReservations()
        }}
      />

      <EditReservationModal
        isOpen={Boolean(editModalItem)}
        reservation={editModalItem}
        onClose={() => setEditModalItem(null)}
        onSuccess={() => {
          setSuccessBanner('Đã cập nhật thông tin lượt đặt bàn thành công.')
          fetchReservations()
        }}
      />
    </div>
  )
}

export default CustomerReservationPage
