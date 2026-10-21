import { useState } from 'react'
import { CheckCircle2, Copy, CreditCard, Printer, ReceiptText, Timer } from 'lucide-react'
import { PAYMENT_METHOD_LABEL, formatClock, formatVnd } from '../constants'

const ReceiptLines = ({ lines }) => (
  <ul className="divide-y divide-dashed divide-[#d8cdbf]">
    {lines.map((line) => (
      <li key={`${line.dishName}-${line.unitPrice}`} className="flex items-start justify-between gap-3 py-2.5 text-[15px]">
        <span className="min-w-0">
          <span className="block font-semibold text-[#211b18]">{line.dishName}</span>
          <span className="text-sm text-[#625a55]">{line.quantity} × {formatVnd(line.unitPrice)}</span>
        </span>
        <strong className="shrink-0 text-[#211b18]">{formatVnd(line.subTotal)}</strong>
      </li>
    ))}
  </ul>
)

/** Hóa đơn điện tử dùng chung cho tab Hóa đơn và màn hình kết thúc bữa ăn (in được). */
export const Receipt = ({ invoice, tableName }) => (
  <article className="moc-print-area rounded-[24px] border border-[var(--moc-line)] bg-[#fffdf8] p-5 shadow-[0_12px_34px_rgba(65,29,23,0.07)]" aria-label="Hóa đơn điện tử">
    <header className="border-b border-dashed border-[#d8cdbf] pb-4 text-center">
      <p className="moc-serif text-2xl tracking-[0.2em] text-[#211b18]">MỘC</p>
      <p className="mt-1 text-xs tracking-[0.2em] text-[#625a55]">DINING · HÓA ĐƠN ĐIỆN TỬ</p>
      <p className="mt-3 text-sm text-[#3d2f2a]">{tableName} · Số {invoice.invoiceNumber}</p>
      {invoice.createdAt && <p className="text-xs text-[#625a55]">Lập lúc {formatClock(invoice.createdAt)} · {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}</p>}
    </header>
    <ReceiptLines lines={invoice.lines} />
    <dl className="space-y-1.5 border-t border-dashed border-[#d8cdbf] pt-3 text-[15px]">
      <div className="flex justify-between text-[#625a55]"><dt>Tạm tính</dt><dd>{formatVnd(invoice.subTotal)}</dd></div>
      {invoice.discountTotal > 0 && <div className="flex justify-between text-[#625a55]"><dt>Giảm giá</dt><dd>-{formatVnd(invoice.discountTotal)}</dd></div>}
      <div className="flex items-baseline justify-between pt-1"><dt className="font-semibold text-[#211b18]">Tổng thanh toán</dt><dd className="moc-serif text-2xl font-semibold text-[#6f1d32]">{formatVnd(invoice.totalAmount)}</dd></div>
    </dl>
    {invoice.status === 'PAID' && (
      <p className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#e3f1e6] px-4 py-2 text-sm font-semibold text-[#14532d]">
        <CheckCircle2 className="h-4 w-4" /> Đã thanh toán{invoice.payment ? ` · ${PAYMENT_METHOD_LABEL[invoice.payment.method] || invoice.payment.method}` : ''}{invoice.paidAt ? ` · ${formatClock(invoice.paidAt)}` : ''}
      </p>
    )}
  </article>
)

