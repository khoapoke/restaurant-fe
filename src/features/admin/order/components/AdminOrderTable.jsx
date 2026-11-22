import { Eye, XCircle, ArrowRight, Banknote } from 'lucide-react'
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  getNextOrderAction,
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
            const addr = String(order.shippingAddress || order.dia_chi_giao_hang || '')
            const fulfillmentType =
              order.fulfillmentType ||
              (order.tableId || order.ma_ban || addr.startsWith('Tại bàn')
                ? 'DINE_IN'
                : addr.startsWith('[PICKUP]')
                ? 'PICKUP'
                : 'DELIVERY')

            const statusCfg = ORDER_STATUS_CONFIG[status] || {
              label: status,
              color: 'text-text-muted bg-surface-elevated border-border-strong',
            }
            const statusLabel =
              fulfillmentType === 'DINE_IN' && status === 'DELIVERING'
                ? 'Đang dùng bữa'
                : statusCfg.label

            const paymentStatus = order.payment?.status || order.payment?.trang_thai || 'UNPAID'
            const payMethod = order.payment?.paymentMethod || order.payment?.method || order.paymentMethod
            const payCfg = PAYMENT_STATUS_CONFIG[paymentStatus] || PAYMENT_STATUS_CONFIG.UNPAID
            const nextStep = getNextOrderAction(status, fulfillmentType)
            const isActionLoading = actionLoadingId === id
            const canCancel = status !== 'COMPLETED' && status !== 'CANCELLED'
            const totalAmount = Number(order.totalAmount || order.tong_tien || 0)
            const isPaid = paymentStatus === 'PAID' || paymentStatus === 'Đã thanh toán'
            const canConfirmPay = !isPaid && totalAmount > 0 && status !== 'CANCELLED'

            const customerDisplay =
              fulfillmentType === 'DINE_IN'
                ? order.tableName || (order.tableId ? `Bàn #${order.tableId}` : addr.replace('Tại bàn: ', '') || 'Khách tại bàn')
                : order.customerName || order.recipientName || order.account?.username || 'Khách vãng lai'

            const subDisplay =
              fulfillmentType === 'DINE_IN'
                ? `Phục vụ: ${order.customerName || 'Tại bàn'}`
                : order.customerPhone || order.recipientPhone || (fulfillmentType === 'PICKUP' ? 'Tự đến lấy' : 'Giao tận nơi')

            return (
              <tr key={id} className="hover:bg-surface-card-hover/40 transition-colors">
                <td className="py-3.5 px-4 text-center font-mono font-bold text-text-dim">
                  #{id}
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-text-main truncate max-w-[140px]">
                      {customerDisplay}
                    </p>
                    {fulfillmentType === 'DINE_IN' && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-status-success/15 text-status-success border border-status-success/30 whitespace-nowrap">
                        Tại bàn
                      </span>
                    )}
                    {fulfillmentType === 'PICKUP' && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-status-info/15 text-status-info border border-status-info/30 whitespace-nowrap">
                        Mang về
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted font-mono truncate max-w-[170px]">
                    {subDisplay}
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
                  {totalAmount.toLocaleString('vi-VN')} đ
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${payCfg.color}`}>
                    {payCfg.label}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color}`}>
                    {statusLabel}
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
                        title="Xác nhận đã thu tiền đơn hàng"
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
