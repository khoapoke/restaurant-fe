import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquareQuote, RefreshCw, Utensils } from 'lucide-react'
import { getMyReviewsApi, deleteMyReviewApi } from '../../review/services/reviewService'
import ReviewItemCard from '../../review/components/ReviewItemCard'
import ReviewFormModal from '../../review/components/ReviewFormModal'
import Pagination from '../../../../components/ui/Pagination'
import Skeleton from '../../../../components/ui/Skeleton'
import Alert from '../../../../components/ui/Alert'
import Button from '../../../../components/ui/Button'

/**
 * Tab Lịch Sử Đánh Giá Của Tôi Trong Hồ Sơ Cá Nhân (MyReviewsTab - REV-03)
 * - Quản lý 4 trạng thái UI: Loading, Error, Empty, Data
 * - Cho phép khách xem lại đánh giá của mình, sửa (REV-04) hoặc xóa (REV-05)
 * - 100% Centralized Design Tokens, < 165 dòng
 */
export default function MyReviewsTab({ onCountChange }) {
  const [reviews, setReviews] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 6,
    totalItems: 0,
    lastPage: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  const [editingReview, setEditingReview] = useState(null)

  const fetchMyReviews = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError(null)
      try {
        const res = await getMyReviewsApi({ page, perPage: 6 })
        const data = res?.data?.data || res?.data || {}
        const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []
        setReviews(items)

        const p = data.pagination
        const total = Number(p?.totalItems ?? items.length)
        if (onCountChange) onCountChange(total)

        if (p) {
          setPagination({
            currentPage: Number(p.currentPage || page),
            perPage: Number(p.perPage || 6),
            totalItems: total,
            lastPage: Number(p.lastPage || p.totalPages || 1),
          })
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Không thể tải lịch sử đánh giá của bạn.')
      } finally {
        setLoading(false)
      }
    },
    [onCountChange]
  )

  useEffect(() => {
    fetchMyReviews(1)
  }, [fetchMyReviews])

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return
    try {
      await deleteMyReviewApi(reviewId)
      setToastMsg('Đã xóa đánh giá thành công!')
      fetchMyReviews(1)
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể xóa đánh giá.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-serif font-bold text-text-main">Lịch sử đánh giá món ăn</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Quản lý toàn bộ các nhận xét và chấm điểm hương vị bạn đã gửi tại T-ResMK
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          isLoading={loading}
          onClick={() => fetchMyReviews(pagination.currentPage)}
        >
          Làm mới
        </Button>
      </div>

      {toastMsg && (
        <Alert type="success" message={toastMsg} onClose={() => setToastMsg(null)} />
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <div className="p-10 text-center rounded-2xl border border-status-error/20 bg-status-error/5 space-y-3">
          <p className="text-xs text-status-error">{error}</p>
          <Button variant="primary" size="sm" icon={RefreshCw} onClick={() => fetchMyReviews(1)}>
            Thử lại
          </Button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-14 text-center rounded-2xl bg-surface-bg border border-border-subtle space-y-3">
          <MessageSquareQuote className="w-10 h-10 text-text-dim mx-auto" />
          <p className="text-sm font-semibold text-text-main">Bạn chưa có đánh giá món ăn nào</p>
          <p className="text-xs text-text-muted max-w-xs mx-auto">
            Hãy khám phá thực đơn và chia sẻ cảm nhận của bạn sau khi thưởng thức nhé!
          </p>
          <div className="pt-1">
            <Link to="/menu">
              <Button variant="primary" size="sm" icon={Utensils}>
                Khám phá Thực đơn
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((item) => (
            <ReviewItemCard
              key={item.reviewId || item._id || item.id}
              review={item}
              isOwner={true}
              showDishLink={true}
              onEdit={(rev) => setEditingReview(rev)}
              onDelete={handleDelete}
            />
          ))}

          <Pagination
            currentPage={pagination.currentPage}
            lastPage={pagination.lastPage}
            totalItems={pagination.totalItems}
            itemLabel="đánh giá"
            onPageChange={(p) => fetchMyReviews(p)}
          />
        </div>
      )}

      <ReviewFormModal
        isOpen={Boolean(editingReview)}
        onClose={() => setEditingReview(null)}
        dishId={editingReview?.dishId}
        dishName={editingReview?.dishName}
        initialReview={editingReview}
        onSuccess={(_, msg) => {
          setToastMsg(msg)
          fetchMyReviews(pagination.currentPage)
        }}
      />
    </div>
  )
}
