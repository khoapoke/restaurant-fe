import { useState } from 'react'
import { AlertTriangle, Banknote, CheckCircle2, LockKeyhole, Printer, QrCode, ReceiptText, RotateCcw } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import { formatMoney } from '../constants'

const QUICK_CASH_STEPS = [50000, 100000, 200000, 500000]

const quickAmounts = (total) => {
  const options = new Set([total])
  QUICK_CASH_STEPS.forEach((step) => options.add(Math.ceil(total / step) * step))
  return [...options].filter((value) => value >= total).sort((a, b) => a - b).slice(0, 4)
}

const darkOutlineButton = 'min-h-11 inline-flex items-center justify-center gap-2 border border-white/25 px-3 text-sm font-semibold text-[#fff8ed] hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
const darkInput = 'min-h-11 border border-white/25 bg-white/5 px-3 text-base font-semibold normal-case tracking-normal text-[#fff8ed] placeholder:text-[#bfb2a8] outline-none focus:border-[#f0c987]'
const darkLabel = 'grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#e5dbd2]'

const PAYMENT_METHOD_LABEL = { CASH: 'Tiền mặt', BANK_TRANSFER_QR: 'Chuyển khoản QR' }
const MIN_REFERENCE_LENGTH = 6

/**
 * Thu tiền theo sổ cái (ADR-023): cho phép thu một phần, chuyển khoản bắt buộc mã giao dịch,
 * chỉ đóng phiên khi số còn thiếu bằng 0. Tiền thừa của khách là tiền thối lại, không ghi vào sổ.
 */
