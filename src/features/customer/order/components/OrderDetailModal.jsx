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
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'
import { Loader2, AlertTriangle, QrCode, XCircle } from 'lucide-react'

export default function OrderDetailModal({ orderId, isOpen, onClose, onOpenQr, onOpenCancel }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId || !isOpen) {
      setOrder(null); setError(null); return
    }
    const loadDetail = async () => {
      setLoading(true); setError(null)
      try {
        const response = await getOrderDetailApi(orderId)
        setOrder(response.data?.data || response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng.')
      } finally { setLoading(false) }
    }
    loadDetail()
  }, [orderId, isOpen])

  const status = order?.status || order?.trang_thai
  const statusCfg = ORDER_STATUS_CONFIG[status] || {
    label: status, color: 'text-text-muted', bg: 'bg-surface-bg', border: 'border-border-subtle',
  }
  const isPending = status === 'PENDING_CONFIRMATION'

  const payStatus = order?.payment?.status || order?.payment?.trang_thai || 'UNPAID'
  const payMethod = order?.payment?.paymentMethod || order?.payment?.method || order?.paymentMethod
  const isUnpaid =
    (payStatus === 'UNPAID' || payStatus === 'CHUA_THANH_TOAN') &&
    (payMethod === 'BANK_TRANSFER_QR' || payMethod === 'Chuyển khoản') &&
    status !== 'CANCELLED'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chi tiết đơn hàng #${orderId}`} maxWidth="max-w-2xl">
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-xs text-text-muted">Đang tải thông tin đơn hàng...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-status-error mx-auto" />
          <p className="text-xs text-status-error">{error}</p>
          <Button variant="secondary" size="sm" onClick={onClose}>Đóng</Button>
        </div>
      ) : order ? (
        <div className="space-y-4 font-sans">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-bg border border-border-subtle">
            <div>
              <span className="text-[10px] text-text-muted block">Ngày tạo đơn</span>
              <span className="text-xs text-text-main font-mono">
                {order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : '—'}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
              ● {statusCfg.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-surface-bg/70 p-3.5 rounded-xl border border-border-subtle">
            <div>
              <span className="text-text-muted block text-[10px]">Người nhận & SĐT</span>
              <span className="font-semibold text-text-main">{order.recipientName || 'Khách hàng'} • {order.recipientPhone || '—'}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px]">Hình thức nhận món</span>
              <span className="font-semibold text-text-main">{FULFILLMENT_CONFIG[order.fulfillmentType]?.label || order.fulfillmentType}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-text-muted block text-[10px]">Địa chỉ giao</span>
              <span className="text-text-main leading-relaxed">{order.shippingAddress || '—'}</span>
            </div>
            {order.orderNote && (
              <div className="sm:col-span-2">
                <span className="text-text-muted block text-[10px]">Ghi chú đơn hàng</span>
                <span className="text-brand-primary italic">{order.orderNote}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-serif font-bold text-text-main uppercase tracking-wider">Món ăn đã đặt ({order.items?.length || 0})</h4>
            <div className="divide-y divide-border-subtle border border-border-subtle rounded-xl overflow-hidden bg-surface-bg/50 max-h-48 overflow-y-auto">
              {order.items?.map((it, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={resolveDishImage(it.imageUrl, it)}
                      alt={it.dishName}
                      onError={(e) => handleImageError(e, resolveDishImage(null, it))}
                      className="w-9 h-9 rounded-lg object-cover bg-surface-card shrink-0 border border-border-subtle"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-text-main truncate">{it.dishName}</p>
                      <p className="text-text-muted font-mono text-[11px]">{Number(it.unitPrice || 0).toLocaleString('vi-VN')} đ × {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-text-main shrink-0">
                    {Number(it.subTotal || (it.unitPrice * it.quantity) || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-bg border border-border-subtle space-y-1.5 text-xs">
            <div className="flex justify-between text-text-muted">
              <span>Phương thức thanh toán:</span>
              <span className="text-text-main font-medium">{PAYMENT_METHOD_CONFIG[payMethod]?.label || payMethod}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Trạng thái thanh toán:</span>
              <span className={`font-semibold ${PAYMENT_STATUS_CONFIG[payStatus]?.color || 'text-text-muted'}`}>
                {PAYMENT_STATUS_CONFIG[payStatus]?.label || payStatus}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
              <span className="font-bold text-sm text-text-main">Tổng cộng:</span>
              <span className="text-lg font-bold text-brand-primary font-mono">{Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border-subtle">
            <div>
              {isPending && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={XCircle}
                  className="text-status-error hover:bg-status-error/10"
                  onClick={() => { onClose(); onOpenCancel?.(order.orderId || order.id) }}
                >
                  Hủy đơn này
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>Đóng</Button>
              {isUnpaid && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={QrCode}
                  onClick={() => { onClose(); onOpenQr?.(order.orderId || order.id) }}
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
