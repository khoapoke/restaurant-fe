import { useState, useEffect, useCallback } from 'react'
import { ShoppingBag, RefreshCw } from 'lucide-react'
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

/**
 * Trang Quản Lý Đơn Hàng (AdminOrdersPage)
 * - 100% Centralized Design Tokens
 * - Quản lý an toàn 4 trạng thái UI (Loading, Error, Empty, Data)
 * - Độ dài < 180 dòng
 */
export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [pagination, setPagination] = useState({ currentPage: 1, perPage: 10, totalItems: 0, lastPage: 1 })

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

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, perPage: 10 }
      if (statusFilter !== 'ALL') params.status = statusFilter

      const res = await getAdminOrdersApi(params)
      const items = res.data?.items || res.data || []
      setOrders(Array.isArray(items) ? items : [])

      const pData = res?.data?.pagination || res?.pagination
      if (pData) {
        setPagination({
          currentPage: Number(pData.currentPage || page),
          perPage: Number(pData.perPage || 10),
          totalItems: Number(pData.totalItems || 0),
          lastPage: Number(pData.lastPage || pData.totalPages || 1),
        })
      } else {
        setPagination({ currentPage: page, perPage: 10, totalItems: items.length, lastPage: Math.ceil(items.length / 10) || 1 })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchOrders(1) }, [fetchOrders])

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
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-main">Quản lý Đơn hàng</h2>
            <p className="text-xs text-text-muted">Tổng số {pagination.totalItems} đơn hàng đã phát sinh</p>
          </div>
        </div>

        <Button variant="secondary" size="sm" icon={RefreshCw} isLoading={loading} onClick={() => fetchOrders(pagination.currentPage)}>
          Làm mới
        </Button>
      </div>

      <AdminOrderStatusTabs activeStatus={statusFilter} onSelectStatus={setStatusFilter} />

      {successToast && <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />}
      {error && <Alert type="error" message={error} action={<Button variant="outline" size="sm" onClick={() => fetchOrders(1)}>Thử lại</Button>} />}

      {/* 4 Trạng thái UI */}
      {loading ? (
        <div className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border-subtle">
          <Skeleton className="h-8 w-full bg-surface-card-hover" />
          <Skeleton className="h-14 w-full bg-surface-card-hover" />
          <Skeleton className="h-14 w-full bg-surface-card-hover" />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-surface-card border border-border-subtle space-y-3">
          <ShoppingBag className="w-10 h-10 text-text-dim mx-auto" />
          <p className="text-sm font-semibold text-text-main">Không tìm thấy đơn hàng nào</p>
          <p className="text-xs text-text-muted max-w-xs mx-auto">Chưa có đơn hàng nào khớp với bộ lọc trạng thái hiện tại.</p>
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
          <Pagination
            currentPage={pagination.currentPage}
            lastPage={pagination.lastPage}
            totalItems={pagination.totalItems}
            itemLabel="đơn hàng"
            onPageChange={(p) => fetchOrders(p)}
          />
        </div>
      )}

      {/* Modals */}
      <AdminOrderDetailModal
        orderId={selectedOrderId}
        isOpen={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(null)}
      />

      <AdminCancelOrderModal
        isOpen={Boolean(cancellingOrder)}
        onClose={() => setCancellingOrder(null)}
        onConfirm={handleCancelConfirm}
        order={cancellingOrder}
        isCancelling={isCancelling}
      />
    </div>
  )
}

export default AdminOrdersPage
