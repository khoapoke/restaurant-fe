import { useState } from 'react'
import { AlertTriangle, XCircle } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import { cancelCustomerReservationApi } from '../services/reservationService'

/**
 * Modal Xác Nhận Hủy Lượt Đặt Bàn (CancelReservationModal)
 * - Chuẩn hóa sang Design Tokens
 * - Độ dài < 110 dòng
 */
export default function CancelReservationModal({ isOpen, onClose, reservation, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!reservation) return null

  const id = reservation?.reservationId || reservation?.id || reservation?.ma_dat_ban
  const tableObj = reservation?.table || reservation?.ban_an || {}
  const tableName = tableObj.tableName || reservation?.tableName || `Bàn số ${reservation?.tableId || id}`
  const timeStr = reservation?.reservationTime || reservation?.reservation_time || reservation?.thoi_gian

  const handleCancel = async () => {
    setLoading(true)
    setError(null)
    try {
      await cancelCustomerReservationApi(id)
      onSuccess?.()
      onClose?.()
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Không thể hủy lượt đặt bàn này. Có thể đã sát giờ quy định (< 60 phút).'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hủy lượt đặt bàn" maxWidth="max-w-md">
      <div className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 rounded-xl bg-surface-card border border-border-subtle text-xs space-y-2">
          <p className="text-text-muted">
            Mã đặt: <span className="font-mono text-brand-primary font-bold">#{id}</span>
          </p>
          <p className="text-text-muted">
            Bàn ăn: <span className="text-text-main font-semibold">{tableName}</span>
          </p>
          <p className="text-text-muted">
            Thời gian hẹn: <span className="text-text-main font-semibold">{timeStr}</span>
          </p>
        </div>

        <p className="text-xs text-text-muted leading-relaxed">
          Bạn có chắc chắn muốn hủy lượt đặt bàn này không? Sau khi xác nhận hủy, bàn sẽ được hoàn lại để phục vụ các thượng khách khác.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-surface-card transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-status-error hover:bg-status-error/90 text-surface-bg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <XCircle className="w-4 h-4" />
            <span>{loading ? 'Đang hủy...' : 'Xác nhận hủy'}</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}
