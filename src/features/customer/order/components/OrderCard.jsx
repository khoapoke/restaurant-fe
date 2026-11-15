import { Eye, QrCode, XCircle, Clock } from 'lucide-react'
import {
  ORDER_STATUS_CONFIG,
  FULFILLMENT_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from '../constants'
import Button from '../../../../components/ui/Button'

/**
 * Thẻ Đơn Hàng (OrderCard)
 * - Tinh tế Fine-Dining & Centralized Design Tokens
 * - Hiển thị mã đơn, thời gian, trạng thái, món tóm tắt, tổng tiền & hành động
 * - Độ dài < 125 dòng
 */
export default function OrderCard({
  order,
  onViewDetail,
  onOpenQr,
  onOpenCancel,
}) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    color: 'text-text-muted',
    bg: 'bg-surface-bg',
    border: 'border-border-subtle',
  }

  const paymentStatusConfig = PAYMENT_STATUS_CONFIG[order.payment?.status] || {
    label: order.payment?.status || 'Chưa thanh toán',
    color: 'text-text-muted',
  }

  const isPending = order.status === 'PENDING_CONFIRMATION'
  const isUnpaid =
    order.payment?.status === 'UNPAID' &&
    order.payment?.paymentMethod === 'BANK_TRANSFER_QR' &&
    order.status !== 'CANCELLED'

  return (
    <div className="bg-surface-card border border-border-subtle hover:border-border-strong rounded-2xl p-5 space-y-4 transition-all duration-150 shadow-sm">
      {/* Hàng 1: Mã đơn, Thời gian & Trạng thái */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-bold text-sm sm:text-base text-text-main">
            #{order.orderId}
          </span>
          <span className="text-border-strong">•</span>
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
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
        <div className="space-y-1.5">
          <p className="text-text-main font-medium line-clamp-1">
            {order.items?.map((i) => `${i.dishName} (x${i.quantity})`).join(', ') ||
              'Chi tiết món ăn'}
          </p>
          <div className="flex items-center gap-2 text-text-muted">
            <span className="px-2 py-0.5 rounded bg-surface-bg border border-border-subtle text-[11px] font-medium text-text-main">
              {FULFILLMENT_CONFIG[order.fulfillmentType]?.label || order.fulfillmentType}
            </span>
            <span>•</span>
            <span className={`font-medium ${paymentStatusConfig.color}`}>
              {paymentStatusConfig.label}
            </span>
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="text-left sm:text-right shrink-0">
          <span className="text-[10px] text-text-muted block">Tổng thanh toán</span>
          <span className="text-base sm:text-lg font-bold text-brand-primary font-mono">
            {Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Hàng 3: Các nút hành động */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-border-subtle">
        <div>
          {isPending && (
            <button
              type="button"
              onClick={() => onOpenCancel(order.orderId)}
              className="text-xs text-status-error hover:underline flex items-center gap-1 cursor-pointer font-medium"
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
