import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import { CheckCircle2, XCircle, Users, Clock, AlertTriangle } from 'lucide-react'

export const ReservationActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  reservation,
  tables = [],
  actionType = 'CONFIRMED', // 'CONFIRMED' | 'REJECTED' | 'COMPLETED'
  isSubmitting = false,
}) => {
  const [selectedTableId, setSelectedTableId] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (reservation) {
      const defaultTableId =
        reservation.tableId ||
        reservation.ma_ban ||
        reservation.table?.tableId ||
        ''
      setSelectedTableId(defaultTableId)
      setAdminNote(reservation.adminNote || '')
    } else {
      setSelectedTableId('')
      setAdminNote('')
    }
    setError(null)
  }, [reservation, isOpen])

  if (!reservation) return null

  const id = reservation.reservationId || reservation.ma_dat_ban
  const guestCount = reservation.guestCount || reservation.so_luong_khach || 1
  const customerName =
    reservation.recipientName ||
    reservation.customerName ||
    reservation.account?.username ||
    'Khách hàng'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (actionType === 'CONFIRMED' && !selectedTableId) {
      setError('Vui lòng chọn bàn ăn để gán cho lượt đặt này')
      return
    }
    if (actionType === 'REJECTED' && !adminNote.trim()) {
      setError('Vui lòng nhập lý do từ chối đặt bàn')
      return
    }

    onConfirm({
      reservationId: id,
      targetStatus: actionType,
      tableId: selectedTableId ? Number(selectedTableId) : undefined,
      adminNote: adminNote.trim() || undefined,
    })
  }

  const isConfirmAction = actionType === 'CONFIRMED'
  const isRejectAction = actionType === 'REJECTED'
  const isCompleteAction = actionType === 'COMPLETED'

  const titleMap = {
    CONFIRMED: `Xác nhận đặt bàn #${id}`,
    REJECTED: `Từ chối đặt bàn #${id}`,
    COMPLETED: `Hoàn thành lượt dùng bữa #${id}`,
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleMap[actionType] || `Duyệt đặt bàn #${id}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Thông tin vắn tắt */}
        <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-1.5 text-gray-300">
          <p className="flex justify-between">
            <span className="text-gray-400">Khách hàng:</span>
            <strong className="text-white">{customerName}</strong>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-400">Số lượng khách:</span>
            <span className="font-mono font-bold text-amber-400">{guestCount} khách</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-400">Thời gian đến:</span>
            <span className="font-mono text-gray-200">
              {reservation.reservationTime
                ? new Date(reservation.reservationTime).toLocaleString('vi-VN')
                : '—'}
            </span>
          </p>
          {reservation.note && (
            <p className="text-[11px] text-amber-300/80 italic pt-1 border-t border-gray-900">
              Ghi chú của khách: {reservation.note}
            </p>
          )}
        </div>

        {/* Khi duyệt: Chọn bàn ăn */}
        {isConfirmAction && (
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-300">
              Bàn ăn gán cho khách <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedTableId}
              onChange={(e) => {
                setSelectedTableId(e.target.value)
                setError(null)
              }}
              className="w-full px-3 py-2 text-xs bg-gray-950 border border-gray-800 rounded-xl text-gray-100 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">-- Chọn bàn ăn phù hợp --</option>
              {tables.map((t) => {
                const tId = t.tableId || t.ma_ban
                const tName = t.tableName || t.ten_ban
                const tCap = t.capacity || t.suc_chua
                const tLoc = t.location || t.vi_tri || ''
                const tStatus = t.status || t.trang_thai
                const isSuit = tCap >= guestCount

                return (
                  <option key={tId} value={tId}>
                    {tName} ({tCap} ghế - {tLoc}) {tStatus === 'AVAILABLE' ? '🟢 Trống' : `(${tStatus})`}
                    {!isSuit ? ' ⚠️ Ít ghế hơn khách' : ''}
                  </option>
                )
              })}
            </select>
          </div>
        )}

        {/* Ô ghi chú Admin */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-300">
            {isRejectAction
              ? 'Lý do từ chối (bắt buộc) *'
              : 'Ghi chú của Admin (tùy chọn)'}
          </label>
          <textarea
            rows={2}
            placeholder={
              isRejectAction
                ? 'Nhập lý do từ chối đặt bàn...'
                : 'Ví dụ: Đã chuẩn bị ghế trẻ em, Bàn cạnh cửa sổ...'
            }
            value={adminNote}
            onChange={(e) => {
              setAdminNote(e.target.value)
              if (error) setError(null)
            }}
            className="w-full px-3 py-2 text-xs bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button
            variant={isRejectAction ? 'danger' : 'primary'}
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            icon={isRejectAction ? XCircle : CheckCircle2}
          >
            {isRejectAction
              ? 'Xác nhận Từ chối'
              : isCompleteAction
              ? 'Hoàn tất & Trả bàn'
              : 'Xác nhận Duyệt bàn'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ReservationActionModal

