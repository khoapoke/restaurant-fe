import { Eye, XCircle, ArrowRight, Banknote } from 'lucide-react'
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  NEXT_STATUS_MAP,
} from '../constants'
import Button from '../../../../components/ui/Button'

export const AdminOrderTable = ({
  orders = [],
  onViewDetail,
  onNextStatus,
  onCancel,
  onConfirmPayment,
  actionLoadingId = null,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface-card shadow-sm font-sans">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase tracking-wider bg-surface-bg/50">
            <th className="py-3 px-4 font-semibold w-16 text-center">Đơn</th>
            <th className="py-3 px-4 font-semibold">Khách hàng</th>
            <th className="py-3 px-4 font-semibold">Thời gian</th>
            <th className="py-3 px-4 font-semibold text-right w-28">Tổng tiền</th>
            <th className="py-3 px-4 font-semibold text-center w-28">Thanh toán</th>
            <th className="py-3 px-4 font-semibold text-center w-32">Tiến độ đơn</th>
            <th className="py-3 px-4 font-semibold text-right w-48">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/60">
          {orders.map((order) => {
            const id = order.orderId || order.ma_don_hang || order.id
            const status = order.status || order.trang_thai
            const statusCfg = ORDER_STATUS_CONFIG[status] || {
              label: status,
              color: 'text-text-muted bg-surface-elevated border-border-strong',
            }

            const paymentStatus = order.payment?.status || order.payment?.trang_thai || 'UNPAID'
            const payMethod = order.payment?.paymentMethod || order.payment?.method || order.paymentMethod
            const payCfg = PAYMENT_STATUS_CONFIG[paymentStatus] || PAYMENT_STATUS_CONFIG.UNPAID
            const nextStep = NEXT_STATUS_MAP[status]
            const isActionLoading = actionLoadingId === id
            const canCancel = status !== 'COMPLETED' && status !== 'CANCELLED'
            const canConfirmPay =
              (paymentStatus === 'UNPAID' || paymentStatus === 'CHUA_THANH_TOAN') &&
              (payMethod === 'BANK_TRANSFER_QR' || payMethod === 'Chuyển khoản') &&
              status !== 'CANCELLED'

            return (
              <tr key={id} className="hover:bg-surface-card-hover/40 transition-colors">
                <td className="py-3.5 px-4 text-center font-mono font-bold text-text-dim">
                  #{id}
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-bold text-text-main truncate max-w-[140px]">
                    {order.recipientName || order.account?.username || 'Khách vãng lai'}
                  </p>
                  <p className="text-[10px] text-text-muted font-mono">
                    {order.recipientPhone || '—'}
                  </p>
                </td>

                <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      })
                    : '—'}
                </td>

                <td className="py-3.5 px-4 text-right font-mono font-bold text-brand-primary">
                  {Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${payCfg.color}`}>
                    {payCfg.label}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {canConfirmPay && (
                      <button
                        type="button"
                        onClick={() => onConfirmPayment?.(order)}
                        disabled={isActionLoading}
                        className="p-1.5 rounded-lg text-status-success hover:bg-status-success/10 border border-status-success/30 transition-colors cursor-pointer"
                        title="Xác nhận đã nhận chuyển khoản"
                      >
                        <Banknote className="w-4 h-4" />
                      </button>
                    )}

                    {nextStep && (
                      <Button
                        variant={nextStep.btnVariant || 'primary'}
                        size="sm"
                        isLoading={isActionLoading}
                        onClick={() => onNextStatus(id, nextStep.target, order)}
                        className="text-[11px] py-1 px-2.5"
                        icon={ArrowRight}
                      >
                        {nextStep.actionLabel}
                      </Button>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => onCancel(order)}
                        disabled={isActionLoading}
                        className="p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-surface-card-hover transition-colors cursor-pointer"
                        title="Hủy đơn hàng"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onViewDetail(id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface-card-hover transition-colors cursor-pointer"
                      title="Xem chi tiết đơn"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AdminOrderTable
