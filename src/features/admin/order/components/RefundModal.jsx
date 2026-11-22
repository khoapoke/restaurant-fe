import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { RotateCcw, Percent, User, Receipt } from 'lucide-react'

const PERCENT_PRESETS = [
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: '100% (Toàn bộ)' },
]

const QUICK_REASONS = [
  'Khách yêu cầu hủy đơn',
  'Nhà hàng hết món đột xuất',
  'Sai sót trong chế biến',
  'Hoàn tiền chênh lệch món',
]

/**
 * Modal Ghi Nhận Hoàn Tiền Theo Phần Trăm (RefundModal)
 * - Hỗ trợ chọn nhanh 25% / 50% / 75% / 100% hoặc kéo/nhập % tùy chỉnh (1% - 100%)
 * - Tự động tính số tiền thực hoàn và số tiền giữ lại theo thời gian thực
 * - 100% Centralized Design Tokens, dưới 235 dòng
 */
export const RefundModal = ({
  isOpen,
  onClose,
  onConfirm,
  payment,
  isRefunding,
}) => {
  const [percent, setPercent] = useState(100)
  const [reason, setReason] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && payment) {
      setPercent(100)
      setReason('')
      setError(null)
    }
  }, [isOpen, payment])

  if (!payment) return null

  const paymentId = payment.paymentId || payment.ma_thanh_toan
  const orderId = payment.orderId || payment.ma_don_hang
  const customerName = payment.customerName || 'Khách hàng'
  const originalAmount = Number(payment.amount || payment.so_tien || 0)

  const safePercent = Math.min(100, Math.max(1, Number(percent) || 1))
  const refundAmount = Math.round((originalAmount * safePercent) / 100)
  const retainedAmount = Math.max(0, originalAmount - refundAmount)

  const handlePercentInput = (val) => {
    if (val === '') return setPercent('')
    const num = parseInt(val, 10)
    if (!Number.isNaN(num)) setPercent(Math.min(100, Math.max(1, num)))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim() || reason.trim().length < 3) {
      return setError('Vui lòng nhập hoặc chọn lý do hoàn tiền (tối thiểu 3 ký tự)')
    }
    setError(null)
    const formattedReason = `[Hoàn ${safePercent}% - ${refundAmount.toLocaleString('vi-VN')}đ/${originalAmount.toLocaleString('vi-VN')}đ] ${reason.trim()}`
    onConfirm(paymentId, formattedReason, { refundPercent: safePercent, refundAmount, originalAmount })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ghi nhận Hoàn tiền Giao dịch #${paymentId}`} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4 py-1 font-sans text-xs">
        {/* Thông tin giao dịch gốc */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-bg border border-border-subtle">
          <div className="flex items-center gap-2 text-text-body">
            <Receipt className="w-4 h-4 text-brand-primary shrink-0" />
            <span>
              Đơn hàng: <strong className="font-mono text-brand-primary">#{orderId}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-text-muted truncate max-w-[200px]">
            <User className="w-3.5 h-3.5 text-brand-primary shrink-0" />
            <span className="truncate font-medium text-text-main">{customerName}</span>
          </div>
        </div>

        {/* Bước 1: Chọn tỷ lệ % hoàn tiền */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-text-main flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-brand-primary" />
              <span>1. Chọn tỷ lệ hoàn tiền (%)</span>
            </label>
            <span className="text-[11px] font-mono font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/30">
              Hoàn {safePercent}%
            </span>
          </div>

          {/* 4 Nút chọn nhanh */}
          <div className="grid grid-cols-4 gap-2">
            {PERCENT_PRESETS.map((item) => {
              const isActive = safePercent === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPercent(item.value)}
                  className={`py-2 px-2 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-primary text-surface-bg border-brand-primary shadow-sm'
                      : 'bg-surface-bg text-text-muted border-border-subtle hover:text-text-main hover:border-border-strong'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Thanh kéo & Ô nhập % tùy chỉnh */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-bg border border-border-subtle">
            <input
              type="range"
              min={1}
              max={100}
              value={safePercent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="flex-1 accent-brand-primary cursor-pointer h-1.5 bg-surface-card rounded-lg"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min={1}
                max={100}
                value={percent}
                onChange={(e) => handlePercentInput(e.target.value)}
                onBlur={() => setPercent(safePercent)}
                className="w-14 px-2 py-1 text-center font-mono font-bold text-xs bg-surface-card border border-border-strong rounded-lg text-text-main focus:outline-none focus:border-brand-primary"
              />
              <span className="font-mono font-bold text-text-muted">%</span>
            </div>
          </div>
        </div>

        {/* Bước 2: Bảng tính số tiền hoàn trực quan */}
        <div className="p-3.5 rounded-xl bg-surface-bg border border-border-subtle space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span>Tổng tiền gốc đã thu:</span>
            <span className="font-mono font-semibold text-text-main">
              {originalAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>

          {safePercent < 100 && (
            <div className="flex items-center justify-between text-text-muted">
              <span>Nhà hàng giữ lại ({100 - safePercent}%):</span>
              <span className="font-mono font-semibold text-text-body">
                {retainedAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
            <span className="font-bold text-text-main">
              Số tiền hoàn lại cho khách ({safePercent}%):
            </span>
            <span className="text-base font-extrabold font-mono text-brand-primary">
              {refundAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {/* Bước 3: Lý do hoàn tiền */}
        <div className="space-y-2">
          <label className="block font-semibold text-text-main">
            2. Lý do hoàn tiền <span className="text-status-error">*</span>
          </label>

          {/* Gợi ý nhanh */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_REASONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setReason(tag)
                  if (error) setError(null)
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                  reason === tag
                    ? 'bg-brand-primary/15 text-brand-primary border-brand-primary/40 font-semibold'
                    : 'bg-surface-bg text-text-muted border-border-subtle hover:text-text-main'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <textarea
            rows={2}
            placeholder="Nhập chi tiết lý do hoàn tiền..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError(null)
            }}
            className="w-full px-3 py-2 text-xs bg-surface-bg border border-border-strong rounded-xl text-text-main placeholder-text-dim focus:outline-none focus:border-brand-primary resize-none"
          />
          {error && <p className="text-[11px] text-status-error">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isRefunding}>
            Đóng
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isRefunding}
            icon={RotateCcw}
          >
            Hoàn {refundAmount.toLocaleString('vi-VN')} đ ({safePercent}%)
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default RefundModal
