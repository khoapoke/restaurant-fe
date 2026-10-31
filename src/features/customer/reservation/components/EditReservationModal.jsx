import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Users } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { updateReservationApi } from '../services/reservationService'

export const EditReservationModal = ({ isOpen, onClose, reservation, onSuccess }) => {
  const [guestCount, setGuestCount] = useState(2)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (reservation) {
      setGuestCount(
        reservation.guestCount ||
        reservation.guest_count ||
        reservation.so_luong_khach ||
        reservation.so_khach ||
        2
      )
      setNote(reservation.note || reservation.ghi_chu || reservation.customer_note || '')
      setError(null)
    }
  }, [reservation, isOpen])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        guestCount: Number(guestCount),
        note: note.trim(),
      }
      // Giữ nguyên bàn và thời gian nếu không đổi
      if (reservation.tableId || reservation.table?.id || reservation.table?.tableId) {
        payload.tableId = reservation.tableId || reservation.table?.id || reservation.table?.tableId
      }
      if (timeStr) {
        payload.reservationTime = timeStr
      }

      await updateReservationApi(id, payload)
      onSuccess?.()
      onClose?.()
    } catch (err) {
      console.error('Update reservation error:', err)
      setError(
        err?.response?.data?.message ||
        'Không thể cập nhật lượt đặt bàn. Có thể đã sát giờ quy định (< 60 phút).'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa thông tin đặt bàn" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800 text-xs space-y-1.5">
          <p className="text-gray-400">
            Mã đặt: <span className="font-mono text-amber-400 font-bold">#{id}</span>
          </p>
          <p className="text-gray-400">
            Bàn ăn: <span className="text-gray-200 font-medium">{tableName}</span>
          </p>
          <p className="text-gray-400">
            Thời gian: <span className="text-gray-200 font-medium">{timeStr}</span>
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Số lượng khách <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="20"
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50 pl-10"
              required
            />
            <Users className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Ghi chú yêu cầu đặc biệt
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Cập nhật yêu cầu thêm..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50 resize-none placeholder-gray-600"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={CheckCircle}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditReservationModal
