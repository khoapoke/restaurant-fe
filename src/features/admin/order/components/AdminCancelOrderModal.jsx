import { useState } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { AlertTriangle, XCircle } from 'lucide-react'

/**
 * Modal Hủy Đơn Hàng (AdminCancelOrderModal)
 * - 100% Centralized Design Tokens
 * - Độ dài < 80 dòng
 */
export const AdminCancelOrderModal = ({
  isOpen,
  onClose,
  onConfirm,
  order,
  isCancelling,
}) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState(null)

  if (!order) return null

  const orderId = order.orderId || order.ma_don_hang

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hủy đơn hàng')
      return
    }
    setError(null)
    onConfirm(orderId, reason.trim())
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hủy đơn hàng (Quản trị viên)"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            Bạn đang chuẩn bị hủy đơn hàng <strong>#{orderId}</strong>. Thao tác này sẽ chuyển trạng thái đơn sang CANCELLED.
          </span>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-text-muted">
            Lý do hủy đơn <span className="text-status-error">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Ví dụ: Khách gọi yêu cầu hủy, Nhà hàng hết món đột xuất..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError(null)
            }}
            className="w-full px-3 py-2 text-xs bg-surface-bg border border-border-strong rounded-xl text-text-main placeholder-text-dim focus:outline-none focus:border-status-error"
          />
          {error && <p className="text-[11px] text-status-error">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isCancelling}>
            Đóng
          </Button>
          <Button
            variant="danger"
            size="sm"
            type="submit"
            isLoading={isCancelling}
            icon={XCircle}
          >
            Xác nhận Hủy đơn
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AdminCancelOrderModal
