import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { getOrderDetailApi } from '../services/orderService'
import {
  ORDER_STATUS_CONFIG,
  FULFILLMENT_CONFIG,
  PAYMENT_METHOD_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from '../constants'
import { FALLBACK_DISH_IMAGE } from '../../menu/constants'
import { Loader2, AlertTriangle, QrCode, XCircle } from 'lucide-react'

export const OrderDetailModal = ({
  orderId,
  isOpen,
  onClose,
  onOpenQr,
  onOpenCancel,
}) => {
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
        const response = await getOrderDetailApi(orderId)
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
    color: 'text-gray-300',
    bg: 'bg-gray-800',
    border: 'border-gray-700',
  }

  const isPending = order?.status === 'PENDING_CONFIRMATION'
  const isUnpaid =
    order?.payment?.status === 'UNPAID' &&
    order?.payment?.paymentMethod === 'BANK_TRANSFER_QR' &&
    order?.status !== 'CANCELLED'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết đơn hàng #${orderId}`}
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-gray-400">Đang tải thông tin đơn hàng...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs text-red-400">{error}</p>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      ) : order ? (
        <div className="space-y-5">
          {/* Header tóm tắt trạng thái */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-950 border border-gray-800">
            <div>
              <span className="text-[11px] text-gray-500 block">Ngày tạo đơn</span>
              <span className="text-xs text-gray-300 font-mono">
                {order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
              >
                ● {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Thông tin giao hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-950/60 p-4 rounded-xl border border-gray-800/80">
            <div>
              <span className="text-gray-500 block text-[10px]">Người nhận & SĐT</span>
              <span className="font-semibold text-gray-200">
                {order.recipientName || 'Khách hàng'} • {order.recipientPhone || '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">Hình thức nhận món</span>
              <span className="font-semibold text-gray-200">
                {FULFILLMENT_CONFIG[order.fulfillmentType]?.label || order.fulfillmentType}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-500 block text-[10px]">Địa chỉ giao</span>
              <span className="text-gray-300 leading-relaxed">
                {order.shippingAddress || '—'}
              </span>
            </div>
            {order.orderNote && (
              <div className="sm:col-span-2">
                <span className="text-gray-500 block text-[10px]">Ghi chú đơn hàng</span>
                <span className="text-amber-400/90 italic">{order.orderNote}</span>
              </div>
            )}
          </div>

          {/* Danh sách món ăn */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Món ăn đã đặt ({order.items?.length || 0})
            </h4>
            <div className="divide-y divide-gray-800/60 border border-gray-800 rounded-xl overflow-hidden bg-gray-950/50">
              {order.items?.map((it, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={it.imageUrl || FALLBACK_DISH_IMAGE}
                      alt={it.dishName}
                      onError={(e) => {
                        e.target.src = FALLBACK_DISH_IMAGE
                      }}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-900 shrink-0 border border-gray-800"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-gray-100 truncate">{it.dishName}</p>
                      <p className="text-gray-500 font-mono">
                        {Number(it.unitPrice || 0).toLocaleString('vi-VN')} đ × {it.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-gray-200 shrink-0">
                    {Number(it.subTotal || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tổng tiền & Phương thức thanh toán */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Phương thức thanh toán:</span>
              <span className="text-gray-200 font-medium">
                {PAYMENT_METHOD_CONFIG[order.payment?.paymentMethod]?.label ||
                  order.payment?.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Trạng thái thanh toán:</span>
              <span
                className={`font-semibold ${
                  PAYMENT_STATUS_CONFIG[order.payment?.status]?.color || 'text-gray-300'
                }`}
              >
                {PAYMENT_STATUS_CONFIG[order.payment?.status]?.label || order.payment?.status}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-800">
              <span className="font-bold text-sm text-white">Tổng cộng:</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800">
            <div>
              {isPending && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={XCircle}
                  className="text-red-400 hover:text-red-300"
                  onClick={() => {
                    onClose()
                    onOpenCancel?.(order.orderId)
                  }}
                >
                  Hủy đơn này
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Đóng
              </Button>
              {isUnpaid && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={QrCode}
                  onClick={() => {
                    onClose()
                    onOpenQr?.(order.orderId)
                  }}
                >
                  Thanh toán VietQR
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

export default OrderDetailModal
