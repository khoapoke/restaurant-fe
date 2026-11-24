import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageSquareQuote, RefreshCw, PenLine } from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import { getDishReviewsApi, deleteMyReviewApi } from '../services/reviewService'
import ReviewSummaryCard from './ReviewSummaryCard'
import ReviewItemCard from './ReviewItemCard'
import ReviewFormModal from './ReviewFormModal'
import Pagination from '../../../../components/ui/Pagination'
import Skeleton from '../../../../components/ui/Skeleton'
import Alert from '../../../../components/ui/Alert'
import Button from '../../../../components/ui/Button'

/**
 * Khu Vực Đánh Giá & Nhận Xét Thực Khách Tại Trang Chi Tiết Món Ăn (DishReviewsSection)
 * - Quản lý đầy đủ 4 trạng thái UI: Loading, Error, Empty, Data
 * - Hỗ trợ lọc theo số sao, lọc ảnh, sắp xếp, phân trang, viết/sửa/xóa đánh giá
 * - 100% Centralized Design Tokens, < 235 dòng
 */
export default function DishReviewsSection({ dishId, dishName }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, user } = useAuth()
  const currentAccountId = user?.accountId || user?.id || user?.ma_tai_khoan

  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  })
  const [reviews, setReviews] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 6,
    totalItems: 0,
    lastPage: 1,
  })
  const [filterRating, setFilterRating] = useState('')
  const [hasImages, setHasImages] = useState(false)
  const [sort, setSort] = useState('newest')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const orderIdFromUrl = searchParams.get('orderId')

  const fetchReviews = useCallback(
    async (page = 1) => {
      if (!dishId) return
      setLoading(true)
      setError(null)
      try {
        const res = await getDishReviewsApi(dishId, {
          page,
          perPage: 6,
          rating: filterRating || undefined,
          hasImages: hasImages ? 'true' : undefined,
          sort,
        })
        const data = res?.data?.data || res?.data || {}
        if (data.summary) setSummary(data.summary)
        setReviews(Array.isArray(data.items) ? data.items : [])

        const p = data.pagination
        if (p) {
          setPagination({
            currentPage: Number(p.currentPage || page),
            perPage: Number(p.perPage || 6),
            totalItems: Number(p.totalItems || 0),
            lastPage: Number(p.lastPage || p.totalPages || 1),
          })
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Không thể tải danh sách đánh giá món ăn.')
      } finally {
        setLoading(false)
      }
    },
    [dishId, filterRating, hasImages, sort]
  )

  useEffect(() => {
    fetchReviews(1)
  }, [fetchReviews])

  // Tìm xem khách hiện tại đã có đánh giá trong danh sách chưa
  const myExistingReview = useMemo(() => {
    if (!currentAccountId) return null
    return reviews.find((r) => Number(r.accountId) === Number(currentAccountId)) || null
  }, [reviews, currentAccountId])

  // Nếu dẫn từ đơn hàng (?review=1&orderId=...), tự động mở modal đánh giá
  useEffect(() => {
    if (searchParams.get('review') === '1' && isAuthenticated && !loading) {
      setEditingReview(myExistingReview || null)
      setIsModalOpen(true)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('review')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, isAuthenticated, loading, myExistingReview, setSearchParams])

  const handleOpenWrite = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setEditingReview(myExistingReview || null)
    setIsModalOpen(true)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) return
    try {
      await deleteMyReviewApi(reviewId)
      setToastMsg('Đã xóa đánh giá của bạn.')
      fetchReviews(1)
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể xóa đánh giá.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-main flex items-center gap-2.5">
            <MessageSquareQuote className="w-6 h-6 text-brand-primary" />
            <span>Đánh giá & Nhận xét từ Thực khách</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Trải nghiệm ẩm thực thực tế từ các khách hàng đã thưởng thức món ăn tại T-ResMK
          </p>
        </div>
      </div>

      {toastMsg && (
        <Alert type="success" message={toastMsg} onClose={() => setToastMsg(null)} />
      )}

      {/* Khung Tổng Quan Điểm Sao & Bộ Lọc */}
      <ReviewSummaryCard
        summary={summary}
        filterRating={filterRating}
        onFilterRating={(val) => setFilterRating(val)}
        hasImages={hasImages}
        onToggleHasImages={() => setHasImages((prev) => !prev)}
        sort={sort}
        onChangeSort={(val) => setSort(val)}
        onOpenWriteModal={handleOpenWrite}
        myExistingReview={myExistingReview}
      />

      {/* 4 Trạng thái UI */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <div className="p-10 text-center rounded-2xl bg-surface-card border border-status-error/30 space-y-3">
          <p className="text-xs text-status-error">{error}</p>
          <Button variant="primary" size="sm" icon={RefreshCw} onClick={() => fetchReviews(1)}>
            Thử lại
          </Button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-14 px-6 text-center rounded-2xl bg-surface-card border border-border-subtle space-y-3">
          <MessageSquareQuote className="w-10 h-10 text-text-dim mx-auto" />
          <p className="text-sm font-semibold text-text-main">
            {filterRating || hasImages
              ? 'Không có đánh giá nào khớp với bộ lọc đã chọn'
              : 'Chưa có đánh giá nào cho món ăn này'}
          </p>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Hãy là thực khách đầu tiên chia sẻ cảm nhận hương vị về món {dishName || 'này'}!
          </p>
          <div className="pt-1">
            <Button variant="outline" size="sm" icon={PenLine} onClick={handleOpenWrite}>
              Viết đánh giá đầu tiên
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {reviews.map((item) => (
              <ReviewItemCard
                key={item.reviewId || item._id || item.id}
                review={item}
                isOwner={
                  Boolean(currentAccountId) &&
                  Number(item.accountId) === Number(currentAccountId)
                }
                onEdit={(rev) => {
                  setEditingReview(rev)
                  setIsModalOpen(true)
                }}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            lastPage={pagination.lastPage}
            totalItems={pagination.totalItems}
            itemLabel="đánh giá"
            onPageChange={(p) => fetchReviews(p)}
          />
        </div>
      )}

      {/* Modal Viết / Sửa Đánh Giá */}
      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dishId={dishId}
        dishName={dishName}
        orderId={orderIdFromUrl}
        initialReview={editingReview}
        onSuccess={(_, msg) => {
          setToastMsg(msg)
          fetchReviews(1)
        }}
      />
    </section>
  )
}
