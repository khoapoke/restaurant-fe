import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import { CheckCircle2, XCircle, Users, Check, AlertTriangle, Utensils } from 'lucide-react'

/**
 * Modal xử lý các thao tác điều phối đặt bàn:
 * - CONFIRMED: Duyệt gán bàn
 * - SEATED: Khách vào bàn (bàn chuyển sang OCCUPIED)
 * - CANCELLED: Hủy lượt đặt đã duyệt
 * - REJECTED: Từ chối lượt đặt
 * - COMPLETED: Hoàn tất & giải phóng bàn về AVAILABLE
 */
export const ReservationActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  reservation,
  tables = [],
  actionType = 'CONFIRMED',
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

  const isConfirmAction = actionType === 'CONFIRMED'
  const isRejectAction = actionType === 'REJECTED'
  const isCancelAction = actionType === 'CANCELLED'
  const isSeatedAction = actionType === 'SEATED'
  const isCompleteAction = actionType === 'COMPLETED'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isConfirmAction && !selectedTableId) {
      setError('Vui lòng chọn bàn ăn để gán cho lượt đặt này')
      return
    }
    if ((isRejectAction || isCancelAction) && !adminNote.trim()) {
      setError(`Vui lòng nhập lý do ${isRejectAction ? 'từ chối' : 'hủy'} đặt bàn`)
      return
    }

    onConfirm({
      reservationId: id,
      targetStatus: isSeatedAction ? 'CONFIRMED' : actionType,
      tableId: selectedTableId ? Number(selectedTableId) : undefined,
      tableStatus: isSeatedAction ? 'OCCUPIED' : undefined,
      adminNote: adminNote.trim() || undefined,
    })
  }

  const titleMap = {
    CONFIRMED: `Xác nhận duyệt đặt bàn #${id}`,
    SEATED: `Khách nhận bàn #${id} (Bắt đầu dùng bữa)`,
    CANCELLED: `Hủy lượt đặt bàn #${id}`,
    REJECTED: `Từ chối đặt bàn #${id}`,
    COMPLETED: `Hoàn tất lượt dùng bữa #${id}`,
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleMap[actionType] || `Thao tác đặt bàn #${id}`}
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

        {/* Mô tả giải phóng bàn */}
        {(isCompleteAction || isCancelAction || isRejectAction) && (
          <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 text-[11px] text-gray-400">
            ℹ️ Bàn ăn liên kết sẽ được tự động giải phóng và chuyển về trạng thái{' '}
            <strong className="text-emerald-400">Bàn trống (AVAILABLE)</strong> trên sơ đồ bàn.
          </div>
        )}

        {/* Khách vào bàn */}
        {isSeatedAction && (
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-300">
            🍽️ Xác nhận khách đã có mặt tại nhà hàng. Bàn ăn sẽ được chuyển sang trạng thái{' '}
            <strong className="text-white font-bold">Đang có khách (OCCUPIED)</strong> trên sơ đồ bàn.
          </div>
        )}

        {/* Ô ghi chú Admin */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-300">
            {isRejectAction || isCancelAction
              ? 'Lý do (bắt buộc) *'
              : 'Ghi chú của Admin (tùy chọn)'}
          </label>
          <textarea
            rows={2}
            placeholder={
              isRejectAction || isCancelAction
                ? 'Nhập lý do...'
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
            variant={isRejectAction || isCancelAction ? 'danger' : 'primary'}
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            icon={
              isRejectAction || isCancelAction
                ? XCircle
                : isSeatedAction
                ? Utensils
                : isCompleteAction
                ? Check
                : CheckCircle2
            }
          >
            {isRejectAction
              ? 'Xác nhận Từ chối'
              : isCancelAction
              ? 'Xác nhận Hủy đặt bàn'
              : isSeatedAction
              ? 'Vào bàn (Bắt đầu phục vụ)'
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
