import { useState } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { cancelOrderApi } from '../services/orderService'
import { AlertTriangle } from 'lucide-react'

export const CancelOrderModal = ({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const quickReasons = [
    'Đổi ý muốn chọn món khác',
    'Đặt nhầm địa chỉ giao hàng',
    'Thời gian giao hàng không phù hợp',
    'Có việc bận đột xuất',
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Vui lòng chọn hoặc nhập lý do hủy đơn.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await cancelOrderApi(orderId, reason.trim())
      onSuccess?.(orderId)
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (err.response?.status === 409) {
        setError(
          data?.message || 'Không thể hủy đơn do bếp đã bắt đầu chuẩn bị món ăn.'
        )
      } else {
        setError(data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Yêu cầu hủy đơn hàng #${orderId}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Khách hàng chỉ có thể hủy đơn khi nhà hàng chưa xác nhận và bếp chưa nấu.
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300">
            Lý do hủy đơn:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickReasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors border text-left
                  ${
                    reason === r
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-medium'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Hoặc nhập lý do khác chi tiết hơn..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500 transition-colors resize-none mt-2"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Đóng
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="sm"
            isLoading={loading}
          >
            Xác nhận hủy đơn
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CancelOrderModal
