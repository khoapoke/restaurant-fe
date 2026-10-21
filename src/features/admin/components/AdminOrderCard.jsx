import { Link } from 'react-router-dom'
import { ArrowRight, Ban, CircleAlert, MapPin, PackageCheck, Phone, RotateCcw, Store, Truck, UtensilsCrossed } from 'lucide-react'
import Button from '../../../components/ui/Button'
import {
  FULFILLMENT_STATUS_LABEL,
  FULFILLMENT_TYPE_LABEL,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  formatCurrency,
  formatDateTime,
} from '../constants'

const STATUS_ACTION_LABEL = {
  CONFIRMED: 'Xác nhận đơn',
  PREPARING: 'Chuyển bếp chế biến',
  READY: 'Bếp đã xong món',
}

const FULFILLMENT_ACTION = {
  OUT_FOR_DELIVERY: { label: 'Giao cho tài xế', icon: Truck },
  DELIVERED: { label: 'Xác nhận đã giao', icon: PackageCheck },
  COLLECTED: { label: 'Khách đã nhận món', icon: PackageCheck },
}

const TYPE_ICON = { DELIVERY: Truck, PICKUP: Store, DINE_IN: UtensilsCrossed }

export const AdminOrderCard = ({ order, busy, onAdvanceStatus, onAdvanceFulfillment, onCancel }) => {
  const actions = order.availableActions || {}
  const TypeIcon = TYPE_ICON[order.fulfillmentType] || Truck
  const fulfillmentAction = FULFILLMENT_ACTION[actions.nextFulfillmentStatus]
  const handoffBlockedByQr = actions.awaitingQrPayment && ['OUT_FOR_DELIVERY', 'COLLECTED', 'DELIVERED'].includes(actions.nextFulfillmentStatus)
  const payment = order.payment

  return (
    <article className="moc-panel p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="moc-serif text-2xl mr-1">Đơn #{order.orderId}</h2>
            <span className={`px-2.5 py-1 text-xs font-bold ${ORDER_STATUS_TONE[order.status] || 'bg-[#eee6dc]'}`}>{ORDER_STATUS_LABEL[order.status] || order.status}</span>
            <span className="inline-flex items-center gap-1.5 bg-[#eee6dc] px-2.5 py-1 text-xs font-semibold text-[#211b18]"><TypeIcon className="h-3.5 w-3.5" />{FULFILLMENT_TYPE_LABEL[order.fulfillmentType] || order.fulfillmentType}</span>
            {order.status !== 'CANCELLED' && <span className="border border-[#6f1d32]/25 px-2.5 py-1 text-xs font-semibold text-[#6f1d32]">{FULFILLMENT_STATUS_LABEL[order.fulfillmentStatus] || order.fulfillmentStatus}</span>}
          </div>
          <p className="mt-2 text-sm text-[#625a55]">{formatDateTime(order.orderDate)} · {order.fulfillmentType === 'DINE_IN' ? `Phục vụ bởi ${order.customer?.fullName || order.customer?.username || 'nhân viên'}` : (order.customer?.fullName || order.customer?.username || 'Khách hàng')}</p>

          {order.fulfillmentType !== 'DINE_IN' ? (
            <div className="mt-3 grid gap-1.5 text-sm text-[#211b18]">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#6f1d32]" />{order.recipientName || 'Khách hàng'} · {order.recipientPhone || 'Chưa có SĐT'}</p>
              {order.fulfillmentType === 'DELIVERY'
                ? <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6f1d32]" />{order.shippingAddress || 'Chưa có địa chỉ'}</p>
                : <p className="flex items-center gap-2"><Store className="h-4 w-4 text-[#6f1d32]" />{order.scheduledAt ? `Hẹn lấy lúc ${formatDateTime(order.scheduledAt)}` : 'Lấy sớm nhất có thể'}</p>}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#625a55]">Đơn tại bàn — gọi món, bếp và thanh toán được xử lý trong POS.</p>
          )}
          {order.note && <p className="mt-2 whitespace-pre-line text-sm italic text-[#625a55]">Ghi chú: {order.note}</p>}
        </div>

        <div className="lg:text-right shrink-0">
          <p className="moc-serif text-2xl text-[#6f1d32]">{formatCurrency(order.totalAmount)}</p>
          {payment ? (
            <div className="mt-2 flex flex-wrap lg:justify-end items-center gap-2 text-xs">
              <span className="text-[#625a55]">{PAYMENT_METHOD_LABEL[payment.paymentMethod] || payment.paymentMethod}</span>
              <span className={`px-2 py-0.5 font-bold ${PAYMENT_STATUS_TONE[payment.status] || 'bg-[#eee6dc]'}`}>{PAYMENT_STATUS_LABEL[payment.status] || payment.status}</span>
            </div>
          ) : <p className="mt-2 text-xs text-[#625a55]">Chưa có thanh toán</p>}
        </div>
      </div>

      <ul className="mt-5 grid sm:grid-cols-2 xl:grid-cols-4 gap-2">
        {(order.items || []).map((item, index) => (
          <li key={item.itemId || `${index}-${item.dishId}`} className="border border-[var(--moc-line)] bg-white px-3 py-2 text-sm">
            <strong>{item.quantity}×</strong> {item.dishName}
          </li>
        ))}
      </ul>

      {handoffBlockedByQr && (
        <p className="mt-4 flex items-start gap-2 border border-[#6f1d32]/25 bg-[#6f1d32]/5 px-3 py-2.5 text-sm text-[#6f1d32]">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          Đơn chuyển khoản QR chưa thanh toán. Xác nhận giao dịch trong mục Thanh toán trước khi bàn giao.
          <Link to={`/admin/payments?keyword=${order.orderId}`} className="ml-auto shrink-0 font-semibold underline underline-offset-4">Mở thanh toán</Link>
        </p>
      )}
      {actions.requiresRefund && (
        <p className="mt-4 flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" />
          Đơn đã hủy nhưng khách đã thanh toán. Cần ghi nhận hoàn tiền.
          <Link to={`/admin/payments?keyword=${order.orderId}`} className="ml-auto shrink-0 font-semibold underline underline-offset-4">Hoàn tiền</Link>
        </p>
      )}

      {(actions.nextStatus || fulfillmentAction || actions.canCancel) && (
        <div className="mt-5 flex flex-wrap gap-3">
          {actions.nextStatus && (
            <Button size="sm" icon={ArrowRight} isLoading={busy} onClick={() => onAdvanceStatus(order, actions.nextStatus)}>
              {STATUS_ACTION_LABEL[actions.nextStatus] || ORDER_STATUS_LABEL[actions.nextStatus]}
            </Button>
          )}
          {fulfillmentAction && (
            <Button size="sm" icon={fulfillmentAction.icon} isLoading={busy} disabled={handoffBlockedByQr} onClick={() => onAdvanceFulfillment(order, actions.nextFulfillmentStatus)}>
              {fulfillmentAction.label}
            </Button>
          )}
          {actions.canCancel && (
            <Button size="sm" variant="outline" icon={Ban} disabled={busy} onClick={() => onCancel(order)} className="ml-auto">Hủy đơn</Button>
          )}
        </div>
      )}
    </article>
  )
}

export default AdminOrderCard
