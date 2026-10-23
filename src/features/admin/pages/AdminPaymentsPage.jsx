import { useCallback, useEffect, useState } from 'react'
import { ArrowRightLeft, BadgeCheck, CheckCheck, Landmark, ReceiptText, RefreshCw, RotateCcw, Scale, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import FeedbackBanner from '../../../components/ui/FeedbackBanner'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Pagination from '../../../components/ui/Pagination'
import { apiErrorMessage } from '../../../lib/apiError'
import { useApiResource } from '../../../lib/useApiResource'
import AdminDataState from '../components/AdminDataState'
import RefundRecordModal from '../components/RefundRecordModal'
import {
  FULFILLMENT_TYPE_LABEL,
  MONEY_DECISION_LABEL,
  MONEY_SOURCE_LABEL,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  RECONCILIATION_LABEL,
  RECONCILIATION_TONE,
  REFUND_METHOD_LABEL,
  formatCurrency,
  formatDateTime,
} from '../constants'
import {
  allocateTransactionApi,
  confirmPaymentApi,
  getAdminPaymentsApi,
  getMoneyTransactionsApi,
  reconcilePaymentsApi,
  refundPaymentApi,
  refundTransactionApi,
  resolveTransactionApi,
} from '../services/adminService'

const selectClass = 'min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm text-[#211b18] outline-none focus:border-[#6f1d32]'
const fieldClass = 'min-h-11 w-full border border-[var(--moc-line)] bg-white px-3 text-sm font-normal normal-case tracking-normal text-[#211b18] outline-none focus:border-[#6f1d32]'
const labelClass = 'grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#625a55]'

const MISMATCH_REASON = {
  ORDER_MISSING: 'Không tìm thấy đơn',
  SUMMARY_OUT_OF_SYNC: 'Bản tổng hợp lệch sổ giao dịch',
  REFUND_DUE: 'Đang chờ hoàn tiền',
  AMOUNT_MISMATCH: 'Số tiền đơn khác số tiền thanh toán',
}

/** Xác nhận chuyển khoản thủ công: bắt buộc mã giao dịch, số tiền thực nhận và giờ nhận. */
const ConfirmTransferModal = ({ payment, onClose, onDone }) => {
  const [transactionCode, setTransactionCode] = useState('')
  const alreadyPaid = Number(payment.outstanding || 0) <= 0
  const [amount, setAmount] = useState(String(alreadyPaid ? (payment.orderTotal ?? payment.amount) : payment.outstanding))
  const [receivedAt, setReceivedAt] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (transactionCode.trim().length < 6) { setError('Mã giao dịch ngân hàng tối thiểu 6 ký tự.'); return }
    if (Number(amount) <= 0) { setError('Số tiền thực nhận phải lớn hơn 0.'); return }
    setSubmitting(true)
    setError(null)
    try {
      const response = await confirmPaymentApi(payment.paymentId, {
        transactionCode: transactionCode.trim(),
        amount: Number(amount),
        receivedAt: receivedAt ? receivedAt.replace('T', ' ') + ':00' : null,
        note: note.trim() || null,
      })
      const receipt = response.data?.lastReceipt
      onDone(receipt && receipt.applied < receipt.amount
        ? `Đã lưu khoản chuyển ${formatCurrency(receipt.amount)}. Đơn #${payment.orderId} chỉ cần ${formatCurrency(receipt.applied)}, phần còn lại nằm ở "Sổ giao dịch tiền" chờ hoàn/phân bổ, không tính vào doanh thu.`
        : `Đã ghi nhận ${formatCurrency(amount)} chuyển khoản cho đơn #${payment.orderId}.`)
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen onClose={() => !submitting && onClose()} title={`Xác nhận chuyển khoản · Đơn #${payment.orderId}`} maxWidth="max-w-lg">
      <form onSubmit={submit} className="grid gap-4">
        <p className="text-sm leading-6 text-[#625a55]">Chỉ ghi nhận khi đã thấy tiền trong ứng dụng ngân hàng. Nếu ngân hàng đã tự báo về cùng mã giao dịch, hệ thống gộp lại, không ghi trùng.</p>
        {alreadyPaid && <p className="border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">Đơn đã đủ tiền. Khoản chuyển thêm (khách chuyển hai lần) sẽ được lưu vào sổ và chờ hoàn/phân bổ, không tính vào doanh thu.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>Mã giao dịch<input value={transactionCode} onChange={(event) => setTransactionCode(event.target.value)} maxLength={100} placeholder="FT26102100123" className={fieldClass} /></label>
          <label className={labelClass}>Số tiền thực nhận<input type="number" min="0" step="1000" value={amount} onChange={(event) => setAmount(event.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Giờ tiền về (nếu biết)<input type="datetime-local" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Ghi chú<input value={note} onChange={(event) => setNote(event.target.value)} maxLength={255} className={fieldClass} /></label>
        </div>
        {Number(amount) !== Number(payment.outstanding ?? payment.amount) && Number(amount) > 0 && (
          <p className="text-sm text-amber-900">Số tiền khác số còn thiếu ({formatCurrency(payment.outstanding ?? payment.amount)}): thiếu sẽ được ghi thanh toán một phần, dư sẽ nằm chờ hoàn/phân bổ.</p>
        )}
        {error && <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Quay lại</Button>
          <Button type="submit" icon={BadgeCheck} isLoading={submitting}>Ghi nhận tiền về</Button>
        </div>
      </form>
    </Modal>
  )
}

/** Phân bổ tiền chưa gắn đơn (thiếu nội dung, QR cũ, chuyển nhầm) sang một đơn cụ thể. */
const AllocateModal = ({ transaction, onClose, onDone }) => {
  const [orderId, setOrderId] = useState(transaction.targetOrderId ? String(transaction.targetOrderId) : '')
  const [amount, setAmount] = useState(String(transaction.unallocatedAmount))
  const [note, setNote] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!orderId) { setError('Nhập mã đơn cần áp tiền.'); return }
    if (note.trim().length < 3) { setError('Ghi rõ căn cứ phân bổ (tối thiểu 3 ký tự).'); return }
    setSubmitting(true)
    setError(null)
    try {
      await allocateTransactionApi(transaction.transactionId, { orderId: Number(orderId), amount: Number(amount) || null, note: note.trim() })
      onDone(`Đã áp tiền giao dịch #${transaction.transactionId} vào đơn #${orderId}.`)
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen onClose={() => !submitting && onClose()} title={`Phân bổ giao dịch #${transaction.transactionId}`} maxWidth="max-w-md">
      <form onSubmit={submit} className="grid gap-4">
        <p className="text-sm text-[#625a55]">Còn chưa phân bổ {formatCurrency(transaction.unallocatedAmount)}. Hệ thống chỉ áp tối đa số đơn còn thiếu.</p>
        <label className={labelClass}>Mã đơn<input type="number" min="1" value={orderId} onChange={(event) => setOrderId(event.target.value)} className={fieldClass} /></label>
        <label className={labelClass}>Số tiền áp<input type="number" min="0" step="1000" value={amount} onChange={(event) => setAmount(event.target.value)} className={fieldClass} /></label>
        <label className={labelClass}>Căn cứ<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="Ví dụ: Khách gửi ảnh biên lai, xác nhận qua điện thoại" className="border border-[var(--moc-line)] bg-white p-3 text-sm font-normal normal-case tracking-normal text-[#211b18]" /></label>
        {error && <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Quay lại</Button>
          <Button type="submit" icon={ArrowRightLeft} isLoading={submitting}>Áp vào đơn</Button>
        </div>
      </form>
    </Modal>
  )
}

const TransactionsPanel = ({ onFeedback }) => {
  const [filters, setFilters] = useState({ reconciliation: 'NEEDS_REVIEW', keyword: '', page: 1 })
  const [keywordInput, setKeywordInput] = useState('')
  const [modal, setModal] = useState(null)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setFilters((current) => (current.keyword === keywordInput.trim() ? current : { ...current, keyword: keywordInput.trim(), page: 1 })), 350)
    return () => window.clearTimeout(timer)
  }, [keywordInput])

  const loader = useCallback(() => getMoneyTransactionsApi({
    reconciliation: filters.reconciliation || undefined,
    keyword: filters.keyword || undefined,
    page: filters.page,
    perPage: 15,
  }).then((response) => response.data), [filters])
  const { data, loading, refreshing, error, reload } = useApiResource(loader, { fallbackError: 'Không thể tải sổ giao dịch.' })
  const transactions = data?.items || []
  const pagination = data?.pagination

  const done = (message) => {
    setModal(null)
    onFeedback({ tone: 'success', message })
    reload({ quiet: true })
  }

  const resolve = (transaction) => setDialog({
    title: `Đánh dấu đã xử lý · Giao dịch #${transaction.transactionId}`,
    description: 'Chỉ dùng khi phần tiền còn lại đã được phân bổ hoặc ghi nhận hoàn. Ghi chú sẽ được lưu vào nhật ký đối soát.',
    confirmLabel: 'Đánh dấu đã xử lý',
    reason: { label: 'Ghi chú đối soát', minLength: 3, maxLength: 500 },
    onConfirm: async (note) => {
      await resolveTransactionApi(transaction.transactionId, note)
      onFeedback({ tone: 'success', message: `Đã đánh dấu giao dịch #${transaction.transactionId} là đã xử lý.` })
      reload({ quiet: true })
    },
  })

  return (
    <div className="mt-6">
      <section className="moc-panel p-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <Input icon={Search} value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="Mã tham chiếu, nội dung chuyển khoản..." aria-label="Tìm giao dịch tiền" />
        <select value={filters.reconciliation} onChange={(event) => setFilters((current) => ({ ...current, reconciliation: event.target.value, page: 1 }))} className={selectClass} aria-label="Lọc trạng thái đối soát">
          <option value="">Mọi trạng thái đối soát</option>
          {Object.entries(RECONCILIATION_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </section>
      <div className="mt-5">
        <AdminDataState loading={loading} error={error} onRetry={() => reload()} empty={!transactions.length} emptyMessage={filters.reconciliation === 'NEEDS_REVIEW' ? 'Không có khoản tiền nào cần xem xét.' : 'Không có giao dịch phù hợp.'}>
          <div className="grid gap-3">
            {transactions.map((transaction) => (
              <article key={transaction.transactionId} className="moc-panel p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <strong>#{transaction.transactionId} · {formatCurrency(transaction.amount)}</strong>
                      <span className={`px-2 py-0.5 text-xs font-bold ${RECONCILIATION_TONE[transaction.reconciliation]}`}>{RECONCILIATION_LABEL[transaction.reconciliation]}</span>
                      {transaction.flagLabel && <span className="bg-red-50 px-2 py-0.5 text-xs font-bold text-red-800">{transaction.flagLabel}</span>}
                      {transaction.isLegacy && <span className="bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-700">Dữ liệu cũ</span>}
                    </p>
                    <p className="mt-1 text-[#625a55]">{MONEY_SOURCE_LABEL[transaction.source] || transaction.source} · {transaction.provider}{transaction.account ? ` · TK ${transaction.account}` : ''} · {transaction.reference || 'không có mã tham chiếu'}</p>
                    <p className="mt-1 text-[#625a55]">Tiền về: {transaction.receivedAt ? formatDateTime(transaction.receivedAt) : 'không rõ ngày (dữ liệu cũ)'} · Ghi nhận: {formatDateTime(transaction.recordedAt)}{transaction.recordedBy ? ` bởi ${transaction.recordedBy}` : ''}</p>
                    {transaction.content && <p className="mt-1 break-all text-[#211b18]">Nội dung: {transaction.content}</p>}
                  </div>
                  <div className="text-right text-xs text-[#625a55]">
                    <p>Đã áp: <strong className="text-[#211b18]">{formatCurrency(transaction.allocatedAmount)}</strong></p>
                    <p>Đã hoàn: <strong className="text-[#211b18]">{formatCurrency(transaction.refundedAmount)}</strong></p>
                    <p>Chưa phân bổ: <strong className={transaction.unallocatedAmount > 0 ? 'text-[#8a1c1c]' : 'text-[#211b18]'}>{formatCurrency(transaction.unallocatedAmount)}</strong></p>
                  </div>
                </div>
                {(transaction.allocations?.length > 0 || transaction.refunds?.length > 0) && (
                  <ul className="mt-3 grid gap-1 border-t border-[var(--moc-line)] pt-3 text-xs text-[#625a55]">
                    {transaction.allocations?.map((allocation) => <li key={`a-${allocation.allocationId}`}>{allocation.type === 'APPLY' ? 'Áp vào' : 'Đảo do hoàn'} đơn #{allocation.orderId}{allocation.invoiceId ? ` · HD${allocation.invoiceId}-V${allocation.invoiceVersion}` : ''}: {formatCurrency(allocation.amount)}</li>)}
                    {transaction.refunds?.map((refund) => <li key={`r-${refund.refundId}`}>{refund.type === 'COMPENSATION' ? 'Bồi hoàn' : 'Đã hoàn'} {formatCurrency(refund.amount)}{refund.orderId ? ` · đơn #${refund.orderId}` : ''}{refund.fromAllocated > 0 ? '' : ' (tiền chưa phân bổ)'} · {REFUND_METHOD_LABEL[refund.method] || refund.method} · {refund.reference} · {refund.refundedAt ? formatDateTime(refund.refundedAt) : 'không rõ ngày'}{refund.refundedBy ? ` · ${refund.refundedBy}` : ''} — {refund.reason}</li>)}
                  </ul>
                )}
                {transaction.reviewNote && <p className="mt-2 text-xs text-[#625a55]">Đối soát: {transaction.reviewNote}{transaction.reviewedBy ? ` · ${transaction.reviewedBy}` : ''}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {transaction.unallocatedAmount > 0 && <Button size="sm" icon={ArrowRightLeft} onClick={() => setModal({ kind: 'allocate', transaction })}>Áp vào đơn</Button>}
                  {transaction.refundableAmount > 0 && <Button size="sm" variant="outline" icon={RotateCcw} onClick={() => setModal({ kind: 'refund', transaction })}>Ghi nhận đã hoàn tiền</Button>}
                  {transaction.reconciliation === 'NEEDS_REVIEW' && <Button size="sm" variant="ghost" icon={CheckCheck} onClick={() => resolve(transaction)}>Đánh dấu đã xử lý</Button>}
                </div>
              </article>
            ))}
          </div>
          {pagination && <Pagination currentPage={pagination.currentPage} lastPage={pagination.totalPages} totalItems={pagination.totalItems} itemLabel="giao dịch" onPageChange={(page) => setFilters((current) => ({ ...current, page }))} disabled={refreshing} className="mt-2" />}
        </AdminDataState>
      </div>
      {modal?.kind === 'allocate' && <AllocateModal transaction={modal.transaction} onClose={() => setModal(null)} onDone={done} />}
      {modal?.kind === 'refund' && (
        <RefundRecordModal
          title={`Ghi nhận đã hoàn tiền · Giao dịch #${modal.transaction.transactionId}`}
          maxAmount={modal.transaction.refundableAmount}
          suggestedAmount={modal.transaction.unallocatedAmount > 0 ? modal.transaction.unallocatedAmount : modal.transaction.refundableAmount}
          context={`Giao dịch ${formatCurrency(modal.transaction.amount)} · ${modal.transaction.reference || 'không mã'} · ưu tiên hoàn phần chưa phân bổ trước.`}
          refundDue={modal.transaction.refundDueAmount ?? modal.transaction.unallocatedAmount}
          onSubmit={async (payload, key) => { await refundTransactionApi(modal.transaction.transactionId, payload, key); done('Đã ghi nhận khoản hoàn tiền.') }}
          onClose={() => setModal(null)}
        />
      )}
      {dialog && <ConfirmDialog key={dialog.title} isOpen {...dialog} onClose={() => setDialog(null)} />}
    </div>
  )
}

export const AdminPaymentsPage = () => {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'transactions' ? 'transactions' : 'orders')
  const [keywordInput, setKeywordInput] = useState(searchParams.get('keyword') || '')
  const [filters, setFilters] = useState({ keyword: searchParams.get('keyword') || '', status: searchParams.get('status') || '', method: '', attention: searchParams.get('attention') === '1', page: 1 })
  const [feedback, setFeedback] = useState(null)
  const [reconcileResult, setReconcileResult] = useState(null)
  const [reconciling, setReconciling] = useState(false)
  const [modal, setModal] = useState(null)

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
    attention: filters.attention ? 1 : undefined,
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
      setFeedback({
        tone: result.mismatchCount || result.transactionsNeedingReview ? 'error' : 'success',
        message: `Đối soát ${result.checkedCount} đơn: ${result.matchedCount} khớp, ${result.mismatchCount} cần xử lý · ${result.transactionsNeedingReview} khoản tiền cần xem xét. ${result.note || ''}`,
      })
    } catch (requestError) {
      setFeedback({ tone: 'error', message: apiErrorMessage(requestError, 'Không thể đối soát.') })
    } finally {
      setReconciling(false)
    }
  }

  const done = (message) => {
    setModal(null)
    setFeedback({ tone: 'success', message })
    reload({ quiet: true })
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><span className="moc-eyebrow">DÒNG TIỀN</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Thanh toán</h1><p className="mt-3 text-sm text-[#625a55]">Mỗi khoản tiền thật là một dòng trong sổ: xác nhận chuyển khoản, xử lý tiền dư/thiếu và ghi nhận hoàn tiền.</p></div>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" icon={RefreshCw} isLoading={refreshing && !loading} onClick={() => reload({ quiet: true })}>Làm mới</Button>
          <Button variant="outline" icon={Scale} isLoading={reconciling} onClick={reconcile}>Đối soát</Button>
        </div>
      </header>

      <div className="mt-6 flex gap-2" role="tablist" aria-label="Chế độ xem">
        {[{ key: 'orders', label: 'Theo đơn', icon: ReceiptText }, { key: 'transactions', label: 'Sổ giao dịch tiền', icon: Landmark }].map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`min-h-11 inline-flex items-center gap-2 border px-4 text-sm font-semibold ${tab === key ? 'moc-inverse border-[#6f1d32] bg-[#6f1d32] text-[#fff8ed]' : 'border-[var(--moc-line)] bg-[#fffdf8] text-[#211b18]'}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} className="mt-4" />

      {tab === 'transactions' && <TransactionsPanel onFeedback={setFeedback} />}

      {tab === 'orders' && (
        <>
          <section className="mt-6 moc-panel p-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <Input icon={Search} value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="Mã đơn, mã giao dịch..." aria-label="Tìm giao dịch" />
            <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className={selectClass} aria-label="Lọc trạng thái thanh toán">
              <option value="">Mọi trạng thái</option>
              {Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select value={filters.method} onChange={(event) => updateFilter('method', event.target.value)} className={selectClass} aria-label="Lọc phương thức">
              <option value="">Mọi phương thức</option>
              {Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <label className="min-h-12 inline-flex items-center gap-2 border border-[var(--moc-line)] bg-white px-4 text-sm">
              <input type="checkbox" checked={filters.attention} onChange={(event) => updateFilter('attention', event.target.checked)} className="h-4 w-4 accent-[#6f1d32]" />Cần hoàn tiền
            </label>
          </section>

          {reconcileResult?.mismatches?.length > 0 && (
            <section className="mt-4 border border-red-200 bg-red-50 p-4">
              <h2 className="text-sm font-bold text-red-800">Đơn cần xử lý sau đối soát</h2>
              <ul className="mt-2 grid gap-1 text-sm text-red-800">
                {reconcileResult.mismatches.map((item) => (
                  <li key={item.paymentId}>Đơn #{item.orderId}: {MISMATCH_REASON[item.reason] || item.reason}{item.refundDue ? ` · chờ hoàn ${formatCurrency(item.refundDue)}` : ''}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-5">
            <AdminDataState loading={loading} error={error} onRetry={() => reload()} empty={!payments.length} emptyMessage="Không có giao dịch phù hợp.">
              <div className="moc-panel overflow-x-auto">
                <table className="w-full min-w-[1040px] text-left text-sm">
                  <thead className="bg-[#eee6dc]"><tr>{['Thanh toán', 'Đơn hàng', 'Phương thức', 'Số tiền', 'Trạng thái', 'Thao tác'].map((label) => <th key={label} scope="col" className="px-5 py-4 text-xs font-bold tracking-[0.08em] uppercase text-[#625a55]">{label}</th>)}</tr></thead>
                  <tbody className="divide-y divide-[var(--moc-line)]">
                    {payments.map((payment) => {
                      const outstanding = Number(payment.outstanding || 0)
                      const refundDue = Number(payment.refundDue || 0)
                      const refundable = Math.max(0, Number(payment.amountPaid || 0))
                      const canConfirm = outstanding > 0 && payment.orderStatus !== 'CANCELLED'
                      const canRecordExtra = payment.paymentMethod === 'BANK_TRANSFER_QR' && !canConfirm
                      return (
                        <tr key={payment.paymentId} className={refundDue > 0 ? 'bg-red-50/60' : 'bg-[#fffdf8]'}>
                          <td className="px-5 py-4"><strong>#{payment.paymentId}</strong><p className="mt-1 text-xs text-[#625a55] break-all">{payment.transactionCode || 'Chưa có mã giao dịch'}</p>{payment.paidAt && <p className="mt-1 text-xs text-[#625a55]">Đủ tiền lúc {formatDateTime(payment.paidAt)}</p>}</td>
                          <td className="px-5 py-4">#{payment.orderId}{payment.invoiceId ? ` · HĐ #${payment.invoiceId}` : ''}<p className="mt-1 text-xs text-[#625a55]">{formatDateTime(payment.orderDate)} · {FULFILLMENT_TYPE_LABEL[payment.fulfillmentType] || '—'}</p><p className="mt-1 text-xs text-[#625a55]">{ORDER_STATUS_LABEL[payment.orderStatus] || ''}{payment.cancellationDecision ? ` · ${MONEY_DECISION_LABEL[payment.cancellationDecision]}` : ''}</p></td>
                          <td className="px-5 py-4">{PAYMENT_METHOD_LABEL[payment.paymentMethod] || payment.paymentMethod}</td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#6f1d32]">{formatCurrency(payment.orderTotal ?? payment.amount)}</p>
                            <p className="mt-1 text-xs text-[#625a55]">Đã thu {formatCurrency(payment.amountPaid)}{payment.amountRefunded > 0 ? ` · đã hoàn ${formatCurrency(payment.amountRefunded)}` : ''}</p>
                            {outstanding > 0 && payment.orderStatus !== 'CANCELLED' && <p className="mt-1 text-xs font-semibold text-amber-900">Còn thiếu {formatCurrency(outstanding)}</p>}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 text-xs font-bold ${PAYMENT_STATUS_TONE[payment.status] || 'bg-[#eee6dc]'}`}>{PAYMENT_STATUS_LABEL[payment.status] || payment.status}</span>
                            {refundDue > 0 && <p className="mt-2 text-xs font-semibold text-red-800">Cần hoàn {formatCurrency(refundDue)}</p>}
                            {payment.refundReason && <p className="mt-2 max-w-56 text-xs text-[#625a55]">{payment.refundReason}</p>}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              {canConfirm && payment.paymentMethod === 'BANK_TRANSFER_QR' && <Button size="sm" icon={BadgeCheck} onClick={() => setModal({ kind: 'confirm', payment })}>Ghi nhận tiền về</Button>}
                              {canRecordExtra && <Button size="sm" variant="ghost" icon={BadgeCheck} onClick={() => setModal({ kind: 'confirm', payment })}>Ghi nhận khoản chuyển thêm</Button>}
                              {refundable > 0 && <Button size="sm" variant={refundDue > 0 ? 'danger' : 'outline'} icon={RotateCcw} onClick={() => setModal({ kind: 'refund', payment, refundable, refundDue })}>Ghi nhận đã hoàn</Button>}
                              {!canConfirm && refundable <= 0 && <span className="text-xs text-[#625a55]">{payment.paymentMethod === 'CASH' && outstanding > 0 ? 'Thu khi bàn giao' : '—'}</span>}
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
        </>
      )}

      {modal?.kind === 'confirm' && <ConfirmTransferModal payment={modal.payment} onClose={() => setModal(null)} onDone={done} />}
      {modal?.kind === 'refund' && (
        <RefundRecordModal
          title={`Ghi nhận đã hoàn tiền · Đơn #${modal.payment.orderId}`}
          maxAmount={modal.refundable}
          suggestedAmount={modal.refundDue > 0 ? modal.refundDue : modal.refundable}
          context={`Đã thu ${formatCurrency(modal.payment.amountPaid)}${modal.refundDue > 0 ? ` · nhà hàng đang nợ khách ${formatCurrency(modal.refundDue)}` : ''}.`}
          refundDue={modal.refundDue}
          allowCompensation={modal.payment.orderStatus !== 'CANCELLED'}
          onSubmit={async (payload, key) => { await refundPaymentApi(modal.payment.paymentId, payload, key); done(`Đã ghi nhận hoàn tiền cho đơn #${modal.payment.orderId}.`) }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

export default AdminPaymentsPage
