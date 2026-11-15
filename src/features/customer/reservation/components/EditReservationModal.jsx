import { useState, useEffect } from 'react'
import { AlertCircle, Users, MessageSquare } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import { updateReservationApi } from '../services/reservationService'

/**
 * Modal Chỉnh Sửa Thông Tin Đặt Bàn (EditReservationModal)
 * - Cập nhật số lượng khách và ghi chú
 * - Chuẩn hóa Design Tokens, độ dài < 130 dòng
 */
export default function EditReservationModal({ isOpen, onClose, reservation, onSuccess }) {
  const [guestCount, setGuestCount] = useState(2)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (reservation) {
      setGuestCount(reservation.guestCount || reservation.so_luong_khach || 2)
      setNote(reservation.note || reservation.ghi_chu || '')
      setError(null)
    }
  }, [reservation, isOpen])

  if (!reservation) return null

  const id = reservation?.reservationId || reservation?.id || reservation?.ma_dat_ban
  const tableObj = reservation?.table || reservation?.ban_an || {}
  const tableName = tableObj.tableName || reservation?.tableName || `Bàn số ${reservation?.tableId || id}`
  const timeStr = reservation?.reservationTime || reservation?.reservation_time || reservation?.thoi_gian

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        guestCount: Number(guestCount),
        note: note.trim(),
      }
      if (reservation.tableId || tableObj.tableId || tableObj.id) {
        payload.tableId = reservation.tableId || tableObj.tableId || tableObj.id
      }
      if (timeStr) {
        payload.reservationTime = timeStr
      }

      await updateReservationApi(id, payload)
      onSuccess?.()
      onClose?.()
    } catch (err) {
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
          <div className="p-3.5 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle text-xs space-y-1.5">
          <p className="text-text-muted">
            Mã đặt: <span className="font-mono text-brand-primary font-bold">#{id}</span>
          </p>
          <p className="text-text-muted">
            Bàn ăn: <span className="text-text-main font-semibold">{tableName}</span>
          </p>
          <p className="text-text-muted">
            Thời gian: <span className="text-text-main font-semibold">{timeStr}</span>
          </p>
        </div>

        {/* Số lượng khách */}
        <div>
          <label className="text-xs font-semibold text-text-main flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-brand-primary" />
            <span>Số lượng khách</span>
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-subtle text-xs sm:text-sm text-text-main focus:outline-none focus:border-brand-primary"
            required
          />
        </div>

        {/* Ghi chú */}
        <div>
          <label className="text-xs font-semibold text-text-main flex items-center gap-1.5 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
            <span>Ghi chú phục vụ</span>
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Yêu cầu riêng về món ăn hoặc vị trí..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-bg border border-border-subtle text-xs sm:text-sm text-text-main focus:outline-none focus:border-brand-primary resize-none"
          />
        </div>

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
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-brand-primary hover:bg-brand-hover text-surface-bg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
