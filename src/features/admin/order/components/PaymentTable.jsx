import { RotateCcw, CreditCard, Banknote, CheckCircle2 } from 'lucide-react'
import {
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from '../constants'
import Button from '../../../../components/ui/Button'

export const PaymentTable = ({ payments = [], onOpenRefund, onOpenConfirmPayment }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface-card shadow-sm font-sans">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase tracking-wider bg-surface-bg/50">
            <th className="py-3 px-4 font-semibold w-16 text-center">Mã GD</th>
            <th className="py-3 px-4 font-semibold w-20">Đơn hàng</th>
            <th className="py-3 px-4 font-semibold">Phương thức</th>
            <th className="py-3 px-4 font-semibold text-right w-32">Số tiền</th>
            <th className="py-3 px-4 font-semibold text-center w-32">Trạng thái</th>
            <th className="py-3 px-4 font-semibold w-36">Thời gian</th>
            <th className="py-3 px-4 font-semibold text-right w-36">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/60">
          {payments.map((p) => {
            const id = p.paymentId || p.ma_thanh_toan
            const orderId = p.orderId || p.ma_don_hang
            const method = p.paymentMethod || p.phuong_thuc
            const status = p.status || p.trang_thai
            const amount = Number(p.amount || p.so_tien || 0)

            const statusCfg = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.UNPAID
            const methodLabel = PAYMENT_METHOD_CONFIG[method]?.label || method || 'Khác'
            const canRefund = status === 'PAID'
            const canConfirm = status === 'UNPAID' || status === 'CHUA_THANH_TOAN'
            const rawReason = String(p.refundReason || p.ly_do_hoan_tien || '')
            const refundMatch = rawReason.match(/^\[Hoàn\s+(\d+)%\s*-\s*([^/\]]+)(?:\/[^\]]+)?\]\s*(.*)$/i)
            const refundBadgeText = refundMatch ? `Hoàn ${refundMatch[1]}% (${refundMatch[2]})` : null
            const cleanRefundNote = refundMatch ? refundMatch[3] : rawReason
            const timeValue = p.orderDate || p.createdAt || p.created_at

            return (
              <tr key={id} className="hover:bg-surface-card-hover/40 transition-colors">
                <td className="py-3.5 px-4 text-center font-mono font-bold text-text-dim">
                  #{id}
                </td>

                <td className="py-3.5 px-4 font-mono font-bold text-brand-primary">
                  #{orderId}
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-text-main">
                    {method === 'BANK_TRANSFER_QR' ? (
                      <CreditCard className="w-3.5 h-3.5 text-brand-primary" />
                    ) : (
                      <Banknote className="w-3.5 h-3.5 text-status-success" />
                    )}
                    <span>{methodLabel}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-right font-mono">
                  <span className="font-bold text-text-main block">
                    {amount.toLocaleString('vi-VN')} đ
                  </span>
                  {status === 'REFUNDED' && refundBadgeText && (
                    <span className="text-[10px] font-semibold text-brand-primary block mt-0.5">
                      ↺ {refundBadgeText}
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color}`}
                  >
                    {statusCfg.label}
                  </span>
                  {status === 'REFUNDED' && cleanRefundNote && (
                    <p
                      className="text-[10px] text-text-muted truncate max-w-[140px] mx-auto mt-0.5"
                      title={cleanRefundNote}
                    >
                      {cleanRefundNote}
                    </p>
                  )}
                </td>

                <td className="py-3.5 px-4 text-text-muted text-[11px] whitespace-nowrap">
                  {timeValue
                    ? new Date(timeValue).toLocaleString('vi-VN')
                    : '—'}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {canConfirm && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onOpenConfirmPayment?.(p)}
                        className="text-[10px] py-1 px-2.5"
                        icon={CheckCircle2}
                        title="Xác nhận tiền đã vào tài khoản"
                      >
                        Xác nhận
                      </Button>
                    )}

                    {canRefund && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenRefund(p)}
                        className="text-[11px] py-1 px-2.5"
                        icon={RotateCcw}
                        title="Ghi nhận hoàn tiền cho đơn đã thanh toán"
                      >
                        Hoàn tiền
                      </Button>
                    )}
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

export default PaymentTable
