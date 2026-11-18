import { useState, useMemo } from 'react'
import { Search, X, Plus, Minus, Send, ClipboardList, UtensilsCrossed } from 'lucide-react'
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'

/**
 * Màn hình Chọn Món Tại Bàn (DineInMenuSelector)
 * - Tối ưu di động: Lọc danh mục, tìm kiếm nhanh, thêm/bớt số lượng, ghi chú món lẻ
 * - Thanh Sticky Bottom Bar hiển thị đợt gọi món tạm thời
 * - Độ dài < 250 dòng
 */
export default function DineInMenuSelector({
  dishes = [],
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  selectedTray = {},
  onUpdateQuantity,
  onUpdateNote,
  onReviewTray,
  onSwitchToTracker,
  existingItemsCount = 0,
}) {
  const [keyword, setKeyword] = useState('')
  const [noteOpenId, setNoteOpenId] = useState(null)

  const dishList = Array.isArray(dishes) ? dishes : (dishes?.items || dishes?.data || [])
  const categoryList = Array.isArray(categories) ? categories : (categories?.items || categories?.data || [])

  // Lọc món theo danh mục và từ khóa
  const filteredDishes = useMemo(() => {
    return dishList.filter((dish) => {
      const matchCat =
        !selectedCategoryId ||
        dish.categoryId === selectedCategoryId ||
        dish.category?.id === selectedCategoryId ||
        dish.ma_danh_muc === selectedCategoryId
      const matchKw =
        !keyword.trim() ||
        (dish.dishName || dish.name || dish.ten_mon_an || '')
          .toLowerCase()
          .includes(keyword.trim().toLowerCase())
      return matchCat && matchKw
    })
  }, [dishList, selectedCategoryId, keyword])

  const trayList = Object.values(selectedTray).filter((item) => item.quantity > 0)
  const trayCount = trayList.reduce((sum, item) => sum + item.quantity, 0)
  const trayTotal = trayList.reduce(
    (sum, item) => sum + (Number(item.dish?.price || item.dish?.don_gia || 0) * item.quantity),
    0
  )

  const formatVND = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)

  return (
    <div className="space-y-4 pb-28">
      {/* Search & Categories Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm món ăn, đồ uống..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-text-main text-xs placeholder:text-text-dim focus:outline-none focus:border-brand-primary transition-colors"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills (Horizontal scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
              !selectedCategoryId
                ? 'bg-brand-primary text-surface-bg'
                : 'bg-surface-card text-text-muted hover:text-text-main border border-border-subtle'
            }`}
          >
            Tất cả món ({dishList.length})
          </button>
          {categoryList.map((cat) => {
            const catId = cat.categoryId || cat.id || cat.ma_danh_muc
            const isSelected = selectedCategoryId === catId
            return (
              <button
                key={catId}
                type="button"
                onClick={() => onSelectCategory(catId)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-brand-primary text-surface-bg'
                    : 'bg-surface-card text-text-muted hover:text-text-main border border-border-subtle'
                }`}
              >
                {cat.categoryName || cat.name || cat.ten_danh_muc}
              </button>
            )
          })}
        </div>
      </div>

      {/* Dish List Grid */}
      {filteredDishes.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-surface-card border border-border-subtle space-y-2">
          <UtensilsCrossed className="w-8 h-8 text-text-muted mx-auto" />
          <p className="text-xs text-text-muted">Không tìm thấy món ăn phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDishes.map((dish) => {
            const dishId = dish.dishId || dish.id || dish.ma_mon_an
            const trayItem = selectedTray[dishId]
            const quantity = trayItem?.quantity || 0
            const price = Number(dish.price || dish.don_gia || 0)
            const resolvedImg = resolveDishImage(dish.imageUrl || dish.hinh_anh, dish)

            return (
              <div
                key={dishId}
                className="p-3.5 rounded-2xl bg-surface-card border border-border-subtle hover:border-border-strong transition-all flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="flex gap-3">
                  <img
                    src={resolvedImg}
                    alt={dish.dishName || dish.name}
                    onError={handleImageError}
                    className="w-20 h-20 rounded-xl object-cover bg-surface-elevated shrink-0 border border-border-subtle"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-text-main truncate">
                      {dish.dishName || dish.name || dish.ten_mon_an}
                    </h4>
                    <p className="text-xs text-text-dim truncate">
                      {dish.categoryName || dish.category?.name || 'Món ngon'}
                    </p>
                    <div className="text-sm font-bold text-brand-primary font-mono mt-1">
                      {formatVND(price)}
                    </div>
                  </div>
                </div>

                {/* Note input if quantity > 0 */}
                {quantity > 0 && (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={trayItem?.note || ''}
                      onChange={(e) => onUpdateNote(dishId, e.target.value)}
                      placeholder="Ghi chú (VD: Không cay, ít đá...)"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle text-text-main text-xs placeholder:text-text-dim focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                )}

                {/* Bottom Card Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
                  <span className="text-xs text-text-dim">
                    {quantity > 0 ? `Đã chọn: ${quantity}` : 'Chưa chọn'}
                  </span>
                  <div className="flex items-center gap-1.5 bg-surface-elevated p-1 rounded-xl border border-border-subtle">
                    {quantity > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(dish, -1)}
                          className="w-7 h-7 rounded-lg bg-surface-card hover:bg-surface-card-hover flex items-center justify-center text-text-main transition-colors"
                          aria-label="Giảm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-mono text-brand-primary">
                          {quantity}
                        </span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(dish, 1)}
                      className="w-7 h-7 rounded-lg bg-brand-primary hover:bg-brand-hover text-surface-bg flex items-center justify-center transition-colors shadow-sm"
                      aria-label="Tăng"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Sticky Bottom Tray Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-surface-card/95 backdrop-blur-md border-t border-border-subtle shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-text-muted flex items-center gap-2">
              <span>Đang chọn {trayCount} món</span>
              {existingItemsCount > 0 && (
                <button
                  type="button"
                  onClick={onSwitchToTracker}
                  className="text-brand-hover hover:underline font-semibold flex items-center gap-1"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  ({existingItemsCount} món đang phục vụ)
                </button>
              )}
            </div>
            <div className="text-base sm:text-lg font-extrabold text-brand-primary font-mono">
              {formatVND(trayTotal)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReviewTray}
              disabled={trayCount === 0}
              className="py-2.5 px-5 rounded-xl bg-brand-primary hover:bg-brand-hover text-surface-bg text-xs sm:text-sm font-bold shadow-lg shadow-brand-primary/20 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Gửi vào Bếp ({trayCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

