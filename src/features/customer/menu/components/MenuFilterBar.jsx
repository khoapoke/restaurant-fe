import { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import MenuFilterPanel from './MenuFilterPanel'

/**
 * Component Thanh Lọc & Danh Mục Thực Đơn (MenuFilterBar)
 * Chuẩn mực Design System:
 * - Tìm kiếm tức thì, Cuộn ngang danh mục món ăn
 * - Nút toggle Bảng lọc nâng cao (MenuFilterPanel)
 * - Độ dài < 140 dòng
 */
export default function MenuFilterBar({
  categories = [],
  selectedCategoryId = null,
  onSelectCategory,
  keyword = '',
  onKeywordChange,
  filters = {},
  onApplyFilters,
  onResetFilters,
  disabled = false,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || '')
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || '')
  const [localIsAvailable, setLocalIsAvailable] = useState(!!filters.isAvailable)
  const [localAllergens, setLocalAllergens] = useState(
    filters.excludeAllergens ? filters.excludeAllergens.split(',') : []
  )

  const handleApply = (e) => {
    e?.preventDefault()
    const min = localMinPrice !== '' ? Number(localMinPrice) : undefined
    const max = localMaxPrice !== '' ? Number(localMaxPrice) : undefined
    onApplyFilters({
      minPrice: min,
      maxPrice: max,
      isAvailable: localIsAvailable ? true : undefined,
      excludeAllergens: localAllergens.length > 0 ? localAllergens.join(',') : undefined,
    })
    setShowAdvanced(false)
  }

  const handleReset = () => {
    setLocalMinPrice('')
    setLocalMaxPrice('')
    setLocalIsAvailable(false)
    setLocalAllergens([])
    onResetFilters()
    setShowAdvanced(false)
  }

  const toggleAllergen = (val) => {
    setLocalAllergens((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    )
  }

  const activeFilterCount =
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0) +
    (filters.isAvailable ? 1 : 0) +
    (filters.excludeAllergens ? 1 : 0)

  return (
    <div className="space-y-4 mb-8">
      {/* Hàng 1: Ô tìm kiếm & Nút mở lọc nâng cao */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Tìm kiếm món ăn tinh hoa (Wagyu, Gan ngỗng, Cua hoàng đế...)"
            disabled={disabled}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-xs sm:text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => onKeywordChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer shrink-0 ${
            showAdvanced || activeFilterCount > 0
              ? 'bg-surface-card text-brand-primary border-brand-primary'
              : 'bg-surface-card text-text-muted hover:text-text-main border-border-subtle hover:border-border-strong'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Bộ lọc nâng cao</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-primary text-surface-bg text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Hàng 2: Thanh cuộn danh mục ngang */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategoryId === null
              ? 'bg-brand-primary text-surface-bg shadow-sm'
              : 'bg-surface-card text-text-muted hover:text-text-main border border-border-subtle hover:border-border-strong'
          }`}
        >
          Tất cả thực đơn
        </button>

        {categories.map((cat) => {
          const id = cat.categoryId || cat.id
          const active = selectedCategoryId === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectCategory(id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                active
                  ? 'bg-brand-primary text-surface-bg font-semibold shadow-sm'
                  : 'bg-surface-card text-text-muted hover:text-text-main border border-border-subtle hover:border-border-strong'
              }`}
            >
              {cat.categoryName || cat.name}
            </button>
          )
        })}
      </div>

      {/* Hàng 3: Bảng điều khiển bộ lọc nâng cao */}
      {showAdvanced && (
        <MenuFilterPanel
          localMinPrice={localMinPrice}
          setLocalMinPrice={setLocalMinPrice}
          localMaxPrice={localMaxPrice}
          setLocalMaxPrice={setLocalMaxPrice}
          localIsAvailable={localIsAvailable}
          setLocalIsAvailable={setLocalIsAvailable}
          localAllergens={localAllergens}
          toggleAllergen={toggleAllergen}
          handleReset={handleReset}
          handleApply={handleApply}
        />
      )}
    </div>
  )
}
