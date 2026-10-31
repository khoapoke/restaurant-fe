import { useState } from 'react'
import { AlertTriangle, XCircle } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { cancelCustomerReservationApi } from '../services/reservationService'

export const CancelReservationModal = ({ isOpen, onClose, reservation, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!reservation) return null

  const id = reservation?.reservationId || reservation?.id || reservation?.ma_dat_ban
  const tableObj = reservation?.table || reservation?.ban_an || reservation?.banAn || {}
  const tableName =
    tableObj.tableName ||
    tableObj.table_name ||
    tableObj.name ||
    tableObj.ten_ban ||
    reservation?.tableName ||
    reservation?.ten_ban ||
    (reservation?.tableId || reservation?.table_id || reservation?.ma_ban
      ? `Bàn số ${reservation.tableId || reservation.table_id || reservation.ma_ban}`
      : 'Bàn chưa xác định')

  const timeStr =
    reservation?.reservationTime ||
    reservation?.reservation_time ||
    reservation?.thoi_gian ||
    reservation?.thoi_gian_dat

  const handleCancel = async () => {
    setLoading(true)
    setError(null)
    try {
      await cancelCustomerReservationApi(id)
      onSuccess?.()
      onClose?.()
    } catch (err) {
      console.error('Cancel reservation error:', err)
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
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 rounded-xl bg-gray-950/60 border border-gray-800 text-xs space-y-2">
          <p className="text-gray-300">
            <span className="text-gray-500">Mã đặt:</span> <span className="font-mono text-amber-400 font-bold">#{id}</span>
          </p>
          <p className="text-gray-300">
            <span className="text-gray-500">Bàn:</span> <span className="text-white font-medium">{tableName}</span>
          </p>
          <p className="text-gray-300">
            <span className="text-gray-500">Thời gian hẹn:</span> <span className="text-white font-medium">{timeStr}</span>
          </p>
        </div>

        <p className="text-xs text-gray-400">
          Bạn có chắc chắn muốn hủy lượt đặt bàn này không? Sau khi hủy, bàn sẽ được giải phóng để phục vụ khách hàng khác.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Đóng
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={XCircle}
            onClick={handleCancel}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Đang hủy...' : 'Xác nhận hủy'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default CancelReservationModal
