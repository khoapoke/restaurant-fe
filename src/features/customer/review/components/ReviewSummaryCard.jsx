import { Star, Image as ImageIcon, PenLine, ArrowUpDown } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import { REVIEW_SORT_OPTIONS } from '../services/reviewService'

/**
 * Thẻ Tổng Quan Điểm Sao & Bộ Lọc Đánh Giá (ReviewSummaryCard)
 * - Hiển thị điểm trung bình, thanh phân bổ 1-5 sao & bộ lọc nhanh
 * - 100% Centralized Design Tokens, < 150 dòng
 */
export default function ReviewSummaryCard({
  summary = {},
  filterRating = '',
  onFilterRating,
  hasImages = false,
  onToggleHasImages,
  sort = 'newest',
  onChangeSort,
  onOpenWriteModal,
  myExistingReview = null,
}) {
  const avg = Number(summary?.averageRating || 0)
  const total = Number(summary?.totalReviews || 0)
  const breakdown = summary?.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  return (
    <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Cột trái: Điểm số trung bình lớn */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-surface-bg border border-border-subtle space-y-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-serif font-extrabold text-brand-primary font-mono">
              {avg > 0 ? avg.toFixed(1) : '0.0'}
            </span>
            <span className="text-sm text-text-muted font-mono">/ 5.0</span>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(avg)
                    ? 'text-brand-primary fill-brand-primary'
                    : 'text-border-strong'
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-text-muted">
            Dựa trên <strong className="text-text-main font-mono">{total}</strong> nhận xét thực tế
          </p>

          <div className="pt-2 w-full">
            <Button
              variant="primary"
              size="sm"
              icon={PenLine}
              onClick={onOpenWriteModal}
              className="w-full justify-center shadow-md shadow-brand-primary/15"
            >
              {myExistingReview ? 'Sửa đánh giá của bạn' : 'Viết đánh giá món này'}
            </Button>
          </div>
        </div>

        {/* Cột phải: Biểu đồ phân bổ 5 sao -> 1 sao */}
        <div className="md:col-span-8 space-y-2.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = Number(breakdown[star] || breakdown[String(star)] || 0)
            const percent = total > 0 ? Math.round((count / total) * 100) : 0
            const isSelected = Number(filterRating) === star

            return (
              <button
                key={star}
                type="button"
                onClick={() => onFilterRating(isSelected ? '' : star)}
                className={`w-full flex items-center gap-3 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-brand-primary/10 ring-1 ring-brand-primary/40'
                    : 'hover:bg-surface-bg'
                }`}
              >
                <span className="w-12 flex items-center gap-1 font-mono font-bold text-text-main shrink-0">
                  <span>{star}</span>
                  <Star className="w-3.5 h-3.5 text-brand-primary fill-brand-primary" />
                </span>

                <div className="flex-1 h-2 rounded-full bg-surface-bg border border-border-subtle overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className="w-16 text-right font-mono text-[11px] text-text-muted shrink-0">
                  {count} ({percent}%)
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Thanh bộ lọc nút bấm & sắp xếp */}
      <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onFilterRating('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !filterRating
                ? 'bg-brand-primary text-surface-bg shadow-xs'
                : 'bg-surface-bg text-text-muted hover:text-text-main border border-border-subtle'
            }`}
          >
            Tất cả ({total})
          </button>

          {[5, 4, 3, 2, 1].map((star) => {
            const active = Number(filterRating) === star
            return (
              <button
                key={star}
                type="button"
                onClick={() => onFilterRating(active ? '' : star)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-brand-primary text-surface-bg shadow-xs'
                    : 'bg-surface-bg text-text-muted hover:text-text-main border border-border-subtle'
                }`}
              >
                <span>{star}</span>
                <Star className={`w-3 h-3 ${active ? 'fill-surface-bg' : 'text-brand-primary fill-brand-primary'}`} />
              </button>
            )
          })}

          <button
            type="button"
            onClick={onToggleHasImages}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              hasImages
                ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/40'
                : 'bg-surface-bg text-text-muted hover:text-text-main border border-border-subtle'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Có hình ảnh</span>
          </button>
        </div>

        {/* Sắp xếp */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
          <select
            value={sort}
            onChange={(e) => onChangeSort(e.target.value)}
            className="px-3 py-1.5 text-xs bg-surface-bg border border-border-subtle rounded-xl text-text-main focus:outline-none focus:border-brand-primary cursor-pointer"
          >
            {REVIEW_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
