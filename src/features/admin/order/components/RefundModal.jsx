import { useState } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { RotateCcw, AlertTriangle } from 'lucide-react'

export const RefundModal = ({
  isOpen,
  onClose,
  onConfirm,
  payment,
  isRefunding,
}) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState(null)

  if (!payment) return null

  const paymentId = payment.paymentId || payment.ma_thanh_toan
  const amount = Number(payment.amount || payment.so_tien || 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hoàn tiền')
      return
    }
    setError(null)
    onConfirm(paymentId, reason.trim())
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ghi nhận Hoàn tiền (Refund)"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
          <span>
            Bạn đang ghi nhận hoàn tiền cho giao dịch <strong>#{paymentId}</strong> với số tiền{' '}
            <strong className="text-white font-mono">{amount.toLocaleString('vi-VN')} đ</strong>.
          </span>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-300">
            Lý do hoàn tiền <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Ví dụ: Khách hủy đơn, Nhà hàng hết món đột xuất..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError(null)
            }}
            className="w-full px-3 py-2 text-xs bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
          {error && <p className="text-[11px] text-red-400">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isRefunding}>
            Đóng
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isRefunding}
            icon={RotateCcw}
          >
            Xác nhận Hoàn tiền
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default RefundModal

