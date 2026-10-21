import { Printer } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { formatMoney } from '../constants'

const PAYMENT_METHOD_LABEL = { CASH: 'Tiền mặt', BANK_TRANSFER_QR: 'Chuyển khoản QR' }

const formatDateTime = (value) => value
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : '—'

/**
 * Hóa đơn tại bàn. Khi in, CSS `.moc-print-area` chỉ giữ lại phần hóa đơn.
 */
export const InvoiceReceiptModal = ({ session, order, isOpen, onClose }) => {
  if (!isOpen || !session) return null
  const invoice = session.invoice?.status === 'VOID' ? null : session.invoice
  const items = (order?.items || []).filter((item) => !['CANCELLED', 'REJECTED'].includes(item.kitchenStatus))
  const total = invoice?.totalAmount ?? order?.totalAmount ?? 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hóa đơn tại bàn" maxWidth="max-w-md">
      <div className="moc-print-area bg-white p-5 text-[#211b18] border border-[var(--moc-line)]">
        <div className="text-center">
          <p className="moc-serif text-2xl">Mộc Dining</p>
          <p className="mt-1 text-xs text-[#625a55]">Vị Việt đương đại · Mở cửa 10:00 — 22:30</p>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-1 text-sm">
          <dt className="text-[#625a55]">Hóa đơn</dt><dd className="text-right font-semibold">{invoice ? `#${invoice.invoiceId}` : 'Tạm tính'}</dd>
          <dt className="text-[#625a55]">Bàn</dt><dd className="text-right">{session.tables.map((table) => table.tableName).join(' + ')}</dd>
          <dt className="text-[#625a55]">Số khách</dt><dd className="text-right">{session.guestCount}</dd>
          <dt className="text-[#625a55]">Mở phiên</dt><dd className="text-right">{formatDateTime(session.openedAt)}</dd>
          <dt className="text-[#625a55]">Thu ngân</dt><dd className="text-right">{session.staff.fullName || session.staff.username}</dd>
        </dl>
        <table className="mt-4 w-full border-t border-dashed border-[#211b18]/40 text-sm">
          <thead><tr className="text-left text-xs text-[#625a55]"><th className="pt-3 font-semibold">Món</th><th className="pt-3 text-center font-semibold">SL</th><th className="pt-3 text-right font-semibold">Thành tiền</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.itemId}><td className="py-1.5 pr-2">{item.dishName}<span className="block text-xs text-[#625a55]">{formatMoney(item.unitPrice)}</span></td><td className="py-1.5 text-center">{item.quantity}</td><td className="py-1.5 text-right">{formatMoney(item.subTotal)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 border-t border-dashed border-[#211b18]/40 pt-3 space-y-1 text-sm">
          <p className="flex justify-between"><span>Tạm tính</span><span>{formatMoney(invoice?.subTotal ?? total)}</span></p>
          <p className="flex justify-between"><span>Giảm giá</span><span>{formatMoney(invoice?.discountTotal ?? 0)}</span></p>
          <p className="flex justify-between text-base font-bold"><span>Tổng cộng</span><span>{formatMoney(total)}</span></p>
          {invoice?.status === 'PAID' && (
            <p className="flex justify-between text-[#625a55]"><span>Đã thanh toán · {PAYMENT_METHOD_LABEL[invoice.payment?.method] || ''}</span><span>{formatDateTime(invoice.paidAt)}</span></p>
          )}
        </div>
        {invoice?.status === 'OPEN' && invoice.qr && (
          <div className="mt-4 text-center">
            <img src={invoice.qr.qrImageUrl} alt="Mã VietQR thanh toán" className="mx-auto w-40 aspect-square object-contain" />
            <p className="mt-1 text-xs">Nội dung chuyển khoản: <strong>{invoice.qr.transferContent}</strong></p>
          </div>
        )}
        <p className="mt-4 text-center text-xs text-[#625a55]">Cảm ơn quý khách đã dùng bữa tại Mộc.</p>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Đóng</Button>
        <Button icon={Printer} onClick={() => window.print()}>In hóa đơn</Button>
      </div>
    </Modal>
  )
}

export default InvoiceReceiptModal
