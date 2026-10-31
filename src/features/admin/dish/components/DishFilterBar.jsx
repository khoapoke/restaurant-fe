import { Search, Plus, RefreshCw, Filter } from 'lucide-react'
import Button from '../../../../components/ui/Button'

export const DishFilterBar = ({
  keyword,
  onKeywordChange,
  categoryId,
  onCategoryChange,
  isAvailable,
  onAvailabilityChange,
  categories = [],
  onOpenCreate,
  onRefresh,
  loading,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên món ăn..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-950 border border-gray-800 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            isLoading={loading}
            onClick={onRefresh}
            title="Làm mới danh sách"
          >
            Làm mới
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onOpenCreate}
          >
            Thêm món mới
          </Button>
        </div>
      </div>

      {/* Filter selectors row */}
      <div className="flex items-center gap-2.5 flex-wrap pt-1 border-t border-gray-800/60 text-xs">
        <span className="text-gray-500 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-amber-500" />
          <span>Lọc:</span>
        </span>

        {/* Category selector */}
        <select
          value={categoryId || ''}
          onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : '')}
          className="bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => {
            const id = c.categoryId || c.ma_danh_muc
            const name = c.categoryName || c.ten_danh_muc
            return (
              <option key={id} value={id}>
                {name}
              </option>
            )
          })}
        </select>

        {/* Availability selector */}
        <select
          value={isAvailable}
          onChange={(e) => onAvailabilityChange(e.target.value)}
          className="bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="AVAILABLE">Đang còn bán</option>
          <option value="UNAVAILABLE">Tạm hết hàng</option>
        </select>
      </div>
    </div>
  )
}

export default DishFilterBar

