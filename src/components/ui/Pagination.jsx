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
  itemLabel = 'món',
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

  const navButton = 'grid h-10 w-10 place-items-center border border-[var(--moc-line)] bg-[#fffdf8] text-[#211b18] hover:border-[#6f1d32]/50 hover:text-[#6f1d32] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer'

  return (
    <nav
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 text-sm text-[#625a55] select-none ${className}`}
      aria-label="Phân trang"
    >
      <div>
        {totalItems > 0 && (
          <span>
            Trang <strong className="text-[#211b18]">{currentPage}</strong> / <strong className="text-[#211b18]">{lastPage}</strong>
            {' '}· Tổng cộng <strong className="text-[#6f1d32]">{totalItems}</strong> {itemLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button type="button" disabled={disabled || currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} className={navButton} aria-label="Trang trước">
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return <span key={`dots-${idx}`} className="px-2 py-1 text-[#625a55]">…</span>
          }

          const isActive = page === currentPage
          return (
            <button
              key={page}
              type="button"
              disabled={disabled}
              onClick={() => onPageChange(page)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-w-10 h-10 px-2 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isActive
                  ? 'moc-inverse bg-[#6f1d32] text-white border border-[#6f1d32]'
                  : 'border border-[var(--moc-line)] bg-[#fffdf8] text-[#211b18] hover:border-[#6f1d32]/50 hover:text-[#6f1d32]'
              }`}
            >
              {page}
            </button>
          )
        })}

        <button type="button" disabled={disabled || currentPage >= lastPage} onClick={() => onPageChange(currentPage + 1)} className={navButton} aria-label="Trang tiếp theo">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}

export default Pagination
