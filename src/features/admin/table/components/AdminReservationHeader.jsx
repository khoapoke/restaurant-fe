import { CalendarCheck, RefreshCw } from 'lucide-react'
import Button from '../../../../components/ui/Button'

/**
 * Header & Thanh Lọc Trạng Thái Đặt Bàn (AdminReservationHeader)
 * - Tách từ AdminReservationsPage để đảm bảo component < 250 dòng
 * - 100% Centralized Design Tokens
 * - Độ dài < 75 dòng
 */
export const AdminReservationHeader = ({
  statusTabs,
  activeTab,
  setActiveTab,
  loading,
  onRefresh,
}) => {
  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-main">Điều phối Đặt bàn</h2>
            <p className="text-xs text-text-muted">
              Tiếp nhận, xác nhận cọc, gán bàn và quản lý các lượt khách đặt trước
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          isLoading={loading}
          onClick={onRefresh}
        >
          Làm mới
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.key
                ? 'bg-brand-primary text-text-inverse font-bold shadow-sm shadow-brand-primary/20'
                : 'bg-surface-card text-text-muted hover:text-text-main border border-border-subtle hover:border-border-default'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default AdminReservationHeader

