import { CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'

/**
 * Modal Xác Nhận Nhận Cọc Đặt Bàn (ConfirmDepositModal)
 * - Cho phép Admin/Nhân viên xác nhận tiền cọc tại quầy hoặc qua chuyển khoản ngân hàng (BKG-14)
 * - Tự động đồng bộ bàn ăn sang RESERVED
 * - Độ dài < 95 dòng
 */
export const ConfirmDepositModal = ({
  isOpen,
  onClose,
  onConfirm,
  reservation,
  isSubmitting = false,
}) => {
  if (!reservation) return null

  const id = reservation.reservationId || reservation.ma_dat_ban
  const guestCount = reservation.guestCount || reservation.so_luong_khach || 1
  const customerName = reservation.recipientName || reservation.customerName || reservation.account?.username || 'Khách hàng'
  const phone = reservation.recipientPhone || reservation.phoneNumber || '—'
  const depositAmount = Number(reservation.depositAmount || reservation.tien_coc || guestCount * 50000)
  const timeStr = reservation.reservationTime || reservation.thoi_gian || '—'
  const tableName = reservation.tableName || reservation.table?.tableName || (reservation.tableId ? `Bàn #${reservation.tableId}` : 'Chưa gán')

  const handleConfirm = () => {
    onConfirm(id)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Xác nhận nhận cọc đặt bàn #${id}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 py-2">
        <div className="p-3.5 rounded-xl bg-surface-bg border border-border-subtle text-xs space-y-1.5 text-text-body">
          <p className="flex justify-between">
            <span className="text-text-muted">Khách hàng:</span>
            <strong className="text-text-main">{customerName} ({phone})</strong>
          </p>
          <p className="flex justify-between">
            <span className="text-text-muted">Bàn ăn &amp; Số khách:</span>
            <span className="font-semibold text-text-main">{tableName} • {guestCount} khách</span>
          </p>
          <p className="flex justify-between">
            <span className="text-text-muted">Thời gian đến:</span>
            <span className="font-mono text-text-main">
              {timeStr ? new Date(timeStr).toLocaleString('vi-VN') : '—'}
            </span>
          </p>
          <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
            <span className="text-text-muted flex items-center gap-1 font-semibold">
              <DollarSign className="w-3.5 h-3.5 text-brand-primary" />
              <span>Tiền cọc quy định:</span>
            </span>
            <span className="font-mono font-bold text-brand-primary text-sm">
              {depositAmount.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/30 text-[11px] text-brand-hover leading-relaxed">
          <ShieldCheck className="w-4 h-4 inline-block mr-1 -mt-0.5" />
          Xác nhận khách đã chuyển cọc thành công (nội dung cú pháp <strong>DB{id} COC</strong>). Hệ thống sẽ chuyển phiếu sang <strong>ĐÃ XÁC NHẬN (CONFIRMED)</strong> và khóa bàn ăn sang <strong>ĐÃ ĐẶT (RESERVED)</strong>.
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            icon={CheckCircle2}
          >
            Xác nhận đã nhận cọc
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDepositModal

