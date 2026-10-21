import { useState } from 'react'
import { Banknote, CheckCircle2, LockKeyhole, Printer, QrCode, ReceiptText, RotateCcw } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import { formatMoney } from '../constants'

const QUICK_CASH_STEPS = [50000, 100000, 200000, 500000]

const quickAmounts = (total) => {
  const options = new Set([total])
  QUICK_CASH_STEPS.forEach((step) => options.add(Math.ceil(total / step) * step))
  return [...options].filter((value) => value >= total).sort((a, b) => a - b).slice(0, 4)
}

const darkOutlineButton = 'min-h-11 inline-flex items-center justify-center gap-2 border border-white/25 px-3 text-sm font-semibold text-[#fff8ed] hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'

const PAYMENT_METHOD_LABEL = { CASH: 'Tiền mặt', BANK_TRANSFER_QR: 'Chuyển khoản QR' }

export const BillingPanel = ({ session, order, unfinishedCount, actionBusy, onCreateInvoice, onPay, onReopen, onClose, onPrint }) => {
  const invoice = session.invoice?.status === 'VOID' ? null : session.invoice
  const isPaid = invoice?.status === 'PAID'
  const items = order?.items?.filter((item) => item.kitchenStatus !== 'CANCELLED') || []
  const hasDraft = items.some((item) => item.kitchenStatus === 'DRAFT')
  const canInvoice = items.length > 0 && !hasDraft && !invoice && session.status === 'OPEN'
  const total = Number(invoice?.totalAmount ?? order?.totalAmount ?? 0)

  const [method, setMethod] = useState('CASH')
  const [received, setReceived] = useState('')
  const [transactionCode, setTransactionCode] = useState('')
  const receivedAmount = Number(received || 0)
  const change = receivedAmount - total
  const cashReady = receivedAmount >= total && total > 0

  const submitPayment = () => onPay({
    method,
    amount: total,
    transactionCode: method === 'BANK_TRANSFER_QR' ? transactionCode.trim() || null : null,
  })

  return (
    <section className="bg-[#251b19] text-[#fff8ed] moc-inverse border border-[#251b19] p-5" aria-label="Thanh toán">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><ReceiptText className="w-5 h-5 text-[#e0b774]" /><h2 className="moc-serif text-2xl">Thanh toán</h2></div>
        {invoice && <span className="text-xs text-[#d6cbc2]">Hóa đơn #{invoice.invoiceId}</span>}
      </div>
      <p className="mt-3 text-sm leading-6 text-[#e5dbd2]">
        {!invoice && (hasDraft ? 'Gửi toàn bộ món nháp xuống bếp trước khi lập hóa đơn.' : items.length ? 'Lập hóa đơn khi khách yêu cầu thanh toán.' : 'Chưa có món để lập hóa đơn.')}
        {invoice && !isPaid && 'Hóa đơn đã chốt. Chọn hình thức khách thanh toán.'}
        {isPaid && (unfinishedCount > 0 ? `Đã thanh toán. Còn ${unfinishedCount} món chưa sẵn sàng tại bếp.` : 'Đã thanh toán đủ. Có thể đóng phiên để chuyển bàn sang chờ vệ sinh.')}
      </p>

      <div className="mt-5 py-4 border-y border-white/15 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-[#e5dbd2]">Tạm tính</span><span>{formatMoney(invoice?.subTotal ?? order?.totalAmount)}</span></div>
        <div className="flex justify-between"><span className="text-[#e5dbd2]">Giảm giá</span><span>{formatMoney(invoice?.discountTotal)}</span></div>
        <div className="pt-2 flex justify-between text-lg"><strong>Tổng cộng</strong><strong className="text-[#f0c987]">{formatMoney(total)}</strong></div>
      </div>

      {!invoice && <Button variant="light" className="mt-5 w-full shadow-none" icon={ReceiptText} onClick={onCreateInvoice} isLoading={actionBusy} disabled={!canInvoice}>LẬP HÓA ĐƠN</Button>}

      {invoice && !isPaid && (
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
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#e5dbd2]">
                Khách đưa
                <input type="number" min="0" step="1000" inputMode="numeric" value={received} onChange={(event) => setReceived(event.target.value)} placeholder={String(total)}
                  className="min-h-11 border border-white/25 bg-white/5 px-3 text-base font-semibold normal-case tracking-normal text-[#fff8ed] outline-none focus:border-[#f0c987]" />
              </label>
              <div className="flex flex-wrap gap-2">
                {quickAmounts(total).map((amount) => (
                  <button key={amount} type="button" onClick={() => setReceived(String(amount))} className="min-h-9 px-3 border border-white/25 text-sm hover:bg-white/10">{amount === total ? 'Đủ tiền' : formatMoney(amount)}</button>
                ))}
              </div>
              <p className="flex justify-between text-sm"><span className="text-[#e5dbd2]">Tiền thối lại</span><strong className={change >= 0 ? 'text-[#f0c987]' : 'text-[#ffb4a8]'}>{received ? (change >= 0 ? formatMoney(change) : `Thiếu ${formatMoney(-change)}`) : '—'}</strong></p>
              <Button variant="light" className="w-full shadow-none" icon={Banknote} onClick={submitPayment} isLoading={actionBusy} disabled={!cashReady}>XÁC NHẬN THU TIỀN MẶT</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {invoice.qr && (
                <div className="bg-[#fff8ed] p-3 text-[#251b19]">
                  <img src={invoice.qr.qrImageUrl} alt={`Mã VietQR thanh toán hóa đơn ${invoice.invoiceId}`} className="mx-auto w-full max-w-56 aspect-square object-contain" />
                  <p className="mt-2 text-center text-xs text-[#625a55]">{invoice.qr.accountName} · {invoice.qr.accountNo}</p>
                  <p className="mt-1 text-center text-sm font-bold">Nội dung: {invoice.qr.transferContent}</p>
                </div>
              )}
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#e5dbd2]">
                Mã giao dịch ngân hàng
                <input value={transactionCode} onChange={(event) => setTransactionCode(event.target.value)} maxLength={100} placeholder="Ví dụ: FT26102100123"
                  className="min-h-11 border border-white/25 bg-white/5 px-3 text-base normal-case tracking-normal text-[#fff8ed] placeholder:text-[#bfb2a8] outline-none focus:border-[#f0c987]" />
              </label>
              <p className="text-xs leading-5 text-[#e5dbd2]">Chỉ xác nhận sau khi thấy tiền về trong ứng dụng ngân hàng của nhà hàng.</p>
              <Button variant="light" className="w-full shadow-none" icon={CheckCircle2} onClick={submitPayment} isLoading={actionBusy}>XÁC NHẬN ĐÃ NHẬN CHUYỂN KHOẢN</Button>
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
          <div className="flex items-start gap-2 text-sm font-semibold text-[#9fe3bd]"><CheckCircle2 className="w-5 h-5 shrink-0" /> Đã thu {formatMoney(invoice.totalAmount)} · {PAYMENT_METHOD_LABEL[invoice.payment?.method] || 'Đã thanh toán'}</div>
          {invoice.payment?.transactionCode && <p className="text-xs text-[#e5dbd2] break-all">Mã giao dịch: {invoice.payment.transactionCode}</p>}
          <button type="button" className={`${darkOutlineButton} w-full`} onClick={onPrint}><Printer className="w-4 h-4" />In hóa đơn</button>
          <Button variant="light" className="w-full shadow-none" icon={LockKeyhole} onClick={onClose} isLoading={actionBusy} disabled={unfinishedCount > 0}>ĐÓNG PHIÊN &amp; CHỜ VỆ SINH</Button>
        </div>
      )}
    </section>
  )
}

export default BillingPanel
