import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { getAdminOrderDetailApi } from '../services/adminOrderService'
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from '../constants'
import { Loader2, MapPin, Phone, User, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'

export const AdminOrderDetailModal = ({ orderId, isOpen, onClose, onConfirmPayment }) => {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId || !isOpen) {
      setOrder(null)
      setError(null)
      return
    }

    const loadDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getAdminOrderDetailApi(orderId)
        setOrder(response.data?.data || response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng.')
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [orderId, isOpen])

  const status = order?.status || order?.trang_thai
  const statusConfig = ORDER_STATUS_CONFIG[status] || {
    label: status,
    color: 'text-text-muted bg-surface-elevated border-border-strong',
  }

  const paymentStatus = order?.payment?.status || order?.payment?.trang_thai || 'UNPAID'
  const payMethod = order?.payment?.paymentMethod || order?.payment?.method || order?.paymentMethod
  const payConfig = PAYMENT_STATUS_CONFIG[paymentStatus] || PAYMENT_STATUS_CONFIG.UNPAID
  const methodLabel = PAYMENT_METHOD_CONFIG[payMethod]?.label || payMethod || 'Tại quầy / Tiền mặt'
  const addr = String(order?.shippingAddress || order?.dia_chi_giao_hang || '')
  const isDineIn = order?.fulfillmentType === 'DINE_IN' || Boolean(order?.tableId) || addr.startsWith('Tại bàn')

  const isPaid = paymentStatus === 'PAID' || paymentStatus === 'Đã thanh toán'
  const canConfirmPayment =
    !isPaid && Number(order?.totalAmount || 0) > 0 && status !== 'CANCELLED'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết đơn hàng #${orderId || ''}`}
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-xs text-text-muted">Đang tải thông tin đơn hàng...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-status-error mx-auto" />
          <p className="text-xs text-status-error">{error}</p>
        </div>
      ) : order ? (
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 font-sans text-xs">
          {/* Header bar: Status + Date */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-bg border border-border-subtle">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full font-bold border text-[11px] ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              <span className={`px-2.5 py-1 rounded-full font-bold border text-[11px] ${payConfig.color}`}>
                {payConfig.label} ({methodLabel})
              </span>
            </div>
            <span className="text-text-muted flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-text-dim" />
              {order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : '—'}
            </span>
          </div>

          {/* Quick Manual Payment Confirmation Banner */}
          {canConfirmPayment && (
            <div className="p-3 rounded-xl bg-status-warning/10 border border-status-warning/30 flex items-center justify-between gap-3">
              <span className="text-[11px] text-status-warning font-medium">
                Đơn hàng ({methodLabel}) chưa được xác nhận thanh toán. Vui lòng kiểm tra tiền mặt hoặc chuyển khoản rồi xác nhận.
              </span>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => {
                  onClose()
                  onConfirmPayment?.(order)
                }}
                className="text-[11px] py-1 px-2.5 shrink-0"
              >
                Xác nhận đã nhận tiền
              </Button>
            </div>
          )}

          {/* Delivery & Customer Info */}
          <div className="p-3.5 rounded-xl bg-surface-bg border border-border-subtle space-y-2">
            <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Thông tin nhận hàng
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-body">
              <p className="flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span>{order.customerName || order.recipientName || 'Khách hàng'}</span>
              </p>
              <p className="flex items-center gap-1.5 truncate">
                <Phone className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span>{order.customerPhone || order.recipientPhone || '—'}</span>
              </p>
            </div>
            <p className="flex items-start gap-1.5 text-text-body pt-1 border-t border-border-subtle">
              <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
              <span>{order.shippingAddress || 'Ăn tại chỗ'}</span>
            </p>
            {order.orderNote && (
              <p className="text-[11px] text-brand-hover italic bg-brand-primary/5 p-2 rounded-lg border border-brand-primary/10">
                Ghi chú: {order.orderNote}
              </p>
            )}
          </div>

          {/* Items list */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Danh sách món đã đặt ({(order.items || []).length} món)
            </h4>
            <div className="divide-y divide-border-subtle border border-border-subtle rounded-xl bg-surface-bg overflow-hidden">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono font-bold text-brand-primary text-xs w-6 shrink-0">
                      x{item.quantity}
                    </span>
                    <span className="font-semibold text-text-main truncate">
                      {item.dishName}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-text-body">
                      {Number(item.subTotal || item.unitPrice * item.quantity || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total summary */}
          <div className="p-3.5 rounded-xl bg-surface-bg border border-border-subtle flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Tổng thanh toán:</span>
            <span className="text-base font-extrabold text-brand-primary font-mono">
              {Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="flex justify-end pt-2 border-t border-border-subtle">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

export default AdminOrderDetailModal
