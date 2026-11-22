import { useState } from 'react'
import { QrCode, Copy, Check, Zap } from 'lucide-react'
import QrCountdownTimer from '../../order/components/QrCountdownTimer'

/**
 * Khối Quét Mã VietQR và Giả Lập Cọc (BookingDepositQrBox)
 * Tách từ BookingStep4Result để đảm bảo quy chuẩn < 250 dòng
 */
export default function BookingDepositQrBox({
  reservationId,
  depositDeadline,
  depositAmount,
  transferContent,
  qrUrl,
  onMockDeposit,
  mockingDeposit,
  mockError,
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(transferContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-sm mx-auto p-4 rounded-2xl bg-surface-bg border border-border-subtle text-left space-y-3 shadow-sm">
      <div className="flex items-center justify-between text-xs pb-2 border-b border-border-subtle">
        <span className="font-semibold text-text-main flex items-center gap-1.5">
          <QrCode className="w-4 h-4 text-brand-primary" />
          <span>Mã QR Thanh Toán Cọc</span>
        </span>
      </div>

      <QrCountdownTimer
        expiresAt={depositDeadline}
        storageKey={reservationId ? `T_RESMK_DEPOSIT_QR_${reservationId}` : undefined}
        initialSeconds={900}
      />

      <div className="flex justify-center p-3 bg-surface-card rounded-xl border border-border-subtle">
        <img
          src={qrUrl}
          alt="Mã VietQR Đặt Cọc"
          className="w-48 h-48 object-contain rounded-lg shadow-xs"
        />
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-text-muted">Số tiền cọc:</span>
          <strong className="text-brand-primary font-mono text-sm">
            {depositAmount.toLocaleString('vi-VN')} VNĐ
          </strong>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-muted">Cú pháp:</span>
          <div className="flex items-center gap-1.5">
            <code className="px-2 py-0.5 rounded bg-surface-card border border-border-subtle font-mono font-bold text-text-main text-xs">
              {transferContent}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-text-muted hover:text-brand-primary cursor-pointer transition-colors"
              title="Sao chép cú pháp"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {mockError && <p className="text-[11px] text-status-error">{mockError}</p>}

      <button
        type="button"
        onClick={onMockDeposit}
        disabled={mockingDeposit}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-status-success hover:bg-status-success/90 text-surface-bg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
      >
        <Zap className="w-4 h-4 fill-current" />
        <span>{mockingDeposit ? 'Đang xác nhận cọc...' : '⚡ Giả lập thanh toán cọc thành công'}</span>
      </button>
    </div>
  )
}

