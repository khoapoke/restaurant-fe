import { RotateCcw, CreditCard, Banknote } from 'lucide-react'
import {
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from '../constants'
import Button from '../../../../components/ui/Button'

export const PaymentTable = ({ payments = [], onOpenRefund }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-[10px] uppercase tracking-wider bg-gray-950/40">
            <th className="py-3 px-4 font-semibold w-16 text-center">Mã GD</th>
            <th className="py-3 px-4 font-semibold w-20">Đơn hàng</th>
            <th className="py-3 px-4 font-semibold">Phương thức</th>
            <th className="py-3 px-4 font-semibold text-right w-32">Số tiền</th>
            <th className="py-3 px-4 font-semibold text-center w-32">Trạng thái</th>
            <th className="py-3 px-4 font-semibold w-36">Thời gian</th>
            <th className="py-3 px-4 font-semibold text-right w-28">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {payments.map((p) => {
            const id = p.paymentId || p.ma_thanh_toan
            const orderId = p.orderId || p.ma_don_hang
            const method = p.paymentMethod || p.phuong_thuc
            const status = p.status || p.trang_thai
            const amount = Number(p.amount || p.so_tien || 0)

            const statusCfg = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.UNPAID
            const methodLabel = PAYMENT_METHOD_CONFIG[method]?.label || method || 'Khác'
            const canRefund = status === 'PAID'

            return (
              <tr key={id} className="hover:bg-gray-800/30 transition-colors">
                <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-400">
                  #{id}
                </td>

                <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                  #{orderId}
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-gray-200">
                    {method === 'BANK_TRANSFER_QR' ? (
                      <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    <span>{methodLabel}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                  {amount.toLocaleString('vi-VN')} đ
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color}`}
                  >
                    {statusCfg.label}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                  {p.createdAt || p.created_at
                    ? new Date(p.createdAt || p.created_at).toLocaleString('vi-VN')
                    : '—'}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canRefund}
                    onClick={() => onOpenRefund(p)}
                    className="text-[11px] py-1 px-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
                    icon={RotateCcw}
                    title={canRefund ? 'Ghi nhận hoàn tiền' : 'Chỉ hoàn tiền được khi đơn đã PAID'}
                  >
                    Hoàn tiền
                  </Button>
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

