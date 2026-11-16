import { Bot, History, Headphones, X, RotateCw, XCircle } from 'lucide-react'
import { CHAT_STATUS_CONFIG, ChatSessionStatus } from '../constants'

export const ChatWindowHeader = ({
  session,
  onToggleHistory,
  onRequestStaff,
  onEndSession,
  onClose,
  isRequestingStaff = false,
  isEndingSession = false,
}) => {
  const status = session?.status || ChatSessionStatus.BOT
  const statusCfg = CHAT_STATUS_CONFIG[status] || CHAT_STATUS_CONFIG.BOT
  const isBotMode = status === ChatSessionStatus.BOT
  const isClosed = status === ChatSessionStatus.CLOSED

  return (
    <div className="p-3.5 bg-surface-card border-b border-border-subtle flex items-center justify-between shrink-0 select-none">
      {/* Bot Identity & Status */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-active flex items-center justify-center text-surface-bg font-bold shrink-0 shadow-md shadow-brand-primary/20">
          <Bot className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-text-main truncate">
              Trợ lý T-ResMK
            </h4>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold border ${statusCfg.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
              <span>{statusCfg.label}</span>
            </span>
          </div>
          <p className="text-[10px] text-text-muted truncate">
            {isBotMode
              ? 'Tư vấn món ăn & dịch vụ tự động'
              : status === ChatSessionStatus.WAITING_STAFF
              ? 'Hệ thống đang kết nối nhân viên...'
              : status === ChatSessionStatus.STAFF_CONNECTED
              ? `Nhân viên ${session?.staff?.fullName || 'T-ResMK'} đang hỗ trợ`
              : 'Phiên trò chuyện đã kết thúc'}
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Human Handoff button */}
        {isBotMode && (
          <button
            type="button"
            onClick={onRequestStaff}
            disabled={isRequestingStaff}
            title="Gặp nhân viên hỗ trợ trực tiếp"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isRequestingStaff ? (
              <RotateCw className="w-3 h-3 animate-spin" />
            ) : (
              <Headphones className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">Gặp nhân viên</span>
          </button>
        )}

        {/* End / Close Session Button */}
        {!isClosed && session?.sessionId && (
          <button
            type="button"
            onClick={onEndSession}
            disabled={isEndingSession}
            title="Kết thúc phiên trò chuyện này"
            className="p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-status-error/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isEndingSession ? (
              <RotateCw className="w-4 h-4 animate-spin text-status-error" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </button>
        )}

        {/* History Button */}
        <button
          type="button"
          onClick={onToggleHistory}
          title="Lịch sử cuộc trò chuyện"
          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card-hover transition-colors cursor-pointer"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Minimize Button */}
        <button
          type="button"
          onClick={onClose}
          title="Thu nhỏ cửa sổ"
          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card-hover transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default ChatWindowHeader
