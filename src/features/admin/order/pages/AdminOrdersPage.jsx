import { useState, useEffect, useCallback } from 'react'
import { ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react'
import {
  getAdminOrdersApi,
  updateOrderStatusApi,
  cancelAdminOrderApi,
} from '../services/adminOrderService'
import AdminOrderStatusTabs from '../components/AdminOrderStatusTabs'
import AdminOrderTable from '../components/AdminOrderTable'
import AdminOrderDetailModal from '../components/AdminOrderDetailModal'
import AdminCancelOrderModal from '../components/AdminCancelOrderModal'
import Pagination from '../../../../components/ui/Pagination'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
    lastPage: 1,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState(null)

  // Modals state
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [cancellingOrder, setCancellingOrder] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 3000)
  }

  const fetchOrders = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError(null)
      try {
        const params = {
          page,
          perPage: 10,
        }
        if (statusFilter !== 'ALL') {
          params.status = statusFilter
        }

        const res = await getAdminOrdersApi(params)
        const items = res.data?.items || res.data || []
        setOrders(Array.isArray(items) ? items : [])

        if (res.data?.pagination) {
          setPagination(res.data.pagination)
        } else {
          setPagination({
            currentPage: page,
            perPage: 10,
            totalItems: items.length,
            lastPage: Math.ceil(items.length / 10) || 1,
          })
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.')
      } finally {
        setLoading(false)
      }
    },
    [statusFilter]
  )

  useEffect(() => {
    fetchOrders(1)
  }, [fetchOrders])

  const handleNextStatus = async (orderId, targetStatus) => {
    setActionLoadingId(orderId)
    try {
      await updateOrderStatusApi(orderId, targetStatus)
      showToast(`Đã chuyển đơn #${orderId} sang trạng thái tiếp theo!`)
      fetchOrders(pagination.currentPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể chuyển trạng thái đơn hàng.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancelConfirm = async (orderId, cancelReason) => {
    setIsCancelling(true)
    try {
      await cancelAdminOrderApi(orderId, cancelReason)
      showToast(`Đã hủy đơn hàng #${orderId}!`)
      setCancellingOrder(null)
      fetchOrders(pagination.currentPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng.')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Quản lý Đơn hàng</h2>
            <p className="text-xs text-gray-400">
              Điều phối tiến độ chế biến và giao nhận cho thực khách
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          isLoading={loading}
          onClick={() => fetchOrders(pagination.currentPage)}
        >
          Làm mới
        </Button>
      </div>

      {/* Status tabs */}
      <AdminOrderStatusTabs
        activeStatus={statusFilter}
        onSelectStatus={(status) => {
          setStatusFilter(status)
        }}
      />

      {successToast && (
        <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          action={
            <Button variant="outline" size="sm" onClick={() => fetchOrders(1)}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* 4 Trạng thái UI */}
      {loading ? (
        <div className="space-y-3 p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
          <Skeleton className="h-8 w-full bg-gray-800" />
          <Skeleton className="h-14 w-full bg-gray-800" />
          <Skeleton className="h-14 w-full bg-gray-800" />
          <Skeleton className="h-14 w-full bg-gray-800" />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-gray-900/40 border border-gray-800 space-y-3">
          <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">Không có đơn hàng nào</p>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {statusFilter !== 'ALL'
              ? 'Không có đơn hàng nào khớp với trạng thái đã chọn.'
              : 'Hiện chưa có khách hàng nào đặt đơn.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AdminOrderTable
            orders={orders}
            onViewDetail={(id) => setSelectedOrderId(id)}
            onNextStatus={handleNextStatus}
            onCancel={(order) => setCancellingOrder(order)}
            actionLoadingId={actionLoadingId}
          />

          {pagination.lastPage > 1 && (
            <div className="flex justify-end pt-2">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.lastPage}
                onPageChange={(p) => fetchOrders(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AdminOrderDetailModal
        orderId={selectedOrderId}
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />

      <AdminCancelOrderModal
        isOpen={!!cancellingOrder}
        onClose={() => setCancellingOrder(null)}
        onConfirm={handleCancelConfirm}
        order={cancellingOrder}
        isCancelling={isCancelling}
      />
    </div>
  )
}

export default AdminOrdersPage

