import {
  Star,
  CheckCircle2,
  Eye,
  EyeOff,
  Trash2,
  MessageSquareReply,
  CornerDownRight,
  Utensils,
  ShieldAlert,
} from 'lucide-react'
import Button from '../../../../components/ui/Button'
import { MODERATION_SEVERITY_CONFIG, MODERATION_CATEGORY_CONFIG } from '../constants'

/**
 * Danh Sách Quản Trị Đánh Giá Món Ăn (AdminReviewTable)
 * - Hiển thị chi tiết đánh giá, trạng thái VISIBLE/HIDDEN, hộp kiểm duyệt RULE_ENGINE & adminReply
 * - Thao tác: Phản hồi (REV-07), Ẩn/Hiện (REV-08), Xóa vĩnh viễn (REV-09)
 * - 100% Centralized Design Tokens, < 225 dòng
 */
export default function AdminReviewTable({
  reviews = [],
  onOpenReply,
  onToggleVisibility,
  onDelete,
  processingId = null,
}) {
  return (
    <div className="space-y-3">
      {reviews.map((item) => {
        const reviewId = item.reviewId || item._id || item.id
        const isVisible = (item.status || 'VISIBLE') === 'VISIBLE'
        const rating = Number(item.rating || 5)
        const tags = Array.isArray(item.tags) ? item.tags : []
        const images = Array.isArray(item.images) ? item.images : []
        const isBusy = processingId === reviewId

        const mod = item.moderation || null
        const isFlagged = Boolean(mod?.isFlagged)
        const sevKey = mod?.severity || 'NONE'
        const sevCfg = MODERATION_SEVERITY_CONFIG[sevKey] || MODERATION_SEVERITY_CONFIG.LOW
        const categories = Array.isArray(mod?.categories) ? mod.categories : []
        const matchedTerms = Array.isArray(mod?.matchedTerms) ? mod.matchedTerms : []

        return (
          <div
            key={reviewId}
            className={`p-5 rounded-2xl bg-surface-card border transition-all space-y-3 ${
              isFlagged
                ? 'border-status-error/40 shadow-sm'
                : isVisible
                ? 'border-border-subtle hover:border-border-strong'
                : 'border-status-warning/30 bg-surface-card/60 opacity-85'
            }`}
          >
            {/* Dòng 1: Thông tin khách, món ăn, trạng thái & số sao */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-text-main">
                    {item.customerName || `Khách #${item.accountId}`}
                  </span>

                  {item.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-success/10 text-status-success border border-status-success/25">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã mua hàng {item.orderId ? `(#${item.orderId})` : ''}</span>
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isVisible
                        ? 'bg-status-success/10 text-status-success border-status-success/25'
                        : 'bg-status-warning/15 text-status-warning border-status-warning/30'
                    }`}
                  >
                    {isVisible ? '● VISIBLE (Công khai)' : '● HIDDEN (Đã ẩn)'}
                  </span>

                  {isFlagged && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sevCfg.badgeClass}`}
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>Cờ vi phạm: {sevCfg.shortLabel}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1 font-semibold text-brand-primary">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>
                      {item.dishName || 'Món ăn'} (#{item.dishId})
                    </span>
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '—'}
                  </span>
                </div>
              </div>

              {/* Số sao & Nút thao tác */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-surface-bg border border-border-subtle">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rating ? 'text-brand-primary fill-brand-primary' : 'text-border-strong'
                      }`}
                    />
                  ))}
                  <span className="ml-1 font-mono text-xs font-bold text-text-main">{rating}.0</span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={MessageSquareReply}
                  onClick={() => onOpenReply(item)}
                  disabled={isBusy}
                >
                  {item.adminReply?.content ? 'Sửa phản hồi' : 'Phản hồi'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={isVisible ? EyeOff : Eye}
                  onClick={() => onToggleVisibility(reviewId, isVisible ? 'HIDDEN' : 'VISIBLE')}
                  disabled={isBusy}
                >
                  {isVisible ? 'Ẩn' : 'Hiện'}
                </Button>

                <button
                  type="button"
                  onClick={() => onDelete(reviewId)}
                  disabled={isBusy}
                  className="p-2 rounded-xl text-text-muted hover:text-status-error hover:bg-status-error/10 border border-border-subtle hover:border-status-error/30 transition-colors cursor-pointer"
                  title="Xóa vĩnh viễn đánh giá"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nội dung nhận xét */}
            <p className="text-xs sm:text-sm text-text-body leading-relaxed whitespace-pre-line">
              {item.comment}
            </p>

            {/* Hộp Báo Cáo Kiểm Duyệt Ngôn Từ Tự Động (RULE_ENGINE) */}
            {isFlagged && (
              <div className={`p-3 rounded-xl border text-xs space-y-2 ${sevCfg.boxClass}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{mod?.reason || 'Phát hiện ngôn từ không phù hợp bởi RULE_ENGINE'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {categories.map((cat) => {
                      const catCfg = MODERATION_CATEGORY_CONFIG[cat] || {
                        label: cat,
                        badgeClass: 'bg-surface-bg text-text-main border-border-subtle',
                      }
                      return (
                        <span
                          key={cat}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catCfg.badgeClass}`}
                        >
                          {catCfg.label}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {matchedTerms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-current/15">
                    <span className="text-[11px] text-text-muted font-medium">
                      Từ khóa vi phạm phát hiện:
                    </span>
                    {matchedTerms.map((term, idx) => (
                      <code
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-surface-bg border border-current/30 font-mono text-[11px] font-bold"
                      >
                        "{term}"
                      </code>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tags & Ảnh */}
            {(tags.length > 0 || images.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                  >
                    #{tag}
                  </span>
                ))}
                {images.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-status-info hover:underline"
                  >
                    [Ảnh #{idx + 1}]
                  </a>
                ))}
              </div>
            )}

            {/* Phản hồi của nhà hàng */}
            {item.adminReply?.content && (
              <div className="p-3 rounded-xl bg-surface-bg border-l-2 border-l-brand-primary border border-border-subtle text-xs space-y-1">
                <div className="flex items-center justify-between text-brand-primary font-bold">
                  <span className="inline-flex items-center gap-1.5">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Phản hồi bởi: {item.adminReply.staffName || 'Quản trị viên'}</span>
                  </span>
                  {item.adminReply.repliedAt && (
                    <span className="text-[10px] font-mono text-text-muted">
                      {new Date(item.adminReply.repliedAt).toLocaleString('vi-VN')}
                    </span>
                  )}
                </div>
                <p className="text-text-body pl-5">{item.adminReply.content}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
