import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Package,
  RefreshCw,
  AlertTriangle,
  Inbox,
} from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import { getOrdersApi } from '../services/orderService'
import { OrderStatus } from '../constants'
import OrderCard from '../components/OrderCard'
import OrderDetailModal from '../components/OrderDetailModal'
import QrPaymentModal from '../components/QrPaymentModal'
import CancelOrderModal from '../components/CancelOrderModal'
import Button from '../../../../components/ui/Button'
import Skeleton from '../../../../components/ui/Skeleton'
import Alert from '../../../../components/ui/Alert'
import MocSiteHeader from '../../../../components/navigation/MocSiteHeader'
import MocFooter from '../../../../components/navigation/MocFooter'

export const CustomerOrdersPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, role } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
    else if (role === 'ADMIN') navigate('/admin')
  }, [isAuthenticated, role, navigate])

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [bannerNotice, setBannerNotice] = useState(location.state?.successMessage || null)

  // Modals state
  const [detailOrderId, setDetailOrderId] = useState(null)
  const [qrOrderId, setQrOrderId] = useState(null)
  const [cancelOrderId, setCancelOrderId] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getOrdersApi()
      const data = response.data?.items || response.data || []
      setOrders(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchOrders()
  }, [isAuthenticated, fetchOrders])

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === 'ALL') return true
    return o.status === selectedStatus
  })

  const tabs = [
    { key: 'ALL', label: 'Tất cả đơn' },
    { key: OrderStatus.PENDING_CONFIRMATION, label: 'Chờ xác nhận' },
    { key: OrderStatus.CONFIRMED, label: 'Đã xác nhận' },
    { key: OrderStatus.PREPARING, label: 'Bếp đang nấu' },
    { key: OrderStatus.DELIVERING, label: 'Đang giao' },
    { key: OrderStatus.COMPLETED, label: 'Hoàn thành' },
    { key: OrderStatus.CANCELLED, label: 'Đã hủy' },
  ]

  return (
    <div className="moc-page-shell flex flex-col">
      <MocSiteHeader />

      <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-8 py-12 lg:py-16 space-y-8">
        <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 border-b border-[var(--moc-line)] pb-8">
          <div>
            <span className="moc-eyebrow">HÀNH TRÌNH MÓN ĂN</span>
            <h1 className="moc-section-title mt-4 flex items-center gap-4">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 text-[#6f1d32]" />
              Đơn hàng của bạn.
            </h1>
            <p className="mt-4 text-sm text-[#766e68]">Theo dõi từ lúc nhà hàng xác nhận đến khi món được phục vụ.</p>
          </div>
          <Link to="/menu">
            <Button variant="outline" size="md">Gọi thêm món</Button>
          </Link>
        </section>
        {bannerNotice && (
          <Alert
            type="success"
            message={bannerNotice}
            onClose={() => setBannerNotice(null)}
          />
        )}

        {/* Tab Filter theo trạng thái */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer
                ${
                  selectedStatus === tab.key
                    ? 'bg-amber-500 text-gray-950 font-bold shadow-md'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* UI STATE 1: LOADING */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        )}

        {/* UI STATE 2: ERROR */}
        {!loading && error && (
          <div className="p-12 text-center rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-xs text-red-400">{error}</p>
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={fetchOrders}>
              Thử lại
            </Button>
          </div>
        )}

        {/* UI STATE 3: EMPTY */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-gray-800 bg-gray-900/30 space-y-4 my-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-800/80 flex items-center justify-center text-gray-500 mx-auto">
              <Inbox className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-200">Không có đơn hàng nào</h3>
              <p className="text-xs text-gray-500 mt-1">
                {selectedStatus === 'ALL'
                  ? 'Bạn chưa đặt món ăn nào tại nhà hàng.'
                  : 'Không có đơn hàng nào thuộc trạng thái này.'}
              </p>
            </div>
            <Link to="/menu">
              <Button variant="primary" size="sm">
                Khám phá Thực đơn
              </Button>
            </Link>
          </div>
        )}

        {/* UI STATE 4: SUCCESS LIST */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onViewDetail={(id) => setDetailOrderId(id)}
                onOpenQr={(id) => setQrOrderId(id)}
                onOpenCancel={(id) => setCancelOrderId(id)}
              />
            ))}
          </div>
        )}
      </main>

      <MocFooter />

      <OrderDetailModal
        orderId={detailOrderId}
        isOpen={!!detailOrderId}
        onClose={() => setDetailOrderId(null)}
        onOpenQr={(id) => setQrOrderId(id)}
        onOpenCancel={(id) => setCancelOrderId(id)}
      />

      <QrPaymentModal
        orderId={qrOrderId}
        isOpen={!!qrOrderId}
        onClose={() => setQrOrderId(null)}
        onPaymentSuccess={() => {
          fetchOrders()
          setBannerNotice('Thanh toán đơn hàng thành công!')
        }}
      />

      <CancelOrderModal
        orderId={cancelOrderId}
        isOpen={!!cancelOrderId}
        onClose={() => setCancelOrderId(null)}
        onSuccess={() => {
          fetchOrders()
          setBannerNotice('Đơn hàng đã được yêu cầu hủy thành công.')
        }}
      />
    </div>
  )
}

export default CustomerOrdersPage
