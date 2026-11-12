import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Base Pagination component
 * Hỗ trợ chuyển trang linh hoạt theo chuẩn phân trang Laravel (1-indexed)
 * Hỗ trợ phòng thủ kép cả 2 chuẩn prop: lastPage và totalPages
 */
export const Pagination = ({
  currentPage = 1,
  lastPage = 1,
  totalPages,
  totalItems = 0,
  itemLabel = 'mục',
  onPageChange,
  disabled = false,
  className = '',
}) => {
  const maxPage = Math.max(1, Number(totalPages || lastPage || 1))
  const curPage = Math.max(1, Number(currentPage || 1))

  // Nếu không có dữ liệu nào và chỉ có 1 trang thì ẩn
  if (maxPage <= 1 && totalItems <= 0) return null

  // Tạo dải số trang hiển thị
  const getPageNumbers = () => {
    const pages = []
    const delta = 1 // Số trang lân cận hiện hành

    for (let i = 1; i <= maxPage; i++) {
      if (
        i === 1 ||
        i === maxPage ||
        (i >= curPage - delta && i <= curPage + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 py-3 text-xs text-gray-400 select-none ${className}`}
    >
      <div>
        <span>
          Trang <strong className="text-gray-200">{curPage}</strong> /{' '}
          <strong className="text-gray-200">{maxPage}</strong>
          {totalItems > 0 && (
            <span>
              {' '}• Tổng cộng <strong className="text-amber-400">{totalItems}</strong> {itemLabel}
            </span>
          )}
        </span>
      </div>

      {maxPage > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Nút Trước */}
          <button
            type="button"
            disabled={disabled || curPage <= 1}
            onClick={() => onPageChange && onPageChange(curPage - 1)}
            className="p-1.5 sm:p-2 rounded-xl border border-gray-800 bg-gray-900 text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Các số trang */}
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 py-1 text-gray-600">
                  ...
                </span>
              )
            }

            const isActive = page === curPage
            return (
              <button
                key={page}
                type="button"
                disabled={disabled}
                onClick={() => onPageChange && onPageChange(page)}
                className={`min-w-8 h-8 sm:min-w-9 sm:h-9 px-2 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-gray-950 font-bold shadow-md shadow-amber-500/20'
                    : 'border border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700 hover:text-white'
                } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                {page}
              </button>
            )
          })}

          {/* Nút Sau */}
          <button
            type="button"
            disabled={disabled || curPage >= maxPage}
            onClick={() => onPageChange && onPageChange(curPage + 1)}
            className="p-1.5 sm:p-2 rounded-xl border border-gray-800 bg-gray-900 text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Trang tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default Pagination
