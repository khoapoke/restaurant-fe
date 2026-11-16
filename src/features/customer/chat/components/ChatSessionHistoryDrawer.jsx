import { Plus, MessageSquare, ArrowLeft } from 'lucide-react'
import { CHAT_STATUS_CONFIG, ChatSessionStatus } from '../constants'

export const ChatSessionHistoryDrawer = ({
  isOpen,
  onClose,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onCreateNewSession,
  loading = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="absolute inset-0 z-20 bg-surface-card flex flex-col animate-fade-in">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card-hover transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h4 className="text-xs font-bold text-text-main">Lịch sử trò chuyện</h4>
        </div>

        <button
          type="button"
          onClick={() => {
            onCreateNewSession()
            onClose()
          }}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-surface-bg bg-brand-primary hover:bg-brand-hover transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo mới</span>
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
        {sessions.length === 0 ? (
          <div className="py-12 text-center text-text-muted space-y-2">
            <MessageSquare className="w-8 h-8 text-text-dim mx-auto" />
            <p className="text-xs">Chưa có cuộc trò chuyện nào trước đây</p>
          </div>
        ) : (
          sessions.map((sess) => {
            const id = sess.sessionId
            const isActive = id === activeSessionId
            const status = sess.status || ChatSessionStatus.BOT
            const statusCfg = CHAT_STATUS_CONFIG[status] || CHAT_STATUS_CONFIG.BOT

            return (
              <div
                key={id}
                onClick={() => {
                  onSelectSession(id)
                  onClose()
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1 ${
                  isActive
                    ? 'bg-brand-primary/10 border-brand-primary/40'
                    : 'bg-surface-bg/60 border-border-subtle hover:border-border-strong hover:bg-surface-card-hover'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-semibold text-text-main truncate">
                    {sess.title || `Hội thoại #${id}`}
                  </h5>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold border shrink-0 ${statusCfg.color}`}
                  >
                    <span className={`w-1 h-1 rounded-full ${statusCfg.dotColor}`} />
                    <span>{statusCfg.label}</span>
                  </span>
                </div>

                <p className="text-[11px] text-text-muted truncate">
                  {sess.latestMessage?.content || 'Chưa có tin nhắn'}
                </p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ChatSessionHistoryDrawer

