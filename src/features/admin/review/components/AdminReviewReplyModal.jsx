import { useState, useEffect } from 'react'
import { Star, Send, MessageSquareQuote } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'

const QUICK_REPLIES = [
  'Cảm ơn quý khách đã tin tưởng và thưởng thức món ăn tại Nhà hàng T-ResMK! Rất mong được đón tiếp quý khách lần tới ạ.',
  'Nhà hàng T-ResMK xin trân trọng ghi nhận góp ý của quý khách và đã chuyển bộ phận Bếp điều chỉnh ngay để phục vụ tốt hơn ạ.',
  'Cảm ơn lời khen tuyệt vời của quý khách! Đây là động lực lớn cho đội ngũ Đầu bếp T-ResMK.',
]

/**
 * Modal Phản Hồi Đánh Giá Thực Khách (AdminReviewReplyModal - REV-07)
 * - 100% Centralized Design Tokens, < 130 dòng
 */
export default function AdminReviewReplyModal({
  isOpen,
  onClose,
  review,
  onSubmit,
  isSubmitting = false,
}) {
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen || !review) return
    setContent(review.adminReply?.content || '')
    setError(null)
  }, [isOpen, review])

  if (!review) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (trimmed.length < 2) {
      setError('Nội dung phản hồi cần tối thiểu 2 ký tự.')
      return
    }
    if (trimmed.length > 1000) {
      setError('Nội dung phản hồi không vượt quá 1000 ký tự.')
      return
    }
    const reviewId = review.reviewId || review._id || review.id
    onSubmit(reviewId, trimmed)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Phản hồi đánh giá món: ${review.dishName || `#${review.dishId}`}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Tóm tắt đánh giá của khách */}
        <div className="p-3.5 rounded-xl bg-surface-bg border border-border-subtle space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <strong className="text-text-main">{review.customerName || 'Thực khách'}</strong>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Number(review.rating || 5)
                      ? 'text-brand-primary fill-brand-primary'
                      : 'text-border-strong'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-text-body italic leading-relaxed">"{review.comment}"</p>
        </div>

        {/* Mẫu trả lời nhanh */}
        <div className="space-y-1.5">
          <span className="block text-[11px] font-semibold text-text-muted">
            Gợi ý phản hồi nhanh:
          </span>
          <div className="flex flex-col gap-1.5">
            {QUICK_REPLIES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setContent(tpl)
                  setError(null)
                }}
                className="text-left px-3 py-1.5 rounded-xl bg-surface-bg hover:bg-surface-card-hover border border-border-subtle text-[11px] text-text-muted hover:text-text-main transition-colors cursor-pointer truncate"
              >
                <MessageSquareQuote className="w-3 h-3 inline mr-1.5 text-brand-primary" />
                {tpl}
              </button>
            ))}
          </div>
        </div>

        {/* Ô nhập phản hồi */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-text-muted">
              Nội dung phản hồi của nhà hàng <span className="text-status-error">*</span>
            </label>
            <span className="font-mono text-[11px] text-text-dim">{content.length}/1000</span>
          </div>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Nhập lời cảm ơn hoặc giải đáp cho thực khách..."
            className="w-full px-3.5 py-2.5 text-xs bg-surface-bg border border-border-strong rounded-xl text-text-main placeholder:text-text-dim focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={Send} isLoading={isSubmitting}>
            Gửi phản hồi
          </Button>
        </div>
      </form>
    </Modal>
  )
}
