import { Link } from 'react-router-dom'
import { Star, CheckCircle2, Edit3, Trash2, CornerDownRight, Utensils, ShieldCheck, ShieldAlert } from 'lucide-react'

/**
 * Thẻ Hiển Thị Một Đánh Giá Món Ăn (ReviewItemCard)
 * - Hiển thị huy hiệu Đã mua hàng (isVerifiedPurchase), tags, ảnh và phản hồi từ nhà hàng (adminReply)
 * - Hỗ trợ nút Sửa / Xóa cho chủ sở hữu đánh giá
 * - 100% Centralized Design Tokens, < 170 dòng
 */
export default function ReviewItemCard({
  review,
  isOwner = false,
  showDishLink = false,
  onEdit,
  onDelete,
}) {
  if (!review) return null

  const reviewId = review.reviewId || review._id || review.id
  const customerName = review.customerName || 'Thực khách T-ResMK'
  const initial = customerName.trim().charAt(0).toUpperCase() || 'K'
  const rating = Number(review.rating || 5)
  const isVerified = Boolean(review.isVerifiedPurchase)
  const tags = Array.isArray(review.tags) ? review.tags : []
  const images = Array.isArray(review.images) ? review.images : []
  const adminReply = review.adminReply || null
  const createdDate = review.createdAt
    ? new Date(review.createdAt).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle hover:border-border-strong transition-all space-y-3.5 shadow-xs">
      {/* Header: Thông tin khách hoặc tên món + Số sao */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-serif font-bold text-sm flex items-center justify-center shrink-0">
            {initial}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-text-main">{customerName}</span>
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-success/10 text-status-success border border-status-success/25">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Đã thưởng thức tại T-ResMK</span>
                </span>
              )}
              {(review.status === 'HIDDEN' || review.moderation?.isFlagged) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-warning/15 text-status-warning border border-status-warning/30">
                  <ShieldAlert className="w-3 h-3" />
                  <span>
                    {review.status === 'HIDDEN'
                      ? 'Đã tạm ẩn (Kiểm duyệt ngôn từ)'
                      : 'Đang lưu ý ngôn từ'}
                  </span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-text-muted">
              <span className="font-mono">{createdDate}</span>
              {showDishLink && review.dishId && (
                <>
                  <span>•</span>
                  <Link
                    to={`/menu/${review.dishId}`}
                    className="inline-flex items-center gap-1 text-brand-primary hover:underline font-semibold"
                  >
                    <Utensils className="w-3 h-3" />
                    <span>{review.dishName || `Món #${review.dishId}`}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-surface-bg border border-border-subtle">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= rating ? 'text-brand-primary fill-brand-primary' : 'text-border-strong'
                }`}
              />
            ))}
          </div>

          {isOwner && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(review)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface-bg border border-transparent hover:border-border-subtle transition-colors cursor-pointer"
                  title="Sửa đánh giá"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(reviewId)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-status-error/10 border border-transparent hover:border-status-error/20 transition-colors cursor-pointer"
                  title="Xóa đánh giá"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nội dung nhận xét */}
      <p className="text-xs sm:text-sm text-text-body leading-relaxed whitespace-pre-line">
        {review.comment}
      </p>

      {/* Tags cảm nhận */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Hình ảnh đính kèm */}
      {images.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {images.map((imgUrl, idx) => (
            <a
              key={idx}
              href={imgUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-border-subtle bg-surface-bg hover:border-brand-primary transition-all"
            >
              <img
                src={imgUrl}
                alt={`Ảnh đánh giá ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </a>
          ))}
        </div>
      )}

      {/* Phản hồi từ Nhà hàng T-ResMK (adminReply) */}
      {adminReply?.content && (
        <div className="mt-3 p-3.5 rounded-xl bg-surface-bg border-l-2 border-l-brand-primary border border-border-subtle space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary">
              <CornerDownRight className="w-3.5 h-3.5" />
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Phản hồi từ Nhà hàng T-ResMK ({adminReply.staffName || 'Ban Quản Lý'})</span>
            </span>
            {adminReply.repliedAt && (
              <span className="text-[10px] font-mono text-text-muted">
                {new Date(adminReply.repliedAt).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
          <p className="text-xs text-text-body leading-relaxed pl-5">{adminReply.content}</p>
        </div>
      )}
    </div>
  )
}
