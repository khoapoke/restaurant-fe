import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Base Pagination component
 * Hỗ trợ chuyển trang linh hoạt theo chuẩn phân trang Laravel (1-indexed)
 */
export const Pagination = ({
  currentPage = 1,
  lastPage = 1,
  totalItems = 0,
  onPageChange,
  disabled = false,
  className = '',
}) => {
  if (lastPage <= 1) return null

  // Tạo dải số trang hiển thị
  const getPageNumbers = () => {
    const pages = []
    const delta = 1 // Số trang lân cận hiện hành

    for (let i = 1; i <= lastPage; i++) {
      if (
        i === 1 ||
        i === lastPage ||
        (i >= currentPage - delta && i <= currentPage + delta)
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
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 text-xs text-gray-400 select-none ${className}`}
    >
      <div>
        {totalItems > 0 && (
          <span>
            Trang <strong className="text-gray-200">{currentPage}</strong> /{' '}
            <strong className="text-gray-200">{lastPage}</strong> (Tổng cộng{' '}
            <strong className="text-amber-400">{totalItems}</strong> món)
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Nút Trước */}
        <button
          type="button"
          disabled={disabled || currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 rounded-xl border border-gray-800 bg-gray-900 text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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

          const isActive = page === currentPage
          return (
            <button
              key={page}
              type="button"
              disabled={disabled}
              onClick={() => onPageChange(page)}
              className={`min-w-9 h-9 px-2 rounded-xl font-medium text-xs transition-all cursor-pointer
                ${
                  isActive
                    ? 'bg-amber-500 text-gray-950 font-bold shadow-md shadow-amber-500/20'
                    : 'border border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700 hover:text-white'
                }
                ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              {page}
            </button>
          )
        })}

        {/* Nút Sau */}
        <button
          type="button"
          disabled={disabled || currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 rounded-xl border border-gray-800 bg-gray-900 text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Trang tiếp theo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
