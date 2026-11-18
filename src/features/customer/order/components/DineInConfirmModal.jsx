import { UtensilsCrossed, X, Loader2, Send, AlertCircle } from 'lucide-react'

/**
 * Modal Xác Nhận Gửi Món Vào Bếp (DineInConfirmModal)
 * - Tóm tắt danh sách món, số lượng, ghi chú riêng và tổng tiền của đợt gọi
 * - Tránh việc khách vô tình bấm nhầm khi đang thao tác trên di động
 */
export default function DineInConfirmModal({
  isOpen,
  onClose,
  items = [],
  tableName = '',
  onConfirm,
  submitting = false,
}) {
  if (!isOpen) return null

  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.dish?.price || item.unitPrice || 0) * item.quantity),
    0
  )

  const formatVND = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-surface-card border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-elevated">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-base font-bold text-text-main">
                Xác nhận gọi món
              </h3>
              <p className="text-xs text-text-muted">
                {tableName ? `${tableName} • ` : ''}Đợt gọi gồm {items.length} món
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card-hover transition-colors disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Danh sách món */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 divide-y divide-border-subtle">
          {items.map((item) => {
            const price = Number(item.dish?.price || item.unitPrice || 0)
            const subtotal = price * item.quantity
            return (
              <div key={item.dishId} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-primary text-sm min-w-5">
                      {item.quantity}x
                    </span>
                    <h4 className="text-sm font-semibold text-text-main truncate">
                      {item.dish?.dishName || item.dish?.name || item.dishName}
                    </h4>
                  </div>
                  {item.note && (
                    <p className="mt-1 text-xs text-brand-hover bg-brand-primary/10 border border-brand-primary/20 rounded-md px-2 py-0.5 inline-block">
                      📝 {item.note}
                    </p>
                  )}
                  <p className="text-xs text-text-dim mt-0.5">
                    Đơn giá: {formatVND(price)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-text-main font-mono">
                    {formatVND(subtotal)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Notice & Total */}
        <div className="px-5 py-3 bg-surface-elevated border-t border-border-subtle space-y-2">
          <div className="flex items-center gap-2 text-xs text-status-warning bg-status-warning/10 border border-status-warning/20 rounded-lg p-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Món sau khi gửi sẽ được chuyển thẳng đến bếp để đầu bếp chế biến.</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-medium text-text-muted">Tổng tạm tính đợt này:</span>
            <span className="text-lg font-bold text-brand-primary font-mono">
              {formatVND(totalAmount)}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-border-subtle bg-surface-card">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-card-hover text-text-main text-sm font-medium transition-colors disabled:opacity-50"
          >
            Chọn thêm
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting || items.length === 0}
            className="flex-1 py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-hover text-surface-bg text-sm font-bold shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang gửi bếp...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi vào bếp ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

