import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, RotateCcw } from 'lucide-react'
import Button from '../../../components/ui/Button'
import AdminDataState from '../components/AdminDataState'
import { formatCurrency, formatDateTime, PAYMENT_STATUS_LABEL } from '../constants'
import { getAdminPaymentsApi, reconcilePaymentsApi, refundPaymentApi } from '../services/adminService'

export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [pendingId, setPendingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setPayments((await getAdminPaymentsApi({ status: status || undefined, perPage: 50 })).data.items || []) }
    catch (err) { setError(err.response?.data?.message || 'Không thể tải giao dịch.') }
    finally { setLoading(false) }
  }, [status])
  useEffect(() => {
    let active = true
    getAdminPaymentsApi({ status: status || undefined, perPage: 50 })
      .then((response) => { if (active) setPayments(response.data.items || []) })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Không thể tải giao dịch.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [status])

  const reconcile = async () => {
    setPendingId('reconcile')
    try { const result = (await reconcilePaymentsApi()).data; setNotice(`Đối soát ${result.checkedCount} giao dịch: ${result.matchedCount} khớp, ${result.mismatchCount} lệch.`) }
    catch (err) { setNotice(err.response?.data?.message || 'Không thể đối soát.') }
    finally { setPendingId(null) }
  }
  const refund = async (payment) => {
    const reason = window.prompt('Nhập lý do hoàn tiền (tối thiểu 5 ký tự):')
    if (!reason) return
    setPendingId(payment.paymentId)
    try { const response = await refundPaymentApi(payment.paymentId, reason); setNotice(response.message); await load() }
    catch (err) { setNotice(err.response?.data?.message || 'Không thể ghi nhận hoàn tiền.') }
    finally { setPendingId(null) }
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5"><div><span className="moc-eyebrow">DÒNG TIỀN</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Thanh toán</h1><p className="mt-3 text-sm text-[#625a55]">Theo dõi giao dịch, kiểm tra chênh lệch và lưu vết hoàn tiền.</p></div><Button variant="outline" icon={RefreshCw} isLoading={pendingId === 'reconcile'} onClick={reconcile}>Đối soát</Button></header>
      <div className="mt-8 flex justify-end"><select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm"><option value="">Mọi trạng thái</option>{Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      {notice && <p className="mt-4 border border-[#6f1d32]/20 bg-[#fffdf8] px-4 py-3 text-sm text-[#6f1d32]">{notice}</p>}
      <div className="mt-5"><AdminDataState loading={loading} error={error} onRetry={load} empty={!payments.length}>
        <div className="moc-panel overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#eee6dc]"><tr>{['Giao dịch', 'Đơn hàng', 'Phương thức', 'Số tiền', 'Trạng thái', 'Thao tác'].map((label) => <th key={label} className="px-5 py-4 text-xs tracking-[0.08em] uppercase text-[#625a55]">{label}</th>)}</tr></thead><tbody className="divide-y divide-[var(--moc-line)]">{payments.map((payment) => <tr key={payment.paymentId} className="bg-[#fffdf8]"><td className="px-5 py-4"><strong>#{payment.paymentId}</strong><p className="mt-1 text-xs text-[#625a55]">{payment.transactionCode || 'Chưa có mã'}</p></td><td className="px-5 py-4">#{payment.orderId}<p className="mt-1 text-xs text-[#625a55]">{formatDateTime(payment.orderDate)}</p></td><td className="px-5 py-4">{payment.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản QR'}</td><td className="px-5 py-4 font-semibold text-[#6f1d32]">{formatCurrency(payment.amount)}</td><td className="px-5 py-4"><span className="bg-[#eee6dc] px-2.5 py-1 text-xs font-bold">{PAYMENT_STATUS_LABEL[payment.status] || payment.status}</span>{payment.refundReason && <p className="mt-2 max-w-56 text-xs text-[#625a55]">{payment.refundReason}</p>}</td><td className="px-5 py-4">{payment.status === 'PAID' ? <Button size="sm" variant="outline" icon={RotateCcw} isLoading={pendingId === payment.paymentId} onClick={() => refund(payment)}>Hoàn tiền</Button> : '—'}</td></tr>)}</tbody></table></div>
      </AdminDataState></div>
    </div>
  )
}

export default AdminPaymentsPage
