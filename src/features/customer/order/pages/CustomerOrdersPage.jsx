import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Package, RefreshCw, AlertTriangle, Utensils } from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import { getOrdersApi } from '../services/orderService'
import HomeHeader from '../../Home/components/HomeHeader'
import HomeFooter from '../../Home/components/HomeFooter'
import OrderFilterTabs from '../components/OrderFilterTabs'
import OrderEmptyState from '../components/OrderEmptyState'
import OrderCard from '../components/OrderCard'
import OrderDetailModal from '../components/OrderDetailModal'
import QrPaymentModal from '../components/QrPaymentModal'
import CancelOrderModal from '../components/CancelOrderModal'
import Button from '../../../../components/ui/Button'
import Skeleton from '../../../../components/ui/Skeleton'
import Alert from '../../../../components/ui/Alert'

/**
 * Trang Lịch Sử Đơn Hàng Khách Hàng (CustomerOrdersPage)
 * - Tinh tế Fine-Dining & Đồng bộ Navbar HomeHeader / HomeFooter
 * - Bộ lọc Tab trạng thái có badge đếm số lượng đơn
 * - Quản lý an toàn 4 trạng thái UI (Loading, Error, Empty, Data)
 * - Độ dài < 160 dòng
 */
export default function CustomerOrdersPage() {
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

  const [detailOrderId, setDetailOrderId] = useState(null)
  const [qrOrderId, setQrOrderId] = useState(null)
  const [cancelOrderId, setCancelOrderId] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getOrdersApi()
      const data = response.data?.items || response.data || []
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchOrders()
  }, [isAuthenticated, fetchOrders])

  const counts = useMemo(() => {
    const map = { ALL: orders.length }
    for (const o of orders) {
      if (o.status) map[o.status] = (map[o.status] || 0) + 1
    }
    return map
  }, [orders])

  const filteredOrders = useMemo(() => {
    if (selectedStatus === 'ALL') return orders
    return orders.filter((o) => o.status === selectedStatus)
  }, [orders, selectedStatus])

  return (
    <div className="min-h-screen bg-surface-bg text-text-main flex flex-col">
      <HomeHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text-main tracking-tight flex items-center gap-2.5">
              <Package className="w-7 h-7 text-brand-primary" />
              <span>Lịch sử đơn hàng</span>
            </h1>
            <p className="text-xs text-text-muted mt-1">Theo dõi tiến độ chế biến và giao nhận món ăn của bạn</p>
          </div>

          <Link to="/menu">
            <Button variant="outline" size="sm" icon={Utensils}>
              Gọi thêm món
            </Button>
          </Link>
        </div>

        {bannerNotice && (
          <Alert type="success" message={bannerNotice} onClose={() => setBannerNotice(null)} />
        )}

        <OrderFilterTabs
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          counts={counts}
        />

        {loading ? (
          <div className="space-y-4 pt-2">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <div className="p-10 text-center rounded-2xl border border-status-error/20 bg-status-error/5 space-y-3">
            <AlertTriangle className="w-8 h-8 text-status-error mx-auto" />
            <p className="text-xs text-status-error">{error}</p>
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={fetchOrders}>
              Thử lại
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <OrderEmptyState selectedStatus={selectedStatus} />
        ) : (
          <div className="space-y-4 pt-1">
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

      <OrderDetailModal
        orderId={detailOrderId}
        isOpen={Boolean(detailOrderId)}
        onClose={() => setDetailOrderId(null)}
        onOpenQr={(id) => setQrOrderId(id)}
        onOpenCancel={(id) => setCancelOrderId(id)}
      />

      <QrPaymentModal
        orderId={qrOrderId}
        isOpen={Boolean(qrOrderId)}
        onClose={() => setQrOrderId(null)}
        onPaymentSuccess={() => {
          fetchOrders()
          setBannerNotice('Thanh toán đơn hàng thành công!')
        }}
      />

      <CancelOrderModal
        orderId={cancelOrderId}
        isOpen={Boolean(cancelOrderId)}
        onClose={() => setCancelOrderId(null)}
        onSuccess={() => {
          fetchOrders()
          setBannerNotice('Đơn hàng đã được yêu cầu hủy thành công.')
        }}
      />

      <HomeFooter />
    </div>
  )
}
