import { OrderStatus } from '../constants'

const ORDER_TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: OrderStatus.PENDING_CONFIRMATION, label: 'Chờ xác nhận' },
  { key: OrderStatus.CONFIRMED, label: 'Đã xác nhận' },
  { key: OrderStatus.PREPARING, label: 'Bếp đang nấu' },
  { key: OrderStatus.READY, label: 'Sẵn sàng' },
  { key: OrderStatus.DELIVERING, label: 'Đang giao' },
  { key: OrderStatus.COMPLETED, label: 'Hoàn thành' },
  { key: OrderStatus.CANCELLED, label: 'Đã hủy' },
]

/**
 * Thanh Bộ Lọc Trạng Thái Đơn Hàng (OrderFilterTabs)
 * - Hiển thị badge số lượng đơn cho từng trạng thái
 * - Đồng bộ Centralized Design Tokens
 * - Độ dài < 65 dòng
 */
export default function OrderFilterTabs({
  selectedStatus = 'ALL',
  onSelectStatus,
  counts = {},
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {ORDER_TABS.map((tab) => {
        const isSelected = selectedStatus === tab.key
        const count = counts[tab.key] ?? 0

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelectStatus(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0 ${
              isSelected
                ? 'bg-brand-primary text-surface-bg font-bold shadow-md shadow-brand-primary/10'
                : 'bg-surface-card border border-border-subtle text-text-muted hover:text-text-main hover:border-border-strong'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono leading-tight ${
                isSelected
                  ? 'bg-surface-bg/25 text-surface-bg font-bold'
                  : 'bg-surface-bg text-text-muted border border-border-subtle'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

