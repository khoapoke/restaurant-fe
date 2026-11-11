import { Eye, AlertTriangle } from 'lucide-react'
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'

export const DishCard = ({ dish, onSelect }) => {
  const isAvailable = dish.isAvailable !== false
  const priceNumber = Number(dish.price || 0)
  const resolvedImg = resolveDishImage(dish.imageUrl, dish)

  return (
    <div
      onClick={() => onSelect(dish.dishId)}
      className={`group flex flex-col justify-between rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden
        ${
          isAvailable
            ? 'bg-gray-900/60 border-gray-800/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5'
            : 'bg-gray-950/60 border-gray-800/40 opacity-70'
        }
      `}
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-950">
          <img
            src={resolvedImg}
            alt={dish.dishName}
            onError={(e) => handleImageError(e, resolveDishImage(null, dish))}
            className={`w-full h-full object-cover transition-transform duration-300
              ${isAvailable ? 'group-hover:scale-105' : 'grayscale'}
            `}
          />

          {/* Badge danh mục */}
          {dish.categoryName && (
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-950/80 text-gray-200 backdrop-blur-md border border-gray-800">
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-gray-950 text-xs font-bold shadow-lg shadow-black/40">
              <Eye className="w-3.5 h-3.5" />
              Xem chi tiết
            </span>
          </div>
        </div>

        {/* Nội dung text */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-gray-100 group-hover:text-amber-400 transition-colors line-clamp-1">
              {dish.dishName}
            </h3>
          </div>

          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed min-h-[2rem]">
            {dish.description || 'Hương vị hảo hạng được chế biến từ những nguyên liệu tươi ngon nhất.'}
          </p>

          {/* Nhãn cảnh báo dị ứng */}
          {dish.allergens && dish.allergens.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[10px] text-amber-400/90 flex items-center gap-0.5">
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
      <div className="p-4 pt-0 mt-2 border-t border-gray-800/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-500 block">Giá niêm yết</span>
          <span className="text-base font-bold text-amber-400 font-mono">
            {priceNumber.toLocaleString('vi-VN')} đ
          </span>
        </div>

        <button
          type="button"
          disabled={!isAvailable}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer
            ${
              isAvailable
                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-gray-950 border border-amber-500/30'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isAvailable ? 'Chọn món' : 'Hết hàng'}
        </button>
      </div>
    </div>
  )
}

export default DishCard