export const BillingPanel = ({ session, order, unfinishedCount, actionBusy, onCreateInvoice, onPay, pendingPayment = null, paymentSending = false, onRetryPending, onDiscardPending, onReopen, onClose, onPrint }) => {
  const invoice = session.invoice?.status === 'VOID' ? null : session.invoice
  const isPaid = invoice?.status === 'PAID'
  // Món hủy nhưng vẫn tính tiền (khách đổi ý sau khi nấu) vẫn thuộc hóa đơn.
  const items = order?.items?.filter((item) => !['CANCELLED', 'REJECTED'].includes(item.kitchenStatus) || item.billedQuantity > 0) || []
  const hasDraft = items.some((item) => item.kitchenStatus === 'DRAFT')
  const canInvoice = items.length > 0 && !hasDraft && !invoice && session.status === 'OPEN'
  const total = Number(invoice?.totalAmount ?? order?.totalAmount ?? 0)
  const paid = Number(invoice?.amountPaid ?? 0)
  const outstanding = Number(invoice?.outstanding ?? total)
  const refundDue = Number(invoice?.refundDue ?? 0)
  const voidedVersions = (invoice?.versions || []).filter((version) => version.status === 'VOID')

  const [method, setMethod] = useState('CASH')
  const [received, setReceived] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transactionCode, setTransactionCode] = useState('')
  const receivedAmount = Number(received || 0)
  const cashApplied = Math.min(receivedAmount, outstanding)
  const change = receivedAmount - outstanding
  const transferValue = Number(transferAmount || outstanding)
  const referenceOk = transactionCode.trim().length >= MIN_REFERENCE_LENGTH

  const busy = actionBusy || paymentSending
  const payCash = () => onPay({ method: 'CASH', amount: cashApplied, cashTendered: receivedAmount, transactionCode: null })
  const payTransfer = () => onPay({ method: 'BANK_TRANSFER_QR', amount: transferValue, transactionCode: transactionCode.trim() })

  return (
    <section className="bg-[#251b19] text-[#fff8ed] moc-inverse border border-[#251b19] p-5" aria-label="Thanh toán">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><ReceiptText className="w-5 h-5 text-[#e0b774]" /><h2 className="moc-serif text-2xl">Thanh toán</h2></div>
        {invoice && <span className="text-xs text-[#d6cbc2]">{invoice.invoiceNumber || `Hóa đơn #${invoice.invoiceId}`}</span>}
      </div>
      <p className="mt-3 text-sm leading-6 text-[#e5dbd2]">
        {!invoice && (hasDraft ? 'Gửi toàn bộ món nháp xuống bếp trước khi lập hóa đơn.' : items.length ? 'Lập hóa đơn khi khách yêu cầu thanh toán.' : 'Chưa có món để lập hóa đơn.')}
        {invoice && !isPaid && (paid > 0 ? `Đã thu ${formatMoney(paid)}. Còn thiếu ${formatMoney(outstanding)}.` : 'Hóa đơn đã chốt. Chọn hình thức khách thanh toán.')}
        {isPaid && (unfinishedCount > 0 ? `Đã thanh toán. Còn ${unfinishedCount} món chưa sẵn sàng tại bếp.` : 'Đã thanh toán đủ. Có thể đóng phiên để chuyển bàn sang chờ vệ sinh.')}
      </p>
      {voidedVersions.length > 0 && <p className="mt-1 text-xs text-[#d6cbc2]">Đã hủy {voidedVersions.length} bản hóa đơn trước; mã QR cũ không còn hiệu lực.</p>}

      <div className="mt-5 py-4 border-y border-white/15 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-[#e5dbd2]">Tạm tính</span><span>{formatMoney(invoice?.subTotal ?? order?.totalAmount)}</span></div>
        <div className="flex justify-between"><span className="text-[#e5dbd2]">Giảm giá</span><span>{formatMoney(invoice?.discountTotal)}</span></div>
        <div className="pt-2 flex justify-between text-lg"><strong>Tổng cộng</strong><strong className="text-[#f0c987]">{formatMoney(total)}</strong></div>
        {invoice && paid > 0 && <div className="flex justify-between"><span className="text-[#e5dbd2]">Đã thu</span><span>{formatMoney(paid)}</span></div>}
        {invoice && !isPaid && paid > 0 && <div className="flex justify-between font-semibold"><span>Còn thiếu</span><span className="text-[#ffb4a8]">{formatMoney(outstanding)}</span></div>}
      </div>

      {refundDue > 0 && (
        <p className="mt-4 flex items-start gap-2 border border-[#f0c987]/50 px-3 py-2.5 text-sm text-[#f0c987]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Khách đã trả dư {formatMoney(refundDue)} sau khi món bị hủy. Quản lý ghi nhận hoàn tiền tại màn Thanh toán.
        </p>
      )}

      {!invoice && <Button variant="light" className="mt-5 w-full shadow-none" icon={ReceiptText} onClick={onCreateInvoice} isLoading={actionBusy} disabled={!canInvoice}>LẬP HÓA ĐƠN</Button>}

      {invoice && !isPaid && pendingPayment && (
        <div className="mt-5 space-y-3 border border-[#f0c987]/60 p-3" role="alert">
          <p className="flex items-start gap-2 text-sm text-[#f0c987]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Khoản thu {formatMoney(pendingPayment.payload.amount)} ({PAYMENT_METHOD_LABEL[pendingPayment.payload.method]}) chưa rõ kết quả. Gửi lại dùng đúng mã yêu cầu cũ nên không ghi trùng.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="light" className="shadow-none" icon={RotateCcw} onClick={onRetryPending} isLoading={paymentSending}>GỬI LẠI KHOẢN THU</Button>
            <button type="button" className={darkOutlineButton} onClick={onDiscardPending} disabled={paymentSending}>Bỏ khoản này</button>
          </div>
        </div>
      )}

      {invoice && !isPaid && !pendingPayment && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 border border-white/20 p-1" role="radiogroup" aria-label="Hình thức thanh toán">
            {[{ value: 'CASH', label: 'Tiền mặt', icon: Banknote }, { value: 'BANK_TRANSFER_QR', label: 'Chuyển khoản', icon: QrCode }].map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" role="radio" aria-checked={method === value} onClick={() => setMethod(value)}
                className={`min-h-10 inline-flex items-center justify-center gap-2 text-sm font-semibold ${method === value ? 'bg-[#fff8ed] text-[#251b19]' : 'text-[#fff8ed] hover:bg-white/10'}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {method === 'CASH' ? (
            <div className="space-y-3">
              <label className={darkLabel}>
                Khách đưa
                <input type="number" min="0" step="1000" inputMode="numeric" value={received} onChange={(event) => setReceived(event.target.value)} placeholder={String(outstanding)} className={darkInput} />
              </label>
              <div className="flex flex-wrap gap-2">
                {quickAmounts(outstanding).map((amount) => (
                  <button key={amount} type="button" onClick={() => setReceived(String(amount))} className="min-h-9 px-3 border border-white/25 text-sm hover:bg-white/10">{amount === outstanding ? 'Đủ tiền' : formatMoney(amount)}</button>
                ))}
              </div>
              <p className="flex justify-between text-sm"><span className="text-[#e5dbd2]">{change >= 0 ? 'Tiền thối lại' : 'Còn thiếu sau lần thu này'}</span><strong className={change >= 0 ? 'text-[#f0c987]' : 'text-[#ffb4a8]'}>{received ? formatMoney(Math.abs(change)) : '—'}</strong></p>
              <Button variant="light" className="w-full shadow-none" icon={Banknote} onClick={payCash} isLoading={busy} disabled={receivedAmount <= 0}>
                {receivedAmount > 0 && receivedAmount < outstanding ? `GHI NHẬN THU MỘT PHẦN ${formatMoney(cashApplied)}` : 'XÁC NHẬN THU TIỀN MẶT'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {invoice.qr && (
                <div className="bg-[#fff8ed] p-3 text-[#251b19]">
                  <img src={invoice.qr.qrImageUrl} alt={`Mã VietQR thanh toán ${invoice.invoiceNumber || invoice.invoiceId}`} className="mx-auto w-full max-w-56 aspect-square object-contain" />
                  <p className="mt-2 text-center text-xs text-[#625a55]">{invoice.qr.accountName} · {invoice.qr.accountNo}</p>
                  <p className="mt-1 text-center text-sm font-bold">Nội dung: {invoice.qr.transferContent}</p>
                  <p className="mt-1 text-center text-xs text-[#625a55]">Số tiền trên mã: {formatMoney(invoice.qr.amount ?? outstanding)}</p>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <label className={darkLabel}>
                  Mã giao dịch ngân hàng
                  <input value={transactionCode} onChange={(event) => setTransactionCode(event.target.value)} maxLength={100} placeholder="Ví dụ: FT26102100123" className={darkInput} />
                </label>
                <label className={darkLabel}>
                  Số tiền về
                  <input type="number" min="0" step="1000" inputMode="numeric" value={transferAmount} onChange={(event) => setTransferAmount(event.target.value)} placeholder={String(outstanding)} className={darkInput} />
                </label>
              </div>
              <p className="text-xs leading-5 text-[#e5dbd2]">Chỉ xác nhận sau khi thấy tiền về trong ứng dụng ngân hàng của nhà hàng. Mã giao dịch tối thiểu {MIN_REFERENCE_LENGTH} ký tự; nếu ngân hàng đã báo về tự động, hệ thống sẽ gộp, không ghi trùng.</p>
              <Button variant="light" className="w-full shadow-none" icon={CheckCircle2} onClick={payTransfer} isLoading={busy} disabled={!referenceOk || transferValue <= 0}>XÁC NHẬN ĐÃ NHẬN CHUYỂN KHOẢN</Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={darkOutlineButton} onClick={onReopen} disabled={actionBusy}><RotateCcw className="w-4 h-4" />Gọi thêm món</button>
            <button type="button" className={darkOutlineButton} onClick={onPrint}><Printer className="w-4 h-4" />Xem hóa đơn</button>
          </div>
        </div>
      )}

      {isPaid && (
        <div className="mt-5 space-y-3">
          <div className="flex items-start gap-2 text-sm font-semibold text-[#9fe3bd]"><CheckCircle2 className="w-5 h-5 shrink-0" /> Đã thu {formatMoney(paid || invoice.totalAmount)} · {PAYMENT_METHOD_LABEL[invoice.payment?.method] || 'Đã thanh toán'}</div>
          {invoice.payment?.transactionCode && <p className="text-xs text-[#e5dbd2] break-all">Mã giao dịch: {invoice.payment.transactionCode}</p>}
          <button type="button" className={`${darkOutlineButton} w-full`} onClick={onPrint}><Printer className="w-4 h-4" />In hóa đơn</button>
          <Button variant="light" className="w-full shadow-none" icon={LockKeyhole} onClick={onClose} isLoading={actionBusy} disabled={unfinishedCount > 0}>ĐÓNG PHIÊN &amp; CHỜ VỆ SINH</Button>
        </div>
      )}
    </section>
  )
}

export default BillingPanel
