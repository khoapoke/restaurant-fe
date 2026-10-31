import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { getAdminOrderDetailApi } from '../services/adminOrderService'
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from '../constants'
import { Loader2, Package, MapPin, Phone, User, Clock, AlertTriangle } from 'lucide-react'

export const AdminOrderDetailModal = ({ orderId, isOpen, onClose }) => {
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
        setOrder(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng.')
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [orderId, isOpen])

  const statusConfig = ORDER_STATUS_CONFIG[order?.status] || {
    label: order?.status,
    color: 'text-gray-300 bg-gray-800 border-gray-700',
  }

  const paymentStatus = order?.payment?.status || 'UNPAID'
  const payConfig = PAYMENT_STATUS_CONFIG[paymentStatus] || PAYMENT_STATUS_CONFIG.UNPAID
  const methodLabel = PAYMENT_METHOD_CONFIG[order?.payment?.paymentMethod]?.label || 'Chưa chọn'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết đơn hàng #${orderId || ''}`}
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-gray-400">Đang tải thông tin đơn hàng...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      ) : order ? (
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Header bar: Status + Date */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-950 border border-gray-800 text-xs">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full font-bold border text-[11px] ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              <span className={`px-2.5 py-1 rounded-full font-bold border text-[11px] ${payConfig.color}`}>
                {payConfig.label} ({methodLabel})
              </span>
            </div>
            <span className="text-gray-400 flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              {order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : '—'}
            </span>
          </div>

          {/* Delivery & Customer Info */}
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-2 text-xs">
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Thông tin nhận hàng
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
              <p className="flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{order.recipientName || 'Khách hàng'}</span>
              </p>
              <p className="flex items-center gap-1.5 truncate">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{order.recipientPhone || '—'}</span>
              </p>
            </div>
            <p className="flex items-start gap-1.5 text-gray-300 pt-1 border-t border-gray-900">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{order.shippingAddress || 'Ăn tại chỗ'}</span>
            </p>
            {order.orderNote && (
              <p className="text-[11px] text-amber-300/80 italic bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                Ghi chú: {order.orderNote}
              </p>
            )}
          </div>

          {/* Items list */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Danh sách món đã đặt ({(order.items || []).length} món)
            </h4>
            <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl bg-gray-950 overflow-hidden">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono font-bold text-amber-400 text-xs w-6 shrink-0">
                      x{item.quantity}
                    </span>
                    <span className="font-semibold text-gray-100 truncate">
                      {item.dishName}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-gray-200">
                      {Number(item.subTotal || item.unitPrice * item.quantity || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total summary */}
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-300">Tổng thanh toán:</span>
            <span className="text-base font-extrabold text-amber-400 font-mono">
              {Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-800">
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

