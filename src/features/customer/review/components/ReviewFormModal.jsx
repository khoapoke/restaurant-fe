import { useState, useEffect } from 'react'
import { Star, Plus, X, Send } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import {
  REVIEW_TAG_SUGGESTIONS,
  RATING_LABELS,
  createDishReviewApi,
  updateMyReviewApi,
} from '../services/reviewService'

/**
 * Modal Viết / Chỉnh Sửa Đánh Giá Món Ăn (ReviewFormModal)
 * - Hỗ trợ REV-02 (Tạo mới) và REV-04 (Chỉnh sửa)
 * - Chọn 1-5 sao tương tác, gợi ý 8 tags cảm nhận, đính kèm URL ảnh
 * - 100% Centralized Design Tokens, < 220 dòng
 */
export default function ReviewFormModal({
  isOpen,
  onClose,
  dishId,
  dishName = 'Món ăn',
  orderId = null,
  initialReview = null,
  onSuccess,
}) {
  const isEditMode = Boolean(initialReview?.reviewId || initialReview?._id || initialReview?.id)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState([])
  const [images, setImages] = useState([])
  const [imageInput, setImageInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    setError(null)
    if (initialReview) {
      setRating(Number(initialReview.rating || 5))
      setComment(initialReview.comment || '')
      setTags(Array.isArray(initialReview.tags) ? initialReview.tags : [])
      setImages(Array.isArray(initialReview.images) ? initialReview.images : [])
    } else {
      setRating(5)
      setComment('')
      setTags(['Ngon miệng'])
      setImages([])
    }
    setImageInput('')
  }, [isOpen, initialReview])

  const handleToggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length >= 6 ? prev : [...prev, tag]
    )
  }

  const handleAddImage = () => {
    const trimmed = imageInput.trim()
    if (!trimmed) return
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setError('Đường dẫn hình ảnh phải bắt đầu bằng http:// hoặc https://')
      return
    }
    if (images.length >= 5) {
      setError('Tối đa 5 hình ảnh cho mỗi đánh giá.')
      return
    }
    if (!images.includes(trimmed)) setImages((prev) => [...prev, trimmed])
    setImageInput('')
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const cleanComment = comment.trim()
    if (cleanComment.length < 3 || cleanComment.length > 1000) {
      setError('Vui lòng nhập nhận xét từ 3 đến 1000 ký tự.')
      return
    }

    setSubmitting(true)
    try {
      const payload = { rating: Number(rating), comment: cleanComment, tags, images }
      if (!isEditMode && orderId) payload.orderId = Number(orderId)

      const resolveModerationMsg = (item, defaultMsg) => {
        if (item?.status === 'HIDDEN') {
          return 'Đánh giá đã được ghi nhận nhưng tạm ẩn do hệ thống phát hiện ngôn từ chưa phù hợp. Bạn có thể chỉnh sửa lại trong mục Đánh giá của tôi.'
        }
        if (item?.moderation?.isFlagged) {
          return 'Đánh giá đã được gửi và đang trong danh sách rà soát ngôn từ của nhà hàng.'
        }
        return defaultMsg
      }

      if (isEditMode) {
        const revId = initialReview.reviewId || initialReview._id || initialReview.id
        const res = await updateMyReviewApi(revId, payload)
        const updated = res?.data?.data || res?.data
        onSuccess?.(updated, resolveModerationMsg(updated, 'Cập nhật đánh giá thành công!'))
      } else {
        const res = await createDishReviewApi(dishId, payload)
        const created = res?.data?.data || res?.data
        onSuccess?.(created, resolveModerationMsg(created, 'Cảm ơn bạn đã gửi đánh giá món ăn!'))
      }
      onClose()
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (typeof err === 'object' ? Object.values(err).flat().join(', ') : null) ||
        'Không thể gửi đánh giá. Vui lòng thử lại.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const activeStar = hoverRating || rating

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Chỉnh sửa đánh giá: ${dishName}` : `Đánh giá món: ${dishName}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Chọn số sao */}
        <div className="p-4 rounded-xl bg-surface-bg border border-border-subtle flex flex-col items-center text-center space-y-2">
          <span className="text-xs text-text-muted font-medium">Mức độ hài lòng của bạn về món ăn này</span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110 cursor-pointer"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= activeStar ? 'text-brand-primary fill-brand-primary' : 'text-border-strong'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-brand-primary">
            {activeStar} Sao — {RATING_LABELS[activeStar]}
          </span>
        </div>

        {/* Chọn nhanh thẻ cảm nhận (Tags) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-muted">Thẻ cảm nhận nhanh (Tối đa 6)</span>
            <span className="font-mono text-[11px] text-text-dim">{tags.length}/6</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REVIEW_TAG_SUGGESTIONS.map((tag) => {
              const selected = tags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selected
                      ? 'bg-brand-primary text-surface-bg font-semibold shadow-xs'
                      : 'bg-surface-bg text-text-muted hover:text-text-main border border-border-subtle'
                  }`}
                >
                  #{tag}
                </button>
              )
            })}
          </div>
        </div>

        {/* Nội dung nhận xét */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-text-muted">
              Chia sẻ trải nghiệm hương vị <span className="text-status-error">*</span>
            </label>
            <span className="font-mono text-[11px] text-text-dim">{comment.length}/1000</span>
          </div>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Món ăn có hợp khẩu vị của bạn không? Độ nóng hổi, trình bày và phục vụ thế nào..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-surface-bg border border-border-strong rounded-xl text-text-main placeholder:text-text-dim focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Đính kèm URL hình ảnh */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-muted">
            Đính kèm link ảnh món ăn (Tùy chọn, tối đa 5 ảnh)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="https://example.com/anh-mon-an.jpg"
              className="flex-1 px-3 py-2 text-xs bg-surface-bg border border-border-subtle rounded-xl text-text-main placeholder:text-text-dim focus:outline-none focus:border-brand-primary"
            />
            <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={handleAddImage}>
              Thêm
            </Button>
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {images.map((url, idx) => (
                <div key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-bg border border-border-subtle text-[11px] text-text-body">
                  <span>Ảnh #{idx + 1}</span>
                  <button type="button" onClick={() => setImages((prev) => prev.filter((item) => item !== url))} className="text-text-muted hover:text-status-error cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={Send} isLoading={submitting}>
            {isEditMode ? 'Lưu cập nhật' : 'Gửi đánh giá'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
