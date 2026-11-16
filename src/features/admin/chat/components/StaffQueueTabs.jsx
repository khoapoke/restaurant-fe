import { Clock, Headphones, CheckCircle2 } from 'lucide-react'
import { STAFF_QUEUE_TABS } from '../constants'

export const StaffQueueTabs = ({ activeTab, onChangeTab, waitingCount = 0 }) => {
  const getTabIcon = (tabId) => {
    switch (tabId) {
      case 'WAITING_STAFF':
        return Clock
      case 'STAFF_CONNECTED':
        return Headphones
      case 'CLOSED':
        return CheckCircle2
      default:
        return Headphones
    }
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-bg/70 border-b border-border-subtle overflow-x-auto scrollbar-none">
      {STAFF_QUEUE_TABS.map((tab) => {
        const Icon = getTabIcon(tab.id)
        const isActive = activeTab === tab.id
        const isWaiting = tab.id === 'WAITING_STAFF'

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`flex-1 min-w-[95px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
              isActive
                ? 'bg-surface-card text-brand-primary shadow-xs border border-border-subtle'
                : 'text-text-muted hover:text-text-main hover:bg-surface-card-hover'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{tab.label}</span>
            {isWaiting && waitingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-status-warning/20 text-status-warning border border-status-warning/40">
                {waitingCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default StaffQueueTabs

