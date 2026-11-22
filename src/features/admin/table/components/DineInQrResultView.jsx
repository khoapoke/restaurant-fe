import { Copy, Check, ExternalLink } from 'lucide-react'
import Button from '../../../../components/ui/Button'

/**
 * Component hiển thị kết quả mã QR và link gọi món sau khi mở bàn
 * T-ResMK Dine-in Architecture
 */
export default function DineInQrResultView({
  tableName,
  orderId,
  qrImageSrc,
  clientUrl,
  copied,
  onCopyLink,
  onClose,
  onResetSession,
}) {
  return (
    <div className="text-center space-y-4">
      {/* QR Code Canvas */}
      <div className="p-4 bg-white rounded-2xl inline-block shadow-md mx-auto border border-border-subtle">
        <img
          src={qrImageSrc}
          alt={`Mã QR ${tableName}`}
          className="w-48 h-48 mx-auto object-contain"
        />
      </div>

      <div className="space-y-1">
        <p className="text-xs font-bold text-text-main">
          Đơn hàng bàn: #{orderId}
        </p>
        <p className="text-[11px] text-text-muted">
          Khách quét mã này trên điện thoại để chọn món và gọi món trực tiếp vào bếp.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCopyLink}
          className="text-xs gap-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Đã chép link!' : 'Chép liên kết'}</span>
        </Button>

        <a
          href={clientUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-card-hover border border-border-subtle text-text-main hover:border-brand-primary transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-brand-primary" />
          <span>Mở xem thử</span>
        </a>
      </div>

      <div className="pt-3 border-t border-border-subtle flex flex-col gap-2">
        <Button type="button" variant="primary" onClick={onClose} className="w-full">
          Xong
        </Button>
        <button
          type="button"
          onClick={onResetSession}
          className="text-[11px] text-text-dim hover:text-brand-primary underline transition-colors cursor-pointer py-1"
        >
          Mở phiên mới cho bàn này
        </button>
      </div>
    </div>
  )
}

