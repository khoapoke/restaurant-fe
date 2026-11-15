import { useState } from 'react'
import { Eye, AlertTriangle, ShoppingBag, Check, Loader2 } from 'lucide-react'
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'
import { useCart } from '../../../../contexts/CartContext'
import { useAuth } from '../../../../contexts/AuthContext'

/**
 * Thẻ Món Ăn Chuẩn Design System (DishCard)
 * - Tỉ lệ ảnh 4:3, Lazy Loading, Fallback an toàn
 * - Giá tiền font-mono vàng Amber, Badge dị ứng & Tình trạng hết món
 * - Tích hợp Thêm nhanh vào giỏ hàng và Xem chi tiết (Chuyển trang)
 * - Độ dài < 135 dòng
 */
export default function DishCard({ dish, onSelect }) {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const isAvailable = dish.isAvailable !== false
  const priceNumber = Number(dish.price || 0)
  const resolvedImg = resolveDishImage(dish.imageUrl, dish)

  const handleQuickAdd = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm món vào giỏ hàng!')
      return
    }
    setIsAdding(true)
    try {
      await addToCart({ dishId: dish.dishId || dish.id, quantity: 1 })
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể thêm món vào giỏ.')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div
      onClick={() => onSelect && onSelect(dish.dishId || dish.id)}
      className={`group flex flex-col justify-between rounded-2xl bg-surface-card border border-border-subtle transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-md ${
        isAvailable
          ? 'hover:border-border-strong hover:-translate-y-0.5'
          : 'opacity-70 grayscale-[20%]'
      }`}
    >
      <div>
        {/* Khung Ảnh Tỉ lệ 4:3 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-bg">
          <img
            src={resolvedImg}
            alt={dish.dishName}
            loading="lazy"
            decoding="async"
            onError={(e) => handleImageError(e, resolveDishImage(null, dish))}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isAvailable ? 'group-hover:scale-105' : 'grayscale'
            }`}
          />

          {/* Badge danh mục */}
          {dish.categoryName && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface-bg/85 text-brand-primary backdrop-blur-md border border-border-subtle">
              {dish.categoryName}
            </span>
          )}

          {/* Trạng thái tạm hết món */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-error/20 text-status-error border border-status-error/30">
                Tạm hết món
              </span>
            </div>
          )}

          {/* Overlay hover nút xem chi tiết */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-bg/90 text-text-main text-xs font-semibold backdrop-blur-sm border border-border-subtle shadow-md">
              <Eye className="w-3.5 h-3.5 text-brand-primary" />
              Xem chi tiết
            </span>
          </div>
        </div>

        {/* Nội dung thông tin món */}
        <div className="p-4 space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-text-main group-hover:text-brand-primary transition-colors line-clamp-1">
            {dish.dishName}
          </h3>

          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed min-h-[2rem]">
            {dish.description || 'Tuyệt phẩm ẩm thực tuyển chọn từ nguyên liệu thượng hạng.'}
          </p>

          {/* Cảnh báo dị ứng nếu có */}
          {dish.allergens && dish.allergens.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              <span className="text-[10px] text-brand-primary flex items-center gap-0.5 font-medium">
                <AlertTriangle className="w-2.5 h-2.5" /> Chứa:
              </span>
              {dish.allergens.map((alg) => (
                <span
                  key={alg}
                  className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-status-error/10 text-status-error border border-status-error/20"
                >
                  {alg}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer thẻ: Giá & Nút thêm nhanh */}
      <div className="p-4 pt-0 mt-1 border-t border-border-subtle flex items-center justify-between">
        <div>
          <span className="text-[10px] text-text-dim block">Giá niêm yết</span>
          <span className="text-sm sm:text-base font-bold text-brand-primary font-mono">
            {priceNumber.toLocaleString('vi-VN')} đ
          </span>
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={!isAvailable || isAdding}
          title="Thêm nhanh vào giỏ"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
            justAdded
              ? 'bg-status-success text-surface-bg'
              : 'bg-surface-bg hover:bg-brand-primary hover:text-surface-bg border border-border-subtle text-text-body'
          }`}
        >
          {isAdding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : justAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Đã thêm</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Thêm</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
