import { AlertTriangle, RefreshCw, SearchX } from 'lucide-react'
import DishCard from './DishCard'
import Pagination from '../../../../components/ui/Pagination'
import Button from '../../../../components/ui/Button'
import Skeleton from '../../../../components/ui/Skeleton'

/**
 * Sub-component Lưới Món Ăn & 4 Trạng Thái UI (MenuDishGrid)
 * - Quản lý Loading, Error, Empty, Data List & Phân trang
 * - Độ dài < 120 dòng
 */
export default function MenuDishGrid({
  loading,
  fetchError,
  dishes = [],
  onRetry,
  onResetAll,
  onSelectDish,
  pagination = {},
  onPageChange,
}) {
  // 1. Loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 2. Error
  if (fetchError) {
    return (
      <div className="p-10 text-center rounded-2xl border border-status-error/30 bg-status-error/5 space-y-3 my-6">
        <AlertTriangle className="w-8 h-8 text-status-error mx-auto" />
        <h3 className="text-base font-bold text-text-main">Không thể tải thực đơn</h3>
        <p className="text-xs text-text-muted max-w-md mx-auto">{fetchError}</p>
        <Button variant="primary" size="sm" icon={RefreshCw} onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    )
  }

  // 3. Empty
  if (dishes.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-border-subtle bg-surface-card/40 space-y-4 my-8">
        <div className="w-12 h-12 rounded-xl bg-surface-bg border border-border-subtle flex items-center justify-center text-text-muted mx-auto">
          <SearchX className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-main">Không tìm thấy món ăn phù hợp</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto mt-1">
            Không có món ăn nào thỏa mãn từ khóa hoặc tiêu chí lọc hiện tại.
          </p>
        </div>
        <button
          type="button"
          onClick={onResetAll}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface-card border border-border-subtle text-text-main hover:border-border-strong transition-colors cursor-pointer"
        >
          Xóa toàn bộ bộ lọc
        </button>
      </div>
    )
  }

  // 4. Data List
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {dishes.map((dish) => (
          <DishCard
            key={dish.dishId || dish.id}
            dish={dish}
            onSelect={onSelectDish}
          />
        ))}
      </div>

      <div className="mt-10">
        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          totalItems={pagination.totalItems}
          onPageChange={onPageChange}
          disabled={loading}
        />
      </div>
    </>
  )
}

