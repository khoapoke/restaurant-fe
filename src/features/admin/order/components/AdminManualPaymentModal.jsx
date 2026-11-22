import { useState } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { CheckCircle2, Banknote } from 'lucide-react'

export const AdminManualPaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  paymentId,
  amount,
  isLoading = false,
}) => {
  const [note, setNote] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onConfirm(note)
    setNote('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận thanh toán thủ công"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-status-success/10 border border-status-success/30">
          <div className="w-10 h-10 rounded-xl bg-status-success/20 text-status-success flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main">
              {orderId ? `Xác nhận thu tiền đơn #${orderId}` : `Xác nhận giao dịch #${paymentId}`}
            </h4>
            <p className="text-[11px] text-text-muted mt-0.5">
              Số tiền: <span className="font-mono font-bold text-brand-primary">{Number(amount || 0).toLocaleString('vi-VN')} đ</span>
            </p>
          </div>
        </div>

        <p className="text-text-muted leading-relaxed">
          Vui lòng kiểm tra kỹ đã thu đủ tiền mặt hoặc kiểm tra biến động số dư trên ứng dụng ngân hàng trước khi xác nhận. Sau khi xác nhận, trạng thái thanh toán sẽ chuyển sang <strong className="text-status-success">Đã thanh toán (PAID)</strong> (đơn đang chờ xác nhận sẽ tự chuyển sang <strong className="text-status-info">Đã xác nhận (CONFIRMED)</strong>).
        </p>

        <div>
          <label className="block text-text-muted mb-1 font-medium">Ghi chú xác nhận (tùy chọn):</label>
          <input
            type="text"
            placeholder="Ví dụ: Đã thu đủ tiền mặt / Đã thấy tiền vào tài khoản..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isLoading}
            className="w-full bg-surface-input border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={CheckCircle2}
            isLoading={isLoading}
          >
            Xác nhận đã nhận tiền
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AdminManualPaymentModal

