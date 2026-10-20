import {
  ORDER_STATUS_CONFIG,
  FULFILLMENT_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from '../constants'
import Button from '../../../../components/ui/Button'
import { Eye, QrCode, XCircle, Clock } from 'lucide-react'

export const OrderCard = ({
  order,
  onViewDetail,
  onOpenQr,
  onOpenCancel,
}) => {
  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    color: 'text-gray-300',
    bg: 'bg-gray-800',
    border: 'border-gray-700',
  }

  const paymentStatusConfig = PAYMENT_STATUS_CONFIG[order.payment?.status] || {
    label: order.payment?.status || 'Chưa thanh toán',
    color: 'text-gray-400',
  }

  const isPending = order.status === 'PENDING_CONFIRMATION'
  const isUnpaid =
    order.payment?.status === 'UNPAID' &&
    order.payment?.paymentMethod === 'BANK_TRANSFER_QR' &&
    order.status !== 'CANCELLED'

  return (
    <div className="bg-gray-900/60 border border-gray-800/80 hover:border-gray-700 rounded-2xl p-5 space-y-4 transition-all duration-150">
      {/* Hàng 1: Mã đơn, Thời gian & Trạng thái */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-800/60">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-bold text-sm sm:text-base text-white">
            #{order.orderId}
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-500" />
            {order.orderDate
              ? new Date(order.orderDate).toLocaleString('vi-VN')
              : '—'}
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

      {/* Hàng 2: Tóm tắt món ăn & Hình thức */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <p className="text-gray-300 font-medium line-clamp-1">
            {order.items?.map((i) => `${i.dishName} (x${i.quantity})`).join(', ') ||
              'Chi tiết món ăn'}
          </p>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="px-2 py-0.5 rounded bg-gray-950 border border-gray-800 text-[11px]">
              {FULFILLMENT_CONFIG[order.fulfillmentType]?.label || order.fulfillmentType}
            </span>
            <span>•</span>
            <span className={paymentStatusConfig.color}>
              {paymentStatusConfig.label}
            </span>
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="text-left sm:text-right shrink-0">
          <span className="text-[10px] text-gray-500 block">Tổng thanh toán</span>
          <span className="text-base sm:text-lg font-bold text-amber-400 font-mono">
            {Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Hàng 3: Các nút hành động */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-gray-800/60">
        <div>
          {isPending && (
            <button
              type="button"
              onClick={() => onOpenCancel(order.orderId)}
              className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Hủy đơn</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isUnpaid && (
            <Button
              variant="outline"
              size="sm"
              icon={QrCode}
              onClick={() => onOpenQr(order.orderId)}
            >
              Mã QR
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={Eye}
            onClick={() => onViewDetail(order.orderId)}
          >
            Chi tiết
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OrderCard
