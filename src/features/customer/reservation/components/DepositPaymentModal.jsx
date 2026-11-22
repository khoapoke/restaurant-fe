import { useState } from 'react'
import { QrCode, Copy, Check, Zap, AlertCircle } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import { mockDepositApi } from '../services/reservationService'
import { DEPOSIT_RATE_PER_GUEST } from '../constants'
import QrCountdownTimer from '../../order/components/QrCountdownTimer'

/**
 * Modal Thanh Toán Đặt Cọc VietQR (DepositPaymentModal)
 * - Mở khi khách hàng bấm Quét mã cọc trên thẻ đặt bàn
 * - Cung cấp mã VietQR, cú pháp chuyển khoản và nút giả lập thanh toán
 * - Độ dài < 160 dòng
 */
export default function DepositPaymentModal({
  isOpen,
  onClose,
  reservation,
  onSuccess,
}) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!reservation) return null

  const id = reservation.reservationId || reservation.id || reservation.ma_dat_ban
  const tableObj = reservation.table || reservation.ban_an || {}
  const tableName = tableObj.tableName || reservation.tableName || `Bàn #${reservation.tableId || id}`
  const guestCount = reservation.guestCount || reservation.so_luong_khach || 1
  const depositAmount = Number(reservation.depositAmount || reservation.tien_coc || guestCount * DEPOSIT_RATE_PER_GUEST)
  const timeStr = reservation.reservationTime || reservation.thoi_gian || 'Chưa xác định'

  const transferContent = `DB${id} COC`
  const qrUrl =
    reservation.qrCodeUrl ||
    `https://img.vietqr.io/image/970436-1029384756-compact2.png?amount=${depositAmount}&addInfo=DB${id}+COC`

  const handleCopy = () => {
    navigator.clipboard?.writeText(transferContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMockDeposit = async () => {
    setLoading(true)
    setError(null)
    try {
      await mockDepositApi(id)
      onSuccess?.()
      onClose?.()
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể xác nhận thanh toán cọc. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Thanh toán cọc đặt bàn #${id}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 py-1">
        {error && (
          <div className="p-3.5 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Thông tin vắn tắt phiếu đặt */}
        <div className="p-3.5 rounded-xl bg-surface-bg border border-border-subtle text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-text-muted">Bàn ăn &amp; Số khách:</span>
            <strong className="text-text-main">{tableName} • {guestCount} khách</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Thời gian đến:</span>
            <span className="font-mono text-text-main font-semibold">{timeStr}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-border-subtle">
            <span className="text-text-muted">Mức tiền cọc giữ chỗ:</span>
            <span className="text-sm font-bold font-mono text-brand-primary">
              {depositAmount.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </div>

        {/* Khung quét mã VietQR */}
        <div className="p-4 rounded-xl bg-surface-card border border-border-subtle space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-main flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-brand-primary" />
              <span>Quét mã VietQR chuyển khoản</span>
            </span>
          </div>

          <QrCountdownTimer
            expiresAt={reservation.depositDeadline || reservation.han_chot_coc}
            storageKey={`T_RESMK_DEPOSIT_QR_${id}`}
            initialSeconds={900}
          />

          <div className="flex justify-center p-2 bg-surface-bg rounded-lg border border-border-subtle">
            <img
              src={qrUrl}
              alt="Mã VietQR Đặt Cọc"
              className="w-44 h-44 object-contain rounded shadow-xs"
            />
          </div>

          <div className="flex items-center justify-between text-xs bg-surface-bg p-2.5 rounded-lg border border-border-subtle">
            <span className="text-text-muted">Nội dung chuyển khoản:</span>
            <div className="flex items-center gap-2">
              <code className="font-mono font-bold text-text-main">{transferContent}</code>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
                title="Sao chép cú pháp"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Nút Giả lập thanh toán cọc */}
        <button
          type="button"
          onClick={handleMockDeposit}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-status-success hover:bg-status-success/90 text-surface-bg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>{loading ? 'Đang xác nhận cọc...' : '⚡ Giả lập thanh toán cọc thành công'}</span>
        </button>

        <div className="flex items-center justify-end pt-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-surface-card transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  )
}

