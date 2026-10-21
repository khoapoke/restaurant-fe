import { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, RefreshCw, RotateCcw, Scale, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import FeedbackBanner from '../../../components/ui/FeedbackBanner'
import Input from '../../../components/ui/Input'
import Pagination from '../../../components/ui/Pagination'
import { apiErrorMessage } from '../../../lib/apiError'
import { useApiResource } from '../../../lib/useApiResource'
import AdminDataState from '../components/AdminDataState'
import { FULFILLMENT_TYPE_LABEL, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE, formatCurrency, formatDateTime } from '../constants'
import { confirmPaymentApi, getAdminPaymentsApi, reconcilePaymentsApi, refundPaymentApi } from '../services/adminService'

const selectClass = 'min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm text-[#211b18] outline-none focus:border-[#6f1d32]'

export const AdminPaymentsPage = () => {
  const [searchParams] = useSearchParams()
  const [keywordInput, setKeywordInput] = useState(searchParams.get('keyword') || '')
  const [filters, setFilters] = useState({ keyword: searchParams.get('keyword') || '', status: searchParams.get('status') || '', method: '', page: 1 })
  const [feedback, setFeedback] = useState(null)
  const [reconcileResult, setReconcileResult] = useState(null)
  const [reconciling, setReconciling] = useState(false)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) => (current.keyword === keywordInput.trim() ? current : { ...current, keyword: keywordInput.trim(), page: 1 }))
    }, 350)
    return () => window.clearTimeout(timer)
  }, [keywordInput])

  const loader = useCallback(() => getAdminPaymentsApi({
    keyword: filters.keyword || undefined,
    status: filters.status || undefined,
    method: filters.method || undefined,
    page: filters.page,
    perPage: 15,
  }).then((response) => response.data), [filters])
  const { data, loading, refreshing, error, reload } = useApiResource(loader, { fallbackError: 'Không thể tải giao dịch.' })
  const payments = data?.items || []
  const pagination = data?.pagination
  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value, page: 1 }))

  const reconcile = async () => {
    setReconciling(true)
    setFeedback(null)
    try {
      const result = (await reconcilePaymentsApi()).data
      setReconcileResult(result)
      setFeedback({ tone: result.mismatchCount ? 'error' : 'success', message: `Đối soát ${result.checkedCount} giao dịch: ${result.matchedCount} khớp, ${result.mismatchCount} lệch.` })
    } catch (requestError) {
      setFeedback({ tone: 'error', message: apiErrorMessage(requestError, 'Không thể đối soát.') })
    } finally {
      setReconciling(false)
    }
  }

  const confirmTransfer = (payment) => setDialog({
    title: `Xác nhận chuyển khoản · Đơn #${payment.orderId}`,
    description: `Chỉ xác nhận sau khi đã thấy khoản ${formatCurrency(payment.amount)} trong ứng dụng ngân hàng với nội dung "DH${payment.orderId} THANH TOAN".`,
    details: payment.orderStatus === 'PENDING_CONFIRMATION' ? 'Đơn đang chờ xác nhận sẽ tự chuyển sang Đã xác nhận.' : null,
    confirmLabel: 'Ghi nhận đã thanh toán',
    reason: { label: 'Mã giao dịch ngân hàng', placeholder: 'Ví dụ: FT26102100123', minLength: 4, maxLength: 100 },
    onConfirm: async (transactionCode) => {
      await confirmPaymentApi(payment.paymentId, { transactionCode })
      setFeedback({ tone: 'success', message: `Đã ghi nhận chuyển khoản cho đơn #${payment.orderId}.` })
      reload({ quiet: true })
    },
  })

  const refund = (payment) => setDialog({
    title: `Hoàn tiền giao dịch #${payment.paymentId}`,
    tone: 'danger',
    description: `Ghi nhận đã hoàn ${formatCurrency(payment.amount)} cho đơn #${payment.orderId}. Doanh thu sẽ không còn tính khoản này.`,
    details: 'Hãy chuyển tiền cho khách trước, sau đó ghi nhận tại đây để lưu vết đối soát.',
    confirmLabel: 'Ghi nhận hoàn tiền',
    reason: { label: 'Lý do hoàn tiền', placeholder: 'Ví dụ: Nhà hàng hết nguyên liệu, khách hủy đơn đã thanh toán...', minLength: 5 },
    onConfirm: async (refundReason) => {
      await refundPaymentApi(payment.paymentId, refundReason)
      setFeedback({ tone: 'success', message: `Đã ghi nhận hoàn tiền cho đơn #${payment.orderId}.` })
      reload({ quiet: true })
    },
  })

  return (
    <div className="max-w-[1400px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><span className="moc-eyebrow">DÒNG TIỀN</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Thanh toán</h1><p className="mt-3 text-sm text-[#625a55]">Xác nhận chuyển khoản, đối soát số tiền và lưu vết hoàn tiền.</p></div>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" icon={RefreshCw} isLoading={refreshing && !loading} onClick={() => reload({ quiet: true })}>Làm mới</Button>
          <Button variant="outline" icon={Scale} isLoading={reconciling} onClick={reconcile}>Đối soát</Button>
        </div>
      </header>

      <section className="mt-8 moc-panel p-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <Input icon={Search} value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="Mã đơn, mã giao dịch..." aria-label="Tìm giao dịch" />
        <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className={selectClass} aria-label="Lọc trạng thái thanh toán">
          <option value="">Mọi trạng thái</option>
          {Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={filters.method} onChange={(event) => updateFilter('method', event.target.value)} className={selectClass} aria-label="Lọc phương thức">
          <option value="">Mọi phương thức</option>
          {Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </section>

      <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} className="mt-4" />
      {reconcileResult?.mismatches?.length > 0 && (
        <section className="mt-4 border border-red-200 bg-red-50 p-4">
          <h2 className="text-sm font-bold text-red-800">Giao dịch lệch số tiền</h2>
          <ul className="mt-2 grid gap-1 text-sm text-red-800">
            {reconcileResult.mismatches.map((item) => (
              <li key={item.paymentId}>#{item.paymentId} · Đơn #{item.orderId}: giao dịch {formatCurrency(item.paymentAmount)} / đơn {item.orderAmount === null ? 'không tồn tại' : formatCurrency(item.orderAmount)}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-5">
        <AdminDataState loading={loading} error={error} onRetry={() => reload()} empty={!payments.length} emptyMessage="Không có giao dịch phù hợp.">
          <div className="moc-panel overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-[#eee6dc]"><tr>{['Giao dịch', 'Đơn hàng', 'Phương thức', 'Số tiền', 'Trạng thái', 'Thao tác'].map((label) => <th key={label} scope="col" className="px-5 py-4 text-xs font-bold tracking-[0.08em] uppercase text-[#625a55]">{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-[var(--moc-line)]">
                {payments.map((payment) => {
                  const canConfirm = payment.paymentMethod === 'BANK_TRANSFER_QR' && ['UNPAID', 'FAILED'].includes(payment.status) && payment.orderStatus !== 'CANCELLED'
                  const needsRefund = payment.status === 'PAID' && payment.orderStatus === 'CANCELLED'
                  return (
                    <tr key={payment.paymentId} className={needsRefund ? 'bg-red-50/60' : 'bg-[#fffdf8]'}>
                      <td className="px-5 py-4"><strong>#{payment.paymentId}</strong><p className="mt-1 text-xs text-[#625a55] break-all">{payment.transactionCode || 'Chưa có mã giao dịch'}</p></td>
                      <td className="px-5 py-4">#{payment.orderId}{payment.invoiceId ? ` · HĐ #${payment.invoiceId}` : ''}<p className="mt-1 text-xs text-[#625a55]">{formatDateTime(payment.orderDate)} · {FULFILLMENT_TYPE_LABEL[payment.fulfillmentType] || '—'}</p><p className="mt-1 text-xs text-[#625a55]">{ORDER_STATUS_LABEL[payment.orderStatus] || ''}</p></td>
                      <td className="px-5 py-4">{PAYMENT_METHOD_LABEL[payment.paymentMethod] || payment.paymentMethod}</td>
                      <td className="px-5 py-4 font-semibold text-[#6f1d32]">{formatCurrency(payment.amount)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold ${PAYMENT_STATUS_TONE[payment.status] || 'bg-[#eee6dc]'}`}>{PAYMENT_STATUS_LABEL[payment.status] || payment.status}</span>
                        {needsRefund && <p className="mt-2 text-xs font-semibold text-red-800">Đơn đã hủy · cần hoàn tiền</p>}
                        {payment.refundReason && <p className="mt-2 max-w-56 text-xs text-[#625a55]">{payment.refundReason}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {canConfirm && <Button size="sm" icon={BadgeCheck} onClick={() => confirmTransfer(payment)}>Xác nhận đã nhận</Button>}
                          {payment.status === 'PAID' && <Button size="sm" variant={needsRefund ? 'danger' : 'outline'} icon={RotateCcw} onClick={() => refund(payment)}>Hoàn tiền</Button>}
                          {!canConfirm && payment.status !== 'PAID' && <span className="text-xs text-[#625a55]">{payment.paymentMethod === 'CASH' && payment.status === 'UNPAID' ? 'Thu khi bàn giao' : '—'}</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {pagination && <Pagination currentPage={pagination.currentPage} lastPage={pagination.totalPages} totalItems={pagination.totalItems} itemLabel="giao dịch" onPageChange={(page) => setFilters((current) => ({ ...current, page }))} disabled={refreshing} className="mt-2" />}
        </AdminDataState>
      </div>

      {dialog && <ConfirmDialog key={dialog.title} isOpen {...dialog} onClose={() => setDialog(null)} />}
    </div>
  )
}

export default AdminPaymentsPage
