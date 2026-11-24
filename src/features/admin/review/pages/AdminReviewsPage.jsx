import { useState, useEffect, useCallback } from 'react'
import { MessageSquareQuote, Star, RefreshCw, Search, ShieldAlert } from 'lucide-react'
import {
  getAdminReviewsApi,
  replyReviewApi,
  toggleReviewVisibilityApi,
  deleteAdminReviewApi,
} from '../services/adminReviewService'
import AdminReviewTable from '../components/AdminReviewTable'
import AdminFlaggedReviewsPanel from '../components/AdminFlaggedReviewsPanel'
import AdminReviewReplyModal from '../components/AdminReviewReplyModal'
import Pagination from '../../../../components/ui/Pagination'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'

/**
 * Trang Quản Trị Đánh Giá & Kiểm Duyệt Ngôn Từ Món Ăn (AdminReviewsPage - REV-06 -> REV-11)
 * - Chuyển đổi 2 chế độ: Tất cả đánh giá (REV-06) & Kiểm duyệt ngôn từ vi phạm (REV-10, REV-11)
 * - 4 trạng thái UI (Loading, Error, Empty, Data), < 240 dòng
 */
export const AdminReviewsPage = () => {
  const [activeMode, setActiveMode] = useState('ALL')
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({
    totalReviews: 0, visibleCount: 0, hiddenCount: 0, repliedCount: 0, flaggedCount: 0, averageRating: 0,
  })
  const [pagination, setPagination] = useState({ currentPage: 1, perPage: 10, totalItems: 0, lastPage: 1 })

  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [hasReplyFilter, setHasReplyFilter] = useState('')
  const [isFlaggedFilter, setIsFlaggedFilter] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState(null)
  const [replyingReview, setReplyingReview] = useState(null)
  const [isReplying, setIsReplying] = useState(false)
  const [processingId, setProcessingId] = useState(null)

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 3000)
  }

  const fetchAdminReviews = useCallback(
    async (page = 1) => {
      setLoading(true); setError(null)
      try {
        const res = await getAdminReviewsApi({
          page, perPage: 10,
          search: search.trim() || undefined,
          rating: ratingFilter || undefined,
          status: statusFilter || undefined,
          hasReply: hasReplyFilter || undefined,
          isFlagged: isFlaggedFilter || undefined,
        })
        const data = res?.data?.data || res?.data || {}
        if (data.stats) setStats((prev) => ({ ...prev, ...data.stats }))
        setReviews(Array.isArray(data.items) ? data.items : [])

        const p = data.pagination
        if (p) {
          setPagination({
            currentPage: Number(p.currentPage || page),
            perPage: Number(p.perPage || 10),
            totalItems: Number(p.totalItems || 0),
            lastPage: Number(p.lastPage || p.totalPages || 1),
          })
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Không thể tải danh sách đánh giá hệ thống.')
      } finally { setLoading(false) }
    },
    [search, ratingFilter, statusFilter, hasReplyFilter, isFlaggedFilter]
  )

  useEffect(() => { fetchAdminReviews(1) }, [fetchAdminReviews])

  const handleReplySubmit = async (reviewId, content) => {
    setIsReplying(true)
    try {
      await replyReviewApi(reviewId, content)
      showToast('Đã gửi phản hồi của nhà hàng thành công!')
      setReplyingReview(null)
      fetchAdminReviews(pagination.currentPage)
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể gửi phản hồi.')
    } finally { setIsReplying(false) }
  }

  const handleToggleVisibility = async (reviewId, nextStatus) => {
    setProcessingId(reviewId)
    try {
      await toggleReviewVisibilityApi(reviewId, nextStatus)
      showToast(nextStatus === 'HIDDEN' ? 'Đã ẩn đánh giá khỏi trang công khai!' : 'Đã hiển thị lại đánh giá công khai!')
      fetchAdminReviews(pagination.currentPage)
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể đổi trạng thái hiển thị.')
    } finally { setProcessingId(null) }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này không?')) return
    setProcessingId(reviewId)
    try {
      await deleteAdminReviewApi(reviewId)
      showToast('Đã xóa vĩnh viễn đánh giá!')
      fetchAdminReviews(pagination.currentPage)
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể xóa đánh giá.')
    } finally { setProcessingId(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-main">Quản lý & Kiểm duyệt Đánh giá Món ăn</h2>
            <p className="text-xs text-text-muted">Theo dõi phản hồi thực khách, trả lời nhận xét và lọc ngôn từ tục tĩu tự động (RULE_ENGINE)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-surface-bg border border-border-subtle">
            <button type="button" onClick={() => setActiveMode('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeMode === 'ALL' ? 'bg-brand-primary text-surface-bg shadow-xs' : 'text-text-muted hover:text-text-main'}`}>
              Tất cả đánh giá ({stats.totalReviews})
            </button>
            <button type="button" onClick={() => setActiveMode('FLAGGED')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeMode === 'FLAGGED' ? 'bg-status-error text-white shadow-xs' : 'text-text-muted hover:text-status-error'}`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Kiểm duyệt ngôn từ</span>
              {Number(stats.flaggedCount || 0) > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${activeMode === 'FLAGGED' ? 'bg-white/20 text-white' : 'bg-status-error/15 text-status-error'}`}>
                  {stats.flaggedCount}
                </span>
              )}
            </button>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} isLoading={loading} onClick={() => fetchAdminReviews(pagination.currentPage)}>Làm mới</Button>
        </div>
      </div>

      {activeMode === 'FLAGGED' ? (
        <AdminFlaggedReviewsPanel onOpenReply={(rev) => setReplyingReview(rev)} onStatsChanged={() => fetchAdminReviews(pagination.currentPage)} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-surface-card border border-border-subtle">
              <span className="text-[11px] text-text-muted font-medium block">Tổng số đánh giá</span>
              <span className="text-xl font-extrabold text-text-main font-mono">{stats.totalReviews}</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-card border border-border-subtle">
              <span className="text-[11px] text-brand-primary font-medium block">Điểm trung bình</span>
              <span className="text-xl font-extrabold text-brand-primary font-mono inline-flex items-center gap-1">
                {Number(stats.averageRating || 0).toFixed(1)} <Star className="w-4 h-4 fill-brand-primary text-brand-primary" />
              </span>
            </div>
            <div className="p-4 rounded-xl bg-surface-card border border-border-subtle">
              <span className="text-[11px] text-status-success font-medium block">Hiển thị / Đã ẩn</span>
              <span className="text-xl font-extrabold text-status-success font-mono">
                {stats.visibleCount} <span className="text-xs text-status-warning font-normal">({stats.hiddenCount} ẩn)</span>
              </span>
            </div>
            <div className="p-4 rounded-xl bg-surface-card border border-border-subtle">
              <span className="text-[11px] text-status-info font-medium block">Đã phản hồi khách</span>
              <span className="text-xl font-extrabold text-status-info font-mono">{stats.repliedCount} / {stats.totalReviews}</span>
            </div>
            <button type="button" onClick={() => setActiveMode('FLAGGED')} className="p-4 rounded-xl bg-status-error/5 hover:bg-status-error/10 border border-status-error/25 text-left transition-colors cursor-pointer col-span-2 sm:col-span-1">
              <span className="text-[11px] text-status-error font-semibold flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Cảnh báo ngôn từ</span>
              <span className="text-xl font-extrabold text-status-error font-mono">{stats.flaggedCount || 0} <span className="text-[11px] font-normal underline">Xem ngay →</span></span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên khách, tên món, nhận xét..." className="w-full pl-9 pr-3 py-2 text-xs bg-surface-bg border border-border-subtle rounded-xl text-text-main placeholder:text-text-dim focus:outline-none focus:border-brand-primary" />
            </div>
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="px-3 py-2 text-xs bg-surface-bg border border-border-subtle rounded-xl text-text-main focus:outline-none focus:border-brand-primary cursor-pointer">
              <option value="">Tất cả mức sao (1 - 5 ★)</option>
              {[5, 4, 3, 2, 1].map((s) => (<option key={s} value={s}>{s} Sao ({s} ★)</option>))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 text-xs bg-surface-bg border border-border-subtle rounded-xl text-text-main focus:outline-none focus:border-brand-primary cursor-pointer">
              <option value="">Tất cả trạng thái hiển thị</option>
              <option value="VISIBLE">Đang hiển thị (VISIBLE)</option>
              <option value="HIDDEN">Đã ẩn (HIDDEN)</option>
            </select>
            <select value={hasReplyFilter} onChange={(e) => setHasReplyFilter(e.target.value)} className="px-3 py-2 text-xs bg-surface-bg border border-border-subtle rounded-xl text-text-main focus:outline-none focus:border-brand-primary cursor-pointer">
              <option value="">Tất cả tình trạng phản hồi</option>
              <option value="false">Chưa phản hồi</option>
              <option value="true">Đã phản hồi</option>
            </select>
            <select value={isFlaggedFilter} onChange={(e) => setIsFlaggedFilter(e.target.value)} className="px-3 py-2 text-xs bg-surface-bg border border-border-subtle rounded-xl text-text-main focus:outline-none focus:border-brand-primary cursor-pointer">
              <option value="">Tất cả kiểm duyệt ngôn từ</option>
              <option value="true">⚠️ Có cờ vi phạm ngôn từ</option>
              <option value="false">✓ Ngôn từ hợp lệ</option>
            </select>
          </div>

          {successToast && <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />}
          {error && <Alert type="error" message={error} action={<Button variant="outline" size="sm" onClick={() => fetchAdminReviews(1)}>Thử lại</Button>} />}

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full rounded-2xl bg-surface-card" />
              <Skeleton className="h-32 w-full rounded-2xl bg-surface-card" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-surface-card border border-border-subtle space-y-3">
              <MessageSquareQuote className="w-10 h-10 text-text-dim mx-auto" />
              <p className="text-sm font-semibold text-text-main">Không tìm thấy đánh giá nào</p>
              <p className="text-xs text-text-muted max-w-xs mx-auto">Chưa có nhận xét nào khớp với bộ lọc hiện tại.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AdminReviewTable reviews={reviews} onOpenReply={(rev) => setReplyingReview(rev)} onToggleVisibility={handleToggleVisibility} onDelete={handleDeleteReview} processingId={processingId} />
              <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} totalItems={pagination.totalItems} itemLabel="đánh giá" onPageChange={(p) => fetchAdminReviews(p)} />
            </div>
          )}
        </>
      )}

      <AdminReviewReplyModal isOpen={Boolean(replyingReview)} onClose={() => setReplyingReview(null)} review={replyingReview} onSubmit={handleReplySubmit} isSubmitting={isReplying} />
    </div>
  )
}

export default AdminReviewsPage
