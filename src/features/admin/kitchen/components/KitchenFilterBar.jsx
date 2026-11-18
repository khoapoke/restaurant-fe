import { Search, RefreshCw, Flame, Clock, Check, UtensilsCrossed, Radio } from 'lucide-react'

/**
 * Thanh Bộ Lọc & Điều Khiển Màn Hình Bếp (KitchenFilterBar)
 * - Lọc theo trạng thái món
 * - Tìm kiếm theo bàn / món
 * - Nút bật/tắt Auto-Refresh 15 giây & Làm mới tức thì
 * - 100% Centralized Design Tokens, dưới 150 dòng
 */
export const KitchenFilterBar = ({
  activeFilter,
  onSelectFilter,
  searchTerm,
  onSearchChange,
  autoRefresh,
  onToggleAutoRefresh,
  onManualRefresh,
  loading,
  counts = {},
}) => {
  const filterTabs = [
    { key: 'ALL', label: 'Tất cả đơn', icon: UtensilsCrossed, count: counts.total || 0 },
    { key: 'COOKING', label: 'Đang nấu', icon: Flame, count: counts.cooking || 0, color: 'text-brand-primary' },
    { key: 'PENDING', label: 'Chờ chế biến', icon: Clock, count: counts.pending || 0, color: 'text-status-warning' },
    { key: 'READY', label: 'Sẵn sàng bưng', icon: Check, count: counts.ready || 0, color: 'text-status-info' },
  ]

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-sm">
      
      {/* Cụm Tabs Lọc Trạng Thái */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.key
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectFilter(tab.key)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-primary text-surface-bg shadow-md shadow-brand-primary/20'
                  : 'bg-surface-bg text-text-muted hover:text-text-main border border-border-subtle hover:border-border-strong'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-black/20 text-surface-bg' : 'bg-surface-card-hover text-text-dim'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Cụm Tìm kiếm & Điều khiển Auto-refresh */}
      <div className="flex items-center gap-2">
        {/* Input tìm bàn */}
        <div className="relative flex-1 sm:w-52">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm bàn / mã đơn..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-bg border border-border-subtle hover:border-border-strong rounded-xl text-text-main placeholder:text-text-dim focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Nút bật/tắt Auto Refresh (15s) */}
        <button
          type="button"
          onClick={onToggleAutoRefresh}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            autoRefresh
              ? 'bg-status-success/10 border-status-success/30 text-status-success'
              : 'bg-surface-bg border-border-subtle text-text-muted hover:text-text-main'
          }`}
          title="Tự động cập nhật mỗi 15 giây"
        >
          <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-status-success animate-ping' : 'bg-text-dim'}`} />
          <Radio className="w-3 h-3" />
          <span className="hidden sm:inline">15s Live</span>
        </button>

        {/* Nút Làm mới thủ công */}
        <button
          type="button"
          disabled={loading}
          onClick={onManualRefresh}
          className="p-2 rounded-xl border border-border-subtle bg-surface-bg hover:bg-surface-card-hover text-text-main transition-colors cursor-pointer disabled:opacity-50"
          title="Làm mới danh sách bếp"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-primary' : ''}`} />
        </button>
      </div>

    </div>
  )
}

export default KitchenFilterBar

