import { useState } from 'react'
import { Search, X, SlidersHorizontal, Check } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import { ALLERGENS } from '../../profile/constants'

export const MenuFilterBar = ({
  categories = [],
  selectedCategoryId = null,
  onSelectCategory,
  keyword = '',
  onKeywordChange,
  filters,
  onApplyFilters,
  onResetFilters,
  disabled = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || '')
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || '')
  const [localIsAvailable, setLocalIsAvailable] = useState(
    filters.isAvailable !== undefined ? filters.isAvailable : false
  )
  const [localExcludeAllergens, setLocalExcludeAllergens] = useState(
    filters.excludeAllergens ? filters.excludeAllergens.split(',') : []
  )
  const [priceError, setPriceError] = useState('')

  const handleApply = (e) => {
    e?.preventDefault()
    setPriceError('')

    const min = localMinPrice !== '' ? Number(localMinPrice) : undefined
    const max = localMaxPrice !== '' ? Number(localMaxPrice) : undefined

    if (min !== undefined && max !== undefined && min > max) {
      setPriceError('Giá tối thiểu không được lớn hơn giá tối đa')
      return
    }

    onApplyFilters({
      minPrice: min,
      maxPrice: max,
      isAvailable: localIsAvailable ? true : undefined,
      excludeAllergens:
        localExcludeAllergens.length > 0
          ? localExcludeAllergens.join(',')
          : undefined,
    })
    setShowAdvanced(false)
  }

  const handleReset = () => {
    setLocalMinPrice('')
    setLocalMaxPrice('')
    setLocalIsAvailable(false)
    setLocalExcludeAllergens([])
    setPriceError('')
    onResetFilters()
    setShowAdvanced(false)
  }

  const toggleAllergen = (val) => {
    setLocalExcludeAllergens((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    )
  }

  const hasActiveAdvancedFilter =
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.isAvailable !== undefined ||
    (filters.excludeAllergens && filters.excludeAllergens.length > 0)

  return (
    <div className="space-y-4">
      {/* Hàng 1: Search Box & Nút Lọc nâng cao */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Tìm kiếm theo tên món ăn (ví dụ: Bò sốt tiêu, Súp bào ngư...)"
            disabled={disabled}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => onKeywordChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Nút Bộ lọc nâng cao */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none shrink-0 w-full sm:w-auto justify-center
            ${
              hasActiveAdvancedFilter || showAdvanced
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Bộ lọc nâng cao</span>
          {hasActiveAdvancedFilter && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Hàng 2: Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none shrink-0
            ${
              selectedCategoryId === null
                ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
            }`}
        >
          Tất cả thực đơn
        </button>

        {categories.map((cat) => (
          <button
            key={cat.categoryId}
            type="button"
            onClick={() => onSelectCategory(cat.categoryId)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none shrink-0
              ${
                selectedCategoryId === cat.categoryId
                  ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
              }`}
          >
            {cat.categoryName}
          </button>
        ))}
      </div>

      {/* Hộp Bộ lọc nâng cao (Collapsible) */}
      {showAdvanced && (
        <div className="p-5 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
              Tùy chỉnh lọc món ăn
            </h4>
            {hasActiveAdvancedFilter && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-amber-400 hover:underline"
              >
                Đặt lại mặc định
              </button>
            )}
          </div>

          {/* Lọc khoảng giá */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-300">Khoảng giá (VNĐ)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                placeholder="Tối thiểu (vd: 50000)"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
              />
              <input
                type="number"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                placeholder="Tối đa (vd: 500000)"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
              />
            </div>
            {priceError && <p className="text-xs text-red-400">{priceError}</p>}
          </div>

          {/* Trạng thái còn món */}
          <div>
            <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={localIsAvailable}
                onChange={(e) => setLocalIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-950 text-amber-500 focus:ring-amber-500/20 accent-amber-500"
              />
              <span>Chỉ hiển thị các món đang sẵn sàng phục vụ (còn hàng)</span>
            </label>
          </div>

          {/* Loại trừ dị ứng */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <label className="text-xs font-medium text-gray-300">
              Loại trừ các món có chứa thành phần dị ứng:
            </label>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((item) => {
                const isSelected = localExcludeAllergens.includes(item.value)
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => toggleAllergen(item.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer
                      ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
            <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(false)}>
              Đóng
            </Button>
            <Button variant="primary" size="sm" onClick={handleApply}>
              Áp dụng bộ lọc
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuFilterBar
