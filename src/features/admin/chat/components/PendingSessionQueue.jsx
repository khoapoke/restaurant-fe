import { Clock, RefreshCw, UserCheck, MessageSquare, Search } from 'lucide-react'
import { STAFF_CHAT_STATUS_CONFIG, ChatSessionStatus } from '../constants'
import StaffQueueTabs from './StaffQueueTabs'
import Button from '../../../../components/ui/Button'

export const PendingSessionQueue = ({
  sessions = [],
  activeSessionId,
  activeTab = 'WAITING_STAFF',
  onChangeTab,
  waitingCount = 0,
  searchQuery = '',
  onSearchChange,
  onSelectSession,
  onAssign,
  onRefresh,
  loading = false,
  isAssigning = false,
}) => {
  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'WAITING_STAFF':
        return {
          title: 'Không có khách chờ tiếp nhận',
          desc: 'Khi khách hàng bấm "Gặp nhân viên hỗ trợ", phiên sẽ xuất hiện ngay tại đây.',
        }
      case 'STAFF_CONNECTED':
        return {
          title: 'Chưa có phiên đang hỗ trợ',
          desc: 'Các phiên bạn đã bấm "Tiếp nhận" sẽ xuất hiện ở đây để tiếp tục trao đổi.',
        }
      case 'CLOSED':
        return {
          title: 'Chưa có phiên đã đóng',
          desc: 'Các phiên hỗ trợ sau khi hoàn tất sẽ được lưu trữ tại tab này.',
        }
      default:
        return {
          title: 'Không có phiên nào',
          desc: 'Danh sách hiện tại đang trống.',
        }
    }
  }

  const emptyInfo = getEmptyMessage()

  return (
    <div className="w-full lg:w-80 sm:w-96 bg-surface-card border border-border-subtle rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-xs">
      {/* Header with Title & Refresh */}
      <div className="p-3.5 border-b border-border-subtle flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-main">Hàng đợi Trực Chat</h3>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          title="Làm mới danh sách"
          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card-hover transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 3 Tabs Selection */}
      <StaffQueueTabs
        activeTab={activeTab}
        onChangeTab={onChangeTab}
        waitingCount={waitingCount}
      />

      {/* Search Bar */}
      <div className="p-2 border-b border-border-subtle bg-surface-bg/30">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo tên khách hoặc tiêu đề..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface-input border border-border-subtle rounded-lg text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sessions.length === 0 ? (
          <div className="py-12 text-center text-text-muted space-y-2">
            <MessageSquare className="w-8 h-8 text-text-dim mx-auto" />
            <p className="text-xs font-semibold text-text-main">{emptyInfo.title}</p>
            <p className="text-[11px] text-text-dim max-w-[210px] mx-auto leading-relaxed">
              {emptyInfo.desc}
            </p>
          </div>
        ) : (
          sessions.map((sess) => {
            const id = sess.sessionId || sess.ma_phien
            const isSelected = id === activeSessionId
            const status = sess.status || sess.trang_thai || ChatSessionStatus.WAITING_STAFF
            const statusCfg = STAFF_CHAT_STATUS_CONFIG[status] || STAFF_CHAT_STATUS_CONFIG.WAITING_STAFF
            const customerName = sess.customerName || sess.customer?.fullName || `Khách #${sess.customerId || id}`
            const latestMsg = sess.latestMessage?.content || sess.title || 'Trao đổi với khách hàng'
            const timeStr = formatTime(sess.createdAt || sess.thoi_gian_tao)
            const isWaiting = status === ChatSessionStatus.WAITING_STAFF

            return (
              <div
                key={id}
                onClick={() => onSelectSession(sess)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                  isSelected
                    ? 'bg-brand-primary/10 border-brand-primary/40 shadow-xs'
                    : 'bg-surface-bg/50 border-border-subtle hover:border-border-strong hover:bg-surface-card-hover'
                }`}
              >
                {/* Customer name & time */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-main truncate">
                    {customerName}
                  </span>
                  <span className="text-[10px] text-text-dim flex items-center gap-1 font-mono shrink-0">
                    <Clock className="w-3 h-3" />
                    {timeStr}
                  </span>
                </div>

                {/* Message preview */}
                <p className="text-[11px] text-text-muted truncate line-clamp-1">
                  {latestMsg}
                </p>

                {/* Footer: Status badge & Action */}
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] border ${statusCfg.color}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                    <span>{statusCfg.label}</span>
                  </span>

                  {isWaiting && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={UserCheck}
                      isLoading={isAssigning && isSelected}
                      onClick={(e) => {
                        e.stopPropagation()
                        onAssign(id)
                      }}
                      className="text-[10px] py-1 px-2.5 h-auto"
                    >
                      Tiếp nhận
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default PendingSessionQueue
