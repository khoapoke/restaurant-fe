import { useState, useEffect, useCallback } from 'react'
import { ShoppingBag, RefreshCw } from 'lucide-react'
import {
  getAdminOrdersApi,
  updateOrderStatusApi,
  cancelAdminOrderApi,
  confirmOrderPaymentApi,
} from '../services/adminOrderService'
import AdminOrderStatusTabs from '../components/AdminOrderStatusTabs'
import AdminOrderTable from '../components/AdminOrderTable'
import AdminOrderDetailModal from '../components/AdminOrderDetailModal'
import AdminCancelOrderModal from '../components/AdminCancelOrderModal'
import AdminManualPaymentModal from '../components/AdminManualPaymentModal'
import Pagination from '../../../../components/ui/Pagination'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [fulfillmentFilter, setFulfillmentFilter] = useState('ALL')
  const [pagination, setPagination] = useState({ currentPage: 1, perPage: 10, totalItems: 0, lastPage: 1 })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState(null)

  // Modals state
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [cancellingOrder, setCancellingOrder] = useState(null)
  const [confirmingOrder, setConfirmingOrder] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false)
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
      if (fulfillmentFilter !== 'ALL') params.fulfillmentType = fulfillmentFilter

      const res = await getAdminOrdersApi(params)
      const raw = res.data?.data ?? res.data
      const items = Array.isArray(raw) ? raw : (raw?.items || raw?.data || [])
      setOrders(items)

      const pData = res?.data?.pagination || res?.pagination || raw?.meta
      if (pData) {
        setPagination({
          currentPage: Number(pData.currentPage || pData.current_page || page),
          perPage: Number(pData.perPage || pData.per_page || 10),
          totalItems: Number(pData.totalItems || pData.total || 0),
          lastPage: Number(pData.lastPage || pData.last_page || 1),
        })
      } else {
        setPagination({ currentPage: page, perPage: 10, totalItems: items.length, lastPage: Math.ceil(items.length / 10) || 1 })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, fulfillmentFilter])

  useEffect(() => { fetchOrders(1) }, [fetchOrders])

  // Chuyển bước FSM
  const handleNextStatus = async (orderId, targetStatus, order) => {
    // Quy tắc thống nhất: Mọi đơn có giá trị > 0đ (tiền mặt, chuyển khoản, online & tại bàn) đều phải xác nhận thanh toán trước khi Hoàn tất
    const payStatus = order?.payment?.status || order?.payment?.trang_thai
    const totalAmount = Number(order?.totalAmount || order?.tong_tien || 0)
    const isPaid = payStatus === 'PAID' || payStatus === 'Đã thanh toán'
    if (targetStatus === 'COMPLETED' && totalAmount > 0 && !isPaid) {
      alert('Đơn hàng chưa được xác nhận thanh toán. Vui lòng kiểm tra tiền mặt hoặc chuyển khoản và bấm xác nhận đã nhận tiền trước khi hoàn tất đơn.')
      setConfirmingOrder(order)
      return
    }

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

  // Hủy đơn hàng
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

  // ORD-13: Xác nhận đã nhận tiền cho đơn hàng
  const handleConfirmOrderPayment = async (note) => {
    if (!confirmingOrder) return
    const orderId = confirmingOrder.orderId || confirmingOrder.ma_don_hang || confirmingOrder.id
    setIsConfirmingPayment(true)
    try {
      await confirmOrderPaymentApi(orderId, note)
      showToast(`Đã xác nhận thanh toán thành công cho đơn #${orderId}!`)
      setConfirmingOrder(null)
      fetchOrders(pagination.currentPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xác nhận thanh toán lúc này.')
    } finally {
      setIsConfirmingPayment(false)
    }
  }

  return (
    <div className="space-y-6 font-sans">
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

      {/* Lọc nhanh theo hình thức phục vụ */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-text-muted font-semibold text-[11px] mr-1 shrink-0">Hình thức:</span>
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'DELIVERY', label: 'Giao tận nơi' },
          { key: 'PICKUP', label: 'Tự đến lấy' },
          { key: 'DINE_IN', label: 'Dùng tại bàn' },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFulfillmentFilter(f.key)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              fulfillmentFilter === f.key
                ? 'bg-surface-card-hover text-brand-primary border border-brand-primary/40 font-bold'
                : 'text-text-muted hover:text-text-main bg-surface-card border border-border-subtle'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

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
            onConfirmPayment={(order) => setConfirmingOrder(order)}
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
        onConfirmPayment={(order) => setConfirmingOrder(order)}
      />

      <AdminCancelOrderModal
        isOpen={Boolean(cancellingOrder)}
        onClose={() => setCancellingOrder(null)}
        onConfirm={handleCancelConfirm}
        order={cancellingOrder}
        isCancelling={isCancelling}
      />

      <AdminManualPaymentModal
        isOpen={Boolean(confirmingOrder)}
        onClose={() => setConfirmingOrder(null)}
        onConfirm={handleConfirmOrderPayment}
        orderId={confirmingOrder?.orderId || confirmingOrder?.ma_don_hang || confirmingOrder?.id}
        amount={confirmingOrder?.totalAmount || confirmingOrder?.tong_tien}
        isLoading={isConfirmingPayment}
      />
    </div>
  )
}

export default AdminOrdersPage
