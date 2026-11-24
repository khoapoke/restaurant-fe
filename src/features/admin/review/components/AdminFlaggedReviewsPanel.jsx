import { useState, useEffect, useCallback } from 'react'
import { ShieldAlert, EyeOff, Search, RefreshCw, ShieldCheck } from 'lucide-react'
import {
  getFlaggedReviewsApi,
  autoHideFlaggedReviewsApi,
  toggleReviewVisibilityApi,
  deleteAdminReviewApi,
} from '../services/adminReviewService'
import { AUTO_HIDE_PRESETS } from '../constants'
import AdminReviewTable from './AdminReviewTable'
import Pagination from '../../../../components/ui/Pagination'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'

/**
 * Bảng Điều Khiển Kiểm Duyệt Ngôn Từ Vi Phạm (AdminFlaggedReviewsPanel - REV-10 & REV-11)
 * - 5 chỉ số mức độ vi phạm, Ẩn hàng loạt 1-Click (REV-11), Bộ lọc chuyên sâu (REV-10)
 * - 100% Centralized Design Tokens, < 225 dòng
 */
export default function AdminFlaggedReviewsPanel({ onOpenReply, onStatsChanged }) {
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState({
    totalFlagged: 0, highCount: 0, mediumCount: 0, lowCount: 0, visibleFlaggedCount: 0, hiddenFlaggedCount: 0,
  })
  const [pagination, setPagination] = useState({ currentPage: 1, perPage: 10, totalItems: 0, lastPage: 1 })
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('')
  const [category, setCategory] = useState('')
  const [onlyVisible, setOnlyVisible] = useState(false)
  const [hidePresetKey, setHidePresetKey] = useState('HIGH_MEDIUM')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  const [isAutoHiding, setIsAutoHiding] = useState(false)
  const [processingId, setProcessingId] = useState(null)

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const fetchFlagged = useCallback(
    async (page = 1) => {
      setLoading(true); setError(null)
      try {
        const res = await getFlaggedReviewsApi({
          page, perPage: 10,
          search: search.trim() || undefined,
          severity: severity || undefined,
          category: category || undefined,
          onlyVisible: onlyVisible ? 'true' : undefined,
        })
        const data = res?.data?.data || res?.data || {}
        if (data.summary) setSummary(data.summary)
        setItems(Array.isArray(data.items) ? data.items : [])

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
        setError(err?.response?.data?.message || 'Không thể tải danh sách bình luận vi phạm.')
      } finally { setLoading(false) }
    },
    [search, severity, category, onlyVisible]
  )

  useEffect(() => { fetchFlagged(1) }, [fetchFlagged])

  const handleBulkAutoHide = async () => {
    const preset = AUTO_HIDE_PRESETS.find((p) => p.key === hidePresetKey) || AUTO_HIDE_PRESETS[0]
    setIsAutoHiding(true)
    try {
      const res = await autoHideFlaggedReviewsApi(preset.severities)
      const data = res?.data?.data || res?.data || {}
      if (data.summary) setSummary(data.summary)
      showToast(res?.message || `Đã tự động ẩn ${data.hiddenCount ?? 0} bình luận vi phạm ngôn từ đang hiển thị!`)
      fetchFlagged(1)
      onStatsChanged?.()
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể thực hiện ẩn hàng loạt.')
    } finally { setIsAutoHiding(false) }
  }

  const handleToggleVisibility = async (reviewId, nextStatus) => {
    setProcessingId(reviewId)
    try {
      await toggleReviewVisibilityApi(reviewId, nextStatus)
      showToast(nextStatus === 'HIDDEN' ? 'Đã ẩn bình luận vi phạm khỏi trang công khai!' : 'Đã cho phép hiển thị lại bình luận!')
      fetchFlagged(pagination.currentPage)
      onStatsChanged?.()
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể cập nhật trạng thái.')
    } finally { setProcessingId(null) }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Xóa vĩnh viễn bình luận vi phạm này khỏi hệ thống?')) return
    setProcessingId(reviewId)
    try {
      await deleteAdminReviewApi(reviewId)
      showToast('Đã xóa vĩnh viễn bình luận vi phạm!')
      fetchFlagged(pagination.currentPage)
      onStatsChanged?.()
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể xóa bình luận.')
    } finally { setProcessingId(null) }
  }

  return (
    <div className="space-y-5">
      {/* 5 Thẻ Thống Kê Kiểm Duyệt (REV-10 Summary) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle">
          <span className="text-[11px] text-text-muted block">Tổng bình luận gắn cờ</span>
          <span className="text-xl font-extrabold text-text-main font-mono">{summary.totalFlagged}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-status-error/5 border border-status-error/25">
          <span className="text-[11px] text-status-error font-semibold block">Mức HIGH (Tục tĩu)</span>
          <span className="text-xl font-extrabold text-status-error font-mono">{summary.highCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-status-warning/5 border border-status-warning/25">
          <span className="text-[11px] text-status-warning font-semibold block">Mức MEDIUM (Xúc phạm)</span>
          <span className="text-xl font-extrabold text-status-warning font-mono">{summary.mediumCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-status-info/5 border border-status-info/25">
          <span className="text-[11px] text-status-info font-semibold block">Mức LOW (Spam/Nhẹ)</span>
          <span className="text-xl font-extrabold text-status-info font-mono">{summary.lowCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle col-span-2 sm:col-span-1">
          <span className="text-[11px] text-text-muted block">Đang lộ / Đã ẩn</span>
          <span className="text-xl font-extrabold text-status-warning font-mono">
            {summary.visibleFlaggedCount} <span className="text-xs text-status-success font-normal">({summary.hiddenFlaggedCount} đã ẩn)</span>
          </span>
        </div>
      </div>

      {/* Thanh Công Cụ Ẩn Hàng Loạt 1-Click (REV-11 Bulk Auto-Hide) */}
      <div className="p-4 rounded-2xl bg-status-error/5 border border-status-error/25 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-status-error shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-text-main">Công cụ Ẩn hàng loạt bình luận vi phạm (Auto-Hide Rule Engine)</h3>
            <p className="text-[11px] text-text-muted">
              Hiện có <strong className="text-status-error font-mono">{summary.visibleFlaggedCount}</strong> bình luận bị gắn cờ vẫn đang hiển thị công khai (`VISIBLE`).
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={hidePresetKey} onChange={(e) => setHidePresetKey(e.target.value)} className="px-3 py-2 text-xs bg-surface-bg border border-border-strong rounded-xl text-text-main focus:outline-none focus:border-brand-primary cursor-pointer">
            {AUTO_HIDE_PRESETS.map((p) => (<option key={p.key} value={p.key}>{p.label}</option>))}
          </select>
          <Button variant="danger" size="sm" icon={EyeOff} isLoading={isAutoHiding} onClick={handleBulkAutoHide}>
            Ẩn hàng loạt ngay ({summary.visibleFlaggedCount})
          </Button>
        </div>
      </div>

      {/* Thanh Bộ Lọc Kiểm Duyệt (REV-10) */}
      <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm từ ngữ vi phạm, tên khách, tên món..." className="w-full pl-9 pr-3 py-2 text-xs bg-surface-bg border border-border-subtle rounded-xl text-text-main placeholder:text-text-dim focus:outline-none focus:border-brand-primary" />
        </div>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="px-3 py-2 text-xs bg-surface-bg border border-border-subtle rounded-xl text-text-main focus:outline-none focus:border-brand-primary cursor-pointer">
          <option value="">Tất cả mức độ vi phạm</option>
          <option value="HIGH">Mức HIGH (Tục tĩu nặng)</option>
          <option value="MEDIUM">Mức MEDIUM (Xúc phạm)</option>
          <option value="LOW">Mức LOW (Spam / Nghi vấn)</option>
          <option value="HIGH,MEDIUM">Gộp HIGH + MEDIUM</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 text-xs bg-surface-bg border border-border-subtle rounded-xl text-text-main focus:outline-none focus:border-brand-primary cursor-pointer">
          <option value="">Tất cả nhóm vi phạm</option>
          <option value="PROFANITY">PROFANITY — Tục tĩu / Chửi thề</option>
          <option value="INSULT">INSULT — Xúc phạm / Công kích</option>
          <option value="SPAM">SPAM — Quảng cáo / Link lạ</option>
        </select>
        <button type="button" onClick={() => setOnlyVisible((prev) => !prev)} className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${onlyVisible ? 'bg-status-warning/15 text-status-warning border-status-warning/40' : 'bg-surface-bg text-text-muted hover:text-text-main border-border-subtle'}`}>
          <EyeOff className="w-3.5 h-3.5" />
          <span>{onlyVisible ? 'Đang lọc: Chưa ẩn' : 'Chỉ hiện bình luận chưa ẩn'}</span>
        </button>
      </div>

      {toastMsg && <Alert type="success" message={toastMsg} onClose={() => setToastMsg(null)} />}
      {error && <Alert type="error" message={error} action={<Button variant="outline" size="sm" onClick={() => fetchFlagged(1)}>Thử lại</Button>} />}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-36 w-full rounded-2xl bg-surface-card" />
          <Skeleton className="h-36 w-full rounded-2xl bg-surface-card" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-surface-card border border-border-subtle space-y-3">
          <ShieldCheck className="w-10 h-10 text-status-success mx-auto" />
          <p className="text-sm font-semibold text-text-main">Không có bình luận vi phạm nào</p>
          <p className="text-xs text-text-muted max-w-xs mx-auto">Hệ thống kiểm duyệt chưa ghi nhận bình luận tục tĩu hoặc không phù hợp khớp với bộ lọc.</p>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => fetchFlagged(1)}>Kiểm tra lại</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <AdminReviewTable reviews={items} onOpenReply={onOpenReply} onToggleVisibility={handleToggleVisibility} onDelete={handleDelete} processingId={processingId} />
          <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} totalItems={pagination.totalItems} itemLabel="bình luận vi phạm" onPageChange={(p) => fetchFlagged(p)} />
        </div>
      )}
    </div>
  )
}
