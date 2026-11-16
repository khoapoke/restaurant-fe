import { OrderStatus, ORDER_STATUS_CONFIG } from '../constants'

const tabs = [
  { key: 'ALL', label: 'Tất cả đơn' },
  { key: OrderStatus.PENDING_CONFIRMATION, label: ORDER_STATUS_CONFIG.PENDING_CONFIRMATION.label },
  { key: OrderStatus.CONFIRMED, label: ORDER_STATUS_CONFIG.CONFIRMED.label },
  { key: OrderStatus.PREPARING, label: ORDER_STATUS_CONFIG.PREPARING.label },
  { key: OrderStatus.READY, label: ORDER_STATUS_CONFIG.READY.label },
  { key: OrderStatus.DELIVERING, label: ORDER_STATUS_CONFIG.DELIVERING.label },
  { key: OrderStatus.COMPLETED, label: ORDER_STATUS_CONFIG.COMPLETED.label },
  { key: OrderStatus.CANCELLED, label: ORDER_STATUS_CONFIG.CANCELLED.label },
]

/**
 * Thanh Bộ Lọc Trạng Thái Đơn Hàng (AdminOrderStatusTabs)
 * - 100% Centralized Design Tokens
 * - Độ dài < 45 dòng
 */
export const AdminOrderStatusTabs = ({ activeStatus, onSelectStatus }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeStatus === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelectStatus(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? 'bg-brand-primary text-surface-bg shadow-md shadow-brand-primary/20'
                : 'bg-surface-card text-text-muted hover:text-text-main border border-border-subtle hover:border-border-strong'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default AdminOrderStatusTabs
