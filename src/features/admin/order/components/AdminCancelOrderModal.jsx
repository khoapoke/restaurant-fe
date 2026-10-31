import { useState } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { AlertTriangle, XCircle } from 'lucide-react'

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
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            Bạn đang chuẩn bị hủy đơn hàng <strong>#{orderId}</strong>. Thao tác này sẽ cập nhật trạng thái đơn thành CANCELLED.
          </span>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-300">
            Lý do hủy đơn <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Ví dụ: Khách gọi yêu cầu hủy, Nhà hàng hết món đột xuất..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError(null)
            }}
            className="w-full px-3 py-2 text-xs bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
          {error && <p className="text-[11px] text-red-400">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
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

