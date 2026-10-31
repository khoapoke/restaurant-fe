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
                ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                : 'bg-gray-900/60 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
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

