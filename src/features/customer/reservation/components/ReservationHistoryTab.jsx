import { Link } from 'react-router-dom'
import { CalendarDays, RefreshCw, AlertCircle, Lock } from 'lucide-react'
import ReservationCard from './ReservationCard'

/**
 * Sub-component Quản Lý Tab Lịch Sử Đặt Bàn (ReservationHistoryTab)
 * - Bộ lọc trạng thái dạng pill kèm badge số lượng
 * - Đầy đủ 4 trạng thái UI: Loading, Error, Empty, Data List
 * - Độ dài < 165 dòng
 */
export default function ReservationHistoryTab({
  isAuthenticated,
  reservations = [],
  loadingHistory,
  historyError,
  onRefresh,
  filterStatus,
  setFilterStatus,
  counts = {},
  onEdit,
  onCancel,
  onGoToBooking,
}) {
  if (!isAuthenticated) {
    return (
      <div className="py-16 text-center bg-surface-card rounded-2xl border border-border-subtle p-8 space-y-4">
        <Lock className="w-12 h-12 text-brand-primary/60 mx-auto" />
        <h3 className="text-base font-semibold text-text-main">Yêu cầu đăng nhập</h3>
        <p className="text-xs text-text-muted max-w-sm mx-auto">
          Bạn cần đăng nhập tài khoản để theo dõi lịch sử đặt bàn và trạng thái xác nhận từ nhà hàng.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-xs font-semibold bg-brand-primary hover:bg-brand-hover text-surface-bg transition-colors shadow-sm"
        >
          Đăng nhập tài khoản
        </Link>
      </div>
    )
  }

  const tabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ duyệt' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'COMPLETED', label: 'Hoàn tất' },
    { key: 'CANCELLED', label: 'Đã hủy' },
    { key: 'REJECTED', label: 'Từ chối' },
  ]

  const filtered = reservations.filter((r) => {
    if (filterStatus === 'ALL') return true
    return (r.status || 'PENDING') === filterStatus
  })

  return (
    <div className="space-y-4">
      {/* Thanh Lọc Theo Trạng Thái & Nút Làm Mới */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const count = counts[tab.key] || 0
            const active = filterStatus === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-brand-primary text-surface-bg font-semibold shadow-sm'
                    : 'text-text-muted hover:text-text-main bg-surface-card border border-border-subtle hover:border-border-strong'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      active
                        ? 'bg-surface-bg text-brand-primary font-bold'
                        : 'bg-surface-bg border border-border-subtle text-text-muted'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loadingHistory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-surface-card border border-border-subtle transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* UI State 1: Loading */}
      {loadingHistory && (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-text-muted text-sm">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span>Đang tải lịch sử đặt bàn...</span>
        </div>
      )}

      {/* UI State 2: Error */}
      {historyError && !loadingHistory && (
        <div className="p-4 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{historyError}</span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="text-brand-primary font-semibold hover:underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* UI State 3: Empty */}
      {!loadingHistory && !historyError && filtered.length === 0 && (
        <div className="py-16 text-center bg-surface-card rounded-2xl border border-dashed border-border-subtle p-8 space-y-3">
          <CalendarDays className="w-10 h-10 text-text-muted mx-auto" />
          <h4 className="text-sm font-semibold text-text-main">
            Không có lượt đặt bàn nào {filterStatus !== 'ALL' ? 'ở trạng thái này' : ''}
          </h4>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {filterStatus !== 'ALL' && reservations.length > 0
              ? `Bạn đang có ${reservations.length} lượt đặt bàn ở các trạng thái khác.`
              : 'Bạn chưa có lượt đặt bàn nào hoặc các lượt đặt đã hoàn tất.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {filterStatus !== 'ALL' && reservations.length > 0 && (
              <button
                type="button"
                onClick={() => setFilterStatus('ALL')}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface-bg border border-border-subtle text-text-main hover:border-border-strong transition-colors cursor-pointer"
              >
                Xem tất cả ({reservations.length} lượt đặt)
              </button>
            )}
            <button
              type="button"
              onClick={onGoToBooking}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-primary hover:bg-brand-hover text-surface-bg transition-colors cursor-pointer shadow-sm"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Đặt bàn mới ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* UI State 4: Data List */}
      {!loadingHistory && !historyError && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((item) => (
            <ReservationCard
              key={item.reservationId || item.id}
              reservation={item}
              onEdit={onEdit}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  )
}

