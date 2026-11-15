import { Plus, Minus, ShoppingBag, CheckCircle2, AlertTriangle } from 'lucide-react'
import Alert from '../../../../components/ui/Alert'

/**
 * Sub-component Khối Thao Tác Món Ăn (DishActionSection)
 * - Hiển thị giá tiền, mô tả, cảnh báo dị ứng
 * - Bộ chọn số lượng (+/-) và Nút thêm vào giỏ hàng
 * - Độ dài < 130 dòng
 */
export default function DishActionSection({
  dish,
  priceNumber,
  isAvailable,
  quantity,
  setQuantity,
  handleAddToCart,
  isAdding,
  addedNotice,
  addError,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-main">
          {dish.dishName}
        </h1>
        <p className="text-2xl sm:text-3xl font-bold text-brand-primary font-mono mt-3">
          {priceNumber.toLocaleString('vi-VN')} đ
        </p>
      </div>

      <p className="text-sm sm:text-base text-text-muted leading-relaxed">
        {dish.description || 'Tuyệt tác ẩm thực được tuyển chọn từ nguyên liệu tươi sống thượng hạng trong ngày.'}
      </p>

      {/* Cảnh báo dị ứng nếu có */}
      {dish.allergens && dish.allergens.length > 0 && (
        <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-text-main">Lưu ý thành phần dị ứng:</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {dish.allergens.map((alg) => (
                <span
                  key={alg}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-status-error/10 text-status-error border border-status-error/20"
                >
                  {alg}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bộ chọn số lượng & Nút Thêm vào giỏ hàng */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg border border-border-subtle bg-surface-card p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={!isAvailable || quantity <= 1}
              className="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-bg disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center text-sm font-bold font-mono text-text-main">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              disabled={!isAvailable}
              className="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-bg disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable || isAdding}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-brand-primary hover:bg-brand-hover active:bg-brand-active text-surface-bg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}</span>
          </button>
        </div>

        {addedNotice && (
          <div className="flex items-center gap-2 text-xs font-medium text-brand-primary">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã thêm {quantity} phần {dish.dishName} vào giỏ hàng thành công!</span>
          </div>
        )}

        {addError && <Alert variant="error" message={addError} />}
      </div>
    </div>
  )
}

