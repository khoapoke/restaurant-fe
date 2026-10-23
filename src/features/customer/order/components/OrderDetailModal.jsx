import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { getOrderDetailApi, updateOrderRecipientApi } from '../services/orderService'
import { apiErrorMessage } from '../../../../lib/apiError'
import {
  ORDER_STATUS_CONFIG,
  FULFILLMENT_CONFIG,
  FULFILLMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from '../constants'
import { FALLBACK_DISH_IMAGE } from '../../menu/constants'
import { Loader2, AlertTriangle, KeyRound, PackageX, Pencil, QrCode, RotateCcw, XCircle } from 'lucide-react'
import OrderProgress from './OrderProgress'

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
  const [editing, setEditing] = useState(null)
  const [editError, setEditError] = useState(null)
  const [saving, setSaving] = useState(false)

  const saveRecipient = async () => {
    setSaving(true)
    setEditError(null)
    try {
      const payload = {}
      if (editing.recipientName.trim() && editing.recipientName.trim() !== order.recipientName) payload.recipientName = editing.recipientName.trim()
      if (editing.recipientPhone.trim() && editing.recipientPhone.trim() !== order.recipientPhone) payload.recipientPhone = editing.recipientPhone.trim()
      if (order.fulfillmentType === 'DELIVERY' && editing.shippingAddress.trim() && editing.shippingAddress.trim() !== order.shippingAddress) payload.shippingAddress = editing.shippingAddress.trim()
      const response = await updateOrderRecipientApi(order.orderId, payload)
      setOrder(response.data)
      setEditing(null)
    } catch (err) {
      setEditError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect -- Modal state follows the selected order lifecycle. */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  const statusConfig = ORDER_STATUS_CONFIG[order?.status] || {
    label: order?.status,
    color: 'text-gray-300',
    bg: 'bg-gray-800',
    border: 'border-gray-700',
  }
  const fulfillmentStatusConfig = FULFILLMENT_STATUS_CONFIG[order?.fulfillmentStatus] || {
    label: order?.fulfillmentStatus,
    color: 'text-gray-400',
  }

  const isPending = order?.status === 'PENDING_CONFIRMATION'
  const isUnpaid =
    ['UNPAID', 'PARTIALLY_PAID'].includes(order?.payment?.status) &&
    order?.payment?.paymentMethod === 'BANK_TRANSFER_QR' &&
    order?.status !== 'CANCELLED'
  const money = order?.money || {}

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

          <OrderProgress order={order} />

          {order.pickupCode && !['CANCELLED', 'COMPLETED'].includes(order.status) && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <KeyRound className="h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <p className="text-xs text-gray-400">Mã nhận hàng — đọc cho nhân viên khi đến lấy (người lấy hộ cũng dùng mã này)</p>
                <p className="mt-1 font-mono text-2xl font-bold tracking-[0.4em] text-gray-100">{order.pickupCode}</p>
              </div>
            </div>
          )}

          {order.deliveryFailure && order.status !== 'CANCELLED' && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
              <PackageX className="h-5 w-5 shrink-0" />
              <p>Lần giao gần nhất chưa thành công ({order.deliveryFailure.reasonLabel}). Nhà hàng sẽ liên hệ để giao lại; đơn tiền mặt chưa bị tính là đã thanh toán.</p>
            </div>
          )}

          {order.cancellation && (
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 text-xs">
              <p className="font-semibold text-gray-100">Đơn đã hủy{order.cancellation.at ? ` lúc ${new Date(order.cancellation.at).toLocaleString('vi-VN')}` : ''}</p>
              {order.cancellation.reason && <p className="mt-1 text-gray-300">Lý do: {order.cancellation.reason}</p>}
              {money.amountPaid > 0 && (
                <p className="mt-2 flex items-start gap-2 text-gray-300">
                  <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {money.refundDue > 0
                    ? `Mộc sẽ hoàn ${Number(money.refundDue).toLocaleString('vi-VN')} đ cho bạn. Đã hoàn: ${Number(money.amountRefunded || 0).toLocaleString('vi-VN')} đ.`
                    : order.cancellation.moneyDecision === 'RETAINED'
                      ? 'Theo chính sách, khoản đã thanh toán không được hoàn do đơn không được nhận.'
                      : `Đã hoàn ${Number(money.amountRefunded || 0).toLocaleString('vi-VN')} đ.`}
                </p>
              )}
            </div>
          )}

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
              <span className="block font-semibold text-gray-200">
                {FULFILLMENT_CONFIG[order.fulfillmentType]?.label || order.fulfillmentType}
              </span>
              <span className={`mt-1 block text-[11px] font-semibold ${fulfillmentStatusConfig.color}`}>
                {fulfillmentStatusConfig.label}
              </span>
            </div>
            {order.fulfillmentType === 'DELIVERY' ? (
              <div className="sm:col-span-2">
                <span className="text-gray-500 block text-[10px]">Địa chỉ giao</span>
                <span className="text-gray-300 leading-relaxed">{order.shippingAddress || '—'}</span>
              </div>
            ) : (
              <div className="sm:col-span-2">
                <span className="text-gray-500 block text-[10px]">Nhận tại nhà hàng</span>
                <span className="text-gray-300 leading-relaxed">
                  82 Nguyễn Du, Quận 1, TP.HCM
                  {order.scheduledAt ? ` · Hẹn ${new Date(order.scheduledAt).toLocaleString('vi-VN')}` : ' · Lấy sớm nhất'}
                </span>
              </div>
            )}
            {order.orderNote && (
              <div className="sm:col-span-2">
                <span className="text-gray-500 block text-[10px]">Ghi chú đơn hàng</span>
                <span className="text-amber-400/90 italic">{order.orderNote}</span>
              </div>
            )}
            {order.canEditRecipient && !editing && (
              <div className="sm:col-span-2">
                <Button variant="ghost" size="sm" icon={Pencil} onClick={() => { setEditError(null); setEditing({ recipientName: order.recipientName || '', recipientPhone: order.recipientPhone || '', shippingAddress: order.shippingAddress || '' }) }}>
                  Sửa người nhận{order.fulfillmentType === 'DELIVERY' ? ' / địa chỉ' : ''}
                </Button>
              </div>
            )}
            {editing && (
              <div className="sm:col-span-2 grid gap-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input aria-label="Người nhận" value={editing.recipientName} onChange={(event) => setEditing((value) => ({ ...value, recipientName: event.target.value }))} className="min-h-10 border border-gray-800 bg-gray-950 px-3 text-sm text-gray-100" />
                  <input aria-label="Số điện thoại" value={editing.recipientPhone} onChange={(event) => setEditing((value) => ({ ...value, recipientPhone: event.target.value }))} className="min-h-10 border border-gray-800 bg-gray-950 px-3 text-sm text-gray-100" />
                </div>
                {order.fulfillmentType === 'DELIVERY' && <input aria-label="Địa chỉ giao" value={editing.shippingAddress} onChange={(event) => setEditing((value) => ({ ...value, shippingAddress: event.target.value }))} className="min-h-10 border border-gray-800 bg-gray-950 px-3 text-sm text-gray-100" />}
                {editError && <p className="text-[11px] text-red-400">{editError}</p>}
                <div className="flex gap-2">
                  <Button size="sm" isLoading={saving} onClick={saveRecipient}>Lưu</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)} disabled={saving}>Hủy</Button>
                </div>
                <p className="text-[11px] text-gray-500">Chỉ sửa được trước khi đơn giao cho tài xế hoặc bàn giao.</p>
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
                      <p className={`font-semibold truncate ${it.cancelled ? 'text-gray-500 line-through' : 'text-gray-100'}`}>{it.dishName}</p>
                      <p className="text-gray-500 font-mono">
                        {Number(it.unitPrice || 0).toLocaleString('vi-VN')} đ × {it.quantity}
                      </p>
                      {it.cancelled && <p className="text-[11px] text-red-800">Đã hủy{it.cancelReason ? ` · ${it.cancelReason}` : ''} · không tính tiền</p>}
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
              <span>Tạm tính tiền món:</span>
              <span className="text-gray-200 font-medium">
                {Number(order.itemsSubtotal ?? order.totalAmount ?? 0).toLocaleString('vi-VN')} đ
              </span>
            </div>
            {order.fulfillmentType === 'DELIVERY' && (
              <div className="flex justify-between text-gray-400">
                <span>Phí giao hàng:</span>
                <span className="text-gray-200 font-medium">
                  {Number(order.deliveryFee || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}
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
            {money.amountPaid > 0 && (
              <div className="flex justify-between text-gray-400">
                <span>Đã thanh toán:</span>
                <span className="text-gray-200 font-medium">{Number(money.amountPaid).toLocaleString('vi-VN')} đ</span>
              </div>
            )}
            {money.outstanding > 0 && money.amountPaid > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Còn thiếu:</span>
                <span className="font-medium">{Number(money.outstanding).toLocaleString('vi-VN')} đ</span>
              </div>
            )}
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
