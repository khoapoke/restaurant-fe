import { Banknote, CheckCircle2, LockKeyhole, ReceiptText } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import { formatMoney } from '../constants'

export const BillingPanel = ({ session, order, onCreateInvoice, onPay, onClose, actionBusy }) => {
  const invoice = session.invoice
  const isPaid = invoice?.status === 'PAID'
  const hasDraft = order?.items?.some((item) => item.kitchenStatus === 'DRAFT')
  const canInvoice = order?.items?.length > 0 && !hasDraft && !invoice

  return (
    <section className="bg-[#251b19] text-[#fff8ed] moc-inverse border border-[#251b19] p-5">
      <div className="flex items-center gap-3"><ReceiptText className="w-5 h-5 text-[#caa46a]" /><h2 className="moc-serif text-2xl">Thanh toán</h2></div>
      <p className="mt-3 text-sm leading-6 text-[#d6cbc2]">
        {!invoice && (hasDraft ? 'Gửi toàn bộ món xuống bếp trước khi lập hóa đơn.' : 'Lập hóa đơn khi khách yêu cầu thanh toán.')}
        {invoice && !isPaid && 'Hóa đơn đã chốt. Kiểm tra số tiền trước khi ghi nhận thanh toán.'}
        {isPaid && 'Đã thanh toán đủ. Có thể đóng phiên khi món đã sẵn sàng hoặc đã phục vụ.'}
      </p>

      <div className="mt-5 py-4 border-y border-white/15 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-[#d6cbc2]">Tạm tính</span><span>{formatMoney(invoice?.subTotal ?? order?.totalAmount)}</span></div>
        <div className="flex justify-between"><span className="text-[#d6cbc2]">Giảm giá</span><span>{formatMoney(invoice?.discountTotal)}</span></div>
        <div className="pt-2 flex justify-between text-lg"><strong>Tổng cộng</strong><strong className="text-[#e0b774]">{formatMoney(invoice?.totalAmount ?? order?.totalAmount)}</strong></div>
      </div>

      {!invoice && <Button variant="light" className="mt-5 w-full shadow-none" icon={ReceiptText} onClick={onCreateInvoice} isLoading={actionBusy} disabled={!canInvoice}>LẬP HÓA ĐƠN</Button>}
      {invoice && !isPaid && <Button variant="light" className="mt-5 w-full shadow-none" icon={Banknote} onClick={onPay} isLoading={actionBusy}>XÁC NHẬN TIỀN MẶT</Button>}
      {isPaid && (
        <>
          <div className="mt-5 flex items-center gap-2 text-emerald-300 text-sm font-semibold"><CheckCircle2 className="w-5 h-5" /> Đã thanh toán {formatMoney(invoice.totalAmount)}</div>
          <Button variant="light" className="mt-4 w-full shadow-none" icon={LockKeyhole} onClick={onClose} isLoading={actionBusy}>ĐÓNG PHIÊN &amp; CHỜ VỆ SINH</Button>
        </>
      )}
    </section>
  )
}

export default BillingPanel
