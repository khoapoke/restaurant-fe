import { Eye, AlertTriangle, Plus } from 'lucide-react'
import { FALLBACK_DISH_IMAGE } from '../constants'

export const DishCard = ({ dish, onSelect }) => {
  const isAvailable = dish.isAvailable !== false
  const priceNumber = Number(dish.price || 0)

  return (
    <div
      onClick={() => onSelect(dish.dishId)}
      className={`group flex flex-col justify-between border transition-all duration-300 cursor-pointer overflow-hidden
        ${
          isAvailable
            ? 'bg-[#fffdf8] border-[var(--moc-line)] hover:border-[#6f1d32]/35 hover:shadow-[var(--moc-shadow)] hover:-translate-y-1'
            : 'bg-[#eee6dc] border-[var(--moc-line)] opacity-70'
        }
      `}
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e4ddd3]">
          <img
            src={dish.imageUrl || FALLBACK_DISH_IMAGE}
            alt={dish.dishName}
            onError={(e) => {
              e.target.src = FALLBACK_DISH_IMAGE
            }}
            className={`w-full h-full object-cover transition-transform duration-300
              ${isAvailable ? 'group-hover:scale-105' : 'grayscale'}
            `}
          />

          {/* Badge danh mục */}
          {dish.categoryName && (
            <span className="absolute top-3 left-3 px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] uppercase bg-[#fffdf8]/90 text-[#6f1d32] backdrop-blur-md">
              {dish.categoryName}
            </span>
          )}

          {/* Trạng thái còn / hết món */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                Tạm hết món
              </span>
            </div>
          )}

          {/* Nút overlay xem nhanh */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="moc-inverse inline-flex items-center gap-1.5 px-4 py-2 bg-[#6f1d32] text-white text-[10px] font-semibold tracking-[0.1em] uppercase shadow-lg shadow-black/20">
              <Eye className="w-3.5 h-3.5" />
              Xem chi tiết
            </span>
          </div>
        </div>

        {/* Nội dung text */}
        <div className="p-5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="moc-serif text-xl font-medium text-[#211b18] group-hover:text-[#6f1d32] transition-colors line-clamp-1">
              {dish.dishName}
            </h3>
          </div>

          <p className="text-xs text-[#766e68] line-clamp-2 leading-relaxed min-h-[2.4rem]">
            {dish.description || 'Hương vị hảo hạng được chế biến từ những nguyên liệu tươi ngon nhất.'}
          </p>

          {/* Nhãn cảnh báo dị ứng */}
          {dish.allergens && dish.allergens.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[10px] text-[#6f1d32] flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> Chứa:
              </span>
              {dish.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-500/10 text-red-300 border border-red-500/20"
                >
                  {allergen}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Giá & Nút */}
      <div className="mx-5 py-4 mt-1 border-t border-[var(--moc-line)] flex items-center justify-between">
        <div>
          <span className="text-[9px] tracking-[0.08em] uppercase text-[#766e68] block">Giá niêm yết</span>
          <span className="moc-serif text-lg font-semibold text-[#6f1d32]">
            {priceNumber.toLocaleString('vi-VN')} đ
          </span>
        </div>

        <button
          type="button"
          disabled={!isAvailable}
          className={`w-9 h-9 grid place-items-center rounded-full border transition-all cursor-pointer
            ${
              isAvailable
                ? 'bg-transparent text-[#6f1d32] hover:bg-[#6f1d32] hover:text-white border-[#6f1d32]'
                : 'bg-[#e4ddd3] text-[#9d938d] border-[var(--moc-line)] cursor-not-allowed'
            }
          `}
          aria-label={isAvailable ? `Chọn ${dish.dishName}` : `${dish.dishName} đã hết`}
        >
          {isAvailable ? <Plus className="w-4 h-4" /> : <span className="text-[9px]">Hết</span>}
        </button>
      </div>
    </div>
  )
}

export default DishCard