const TransferQr = ({ invoice }) => {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(invoice.qr.transferContent)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="rounded-[24px] border border-[#6f1d32]/25 bg-[#fffdf8] p-5 text-center" aria-labelledby="dine-transfer-title">
      <h3 id="dine-transfer-title" className="flex items-center justify-center gap-2 text-[15px] font-semibold text-[#211b18]"><CreditCard className="h-4 w-4 text-[#6f1d32]" /> Quét VietQR để chuyển khoản</h3>
      <img src={invoice.qr.qrImageUrl} alt={`Mã VietQR thanh toán ${formatVnd(invoice.totalAmount)}`} className="mx-auto mt-4 aspect-square w-56 max-w-full rounded-2xl border border-[var(--moc-line)] bg-white object-contain p-2" />
      <dl className="mt-4 space-y-2 text-left text-sm">
        <div className="flex justify-between gap-3"><dt className="text-[#625a55]">Số tiền</dt><dd className="font-bold text-[#6f1d32]">{formatVnd(invoice.totalAmount)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-[#625a55]">Người nhận</dt><dd className="text-right font-semibold text-[#211b18]">{invoice.qr.accountName} · {invoice.qr.accountNo}</dd></div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[#625a55]">Nội dung</dt>
          <dd className="flex items-center gap-1 font-mono font-semibold text-[#211b18]">
            {invoice.qr.transferContent}
            <button type="button" onClick={copy} aria-label="Sao chép nội dung chuyển khoản" className="grid h-11 w-11 place-items-center rounded-full text-[#6f1d32] hover:bg-[#6f1d32]/8"><Copy className="h-4 w-4" /></button>
          </dd>
        </div>
      </dl>
      {copied && <p className="mt-1 text-xs font-semibold text-[#14532d]" role="status">Đã sao chép nội dung</p>}
      <p className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#f3e7d3] px-4 py-2.5 text-sm font-semibold text-[#6b4a12]" aria-live="polite">
        <Timer className="h-4 w-4 animate-pulse" /> Đang chờ xác nhận thanh toán
      </p>
      <p className="mt-2 text-xs leading-5 text-[#625a55]">Trang tự cập nhật khi ngân hàng hoặc nhân viên xác nhận. Bạn cũng có thể trả tiền mặt cho nhân viên.</p>
    </section>
  )
}

/** Tab hóa đơn: tạm tính khi chưa lập hóa đơn, VietQR khi chờ thanh toán, biên nhận khi đã trả. */
export const BillPanel = ({ state, onRequestBill }) => {
  const { invoice, summary, table, session } = state
  const paymentRequest = state.serviceRequests?.find((request) => request.type === 'PAYMENT' && ['NEW', 'ACKNOWLEDGED'].includes(request.status))

  if (!invoice) {
    const lines = Object.values((state.rounds || []).flatMap((round) => round.items)
      .filter((item) => !['CANCELLED', 'REJECTED'].includes(item.status))
      .reduce((groups, item) => {
        const key = `${item.dishName}-${item.unitPrice}`
        groups[key] = groups[key] || { dishName: item.dishName, unitPrice: item.unitPrice, quantity: 0, subTotal: 0 }
        groups[key].quantity += item.quantity
        groups[key].subTotal += item.quantity * item.unitPrice
        return groups
      }, {}))

    return (
      <section aria-labelledby="dine-bill-title">
        <span className="moc-eyebrow">TẠM TÍNH</span>
        <h2 id="dine-bill-title" className="mt-2 moc-serif text-3xl font-medium text-[#211b18]">Hóa đơn của bàn</h2>
        <div className="mt-4 rounded-[24px] border border-[var(--moc-line)] bg-[#fffdf8] p-5">
          {lines.length ? <ReceiptLines lines={lines} /> : <p className="py-6 text-center text-[15px] text-[#625a55]">Chưa có món nào trên hóa đơn.</p>}
          <div className="mt-2 flex items-baseline justify-between border-t border-dashed border-[#d8cdbf] pt-3">
            <span className="font-semibold text-[#211b18]">Tạm tính</span>
            <strong className="moc-serif text-2xl text-[#6f1d32]">{formatVnd(summary?.subTotal)}</strong>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#625a55]">Giá theo thực đơn tại thời điểm gửi bếp. Hóa đơn chính thức do nhân viên lập.</p>
        </div>
        {session?.canRequestService && lines.length > 0 && (
          paymentRequest ? (
            <p className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#6f1d32]/10 px-4 py-3 text-sm font-semibold text-[#6f1d32]" aria-live="polite">
              <ReceiptText className="h-4 w-4" /> {paymentRequest.status === 'ACKNOWLEDGED' ? 'Nhân viên đang lập hóa đơn cho bàn' : 'Đã gửi yêu cầu thanh toán'}
            </p>
          ) : (
            <button type="button" onClick={onRequestBill} className="moc-inverse mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#6f1d32] text-base font-semibold text-[#fff8ed]">
              <ReceiptText className="h-5 w-5" /> Yêu cầu thanh toán
            </button>
          )
        )}
      </section>
    )
  }

  return (
    <section className="space-y-4" aria-labelledby="dine-bill-title">
      <div>
        <span className="moc-eyebrow">{invoice.status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}</span>
        <h2 id="dine-bill-title" className="mt-2 moc-serif text-3xl font-medium text-[#211b18]">Hóa đơn {invoice.invoiceNumber}</h2>
      </div>
      <Receipt invoice={invoice} tableName={table.tableName} />
      {invoice.status === 'OPEN' && invoice.qr && <TransferQr invoice={invoice} />}
      {invoice.status === 'PAID' && (
        <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#6f1d32]/35 text-[15px] font-semibold text-[#6f1d32]">
          <Printer className="h-4 w-4" /> In hoặc lưu hóa đơn (PDF)
        </button>
      )}
    </section>
  )
}

export default BillPanel
