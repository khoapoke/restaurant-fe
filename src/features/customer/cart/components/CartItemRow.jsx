import { Trash2, Loader2, AlertCircle } from 'lucide-react'
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'

/**
 * Hàng Món Ăn Trong Giỏ (CartItemRow)
 * - Đồng bộ Centralized Design Tokens
 * - Tối ưu disable nút khi isUpdating
 * - Báo động đỏ khi isAvailable === false
 * - Độ dài < 125 dòng
 */
export default function CartItemRow({
  item,
  onUpdateQuantity,
  onRequestDelete,
  isUpdating = false,
}) {
  const isAvailable = item.isAvailable !== false
  const unitPrice = Number(item.unitPrice || 0)
  const subTotal = Number(item.subTotal || unitPrice * (item.quantity || 1))

  const handleMinus = () => {
    if (item.quantity <= 1) {
      onRequestDelete(item)
    } else {
      onUpdateQuantity(item.dishId, item.quantity - 1)
    }
  }

  const handlePlus = () => {
    onUpdateQuantity(item.dishId, item.quantity + 1)
  }

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isAvailable
          ? 'bg-surface-card border-border-subtle hover:border-border-strong'
          : 'bg-status-danger/10 border-status-danger/30'
      }`}
    >
      {/* Cột trái: Ảnh & Tên món */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-surface-bg shrink-0 border border-border-subtle">
          <img
            src={resolveDishImage(item.imageUrl, item)}
            alt={item.dishName}
            onError={(e) => handleImageError(e, resolveDishImage(null, item))}
            className={`w-full h-full object-cover ${!isAvailable ? 'grayscale opacity-60' : ''}`}
          />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <h4 className="text-sm sm:text-base font-bold text-text-main truncate">
            {item.dishName}
          </h4>

          <p className="text-xs text-brand-primary font-mono font-medium">
            {unitPrice.toLocaleString('vi-VN')} đ / phần
          </p>

          {!isAvailable && (
            <p className="text-xs text-status-danger flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Món này tạm hết hàng, vui lòng xóa khỏi giỏ</span>
            </p>
          )}
        </div>
      </div>

      {/* Cột phải: Bộ tăng giảm số lượng & Thành tiền & Xóa */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
        {/* Bộ tăng giảm số lượng */}
        <div className="flex items-center border border-border-subtle rounded-xl overflow-hidden bg-surface-bg">
          <button
            type="button"
            onClick={handleMinus}
            disabled={isUpdating}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="Giảm số lượng"
          >
            -
          </button>

          <span className="w-9 text-center text-xs font-bold text-text-main font-mono flex items-center justify-center">
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
            ) : (
              item.quantity
            )}
          </span>

          <button
            type="button"
            onClick={handlePlus}
            disabled={!isAvailable || isUpdating}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>

        {/* Thành tiền */}
        <div className="text-right min-w-[5.5rem]">
          <span className="text-[10px] text-text-muted block sm:hidden">Thành tiền</span>
          <span className="text-sm sm:text-base font-bold text-text-main font-mono">
            {subTotal.toLocaleString('vi-VN')} đ
          </span>
        </div>

        {/* Nút xóa */}
        <button
          type="button"
          onClick={() => onRequestDelete(item)}
          disabled={isUpdating}
          className="p-2 text-text-muted hover:text-status-danger hover:bg-status-danger/10 rounded-xl transition-colors cursor-pointer"
          title="Xóa món này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
