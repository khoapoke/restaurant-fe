import { useState, useEffect, useRef } from 'react'
import { User, Bot, Headphones, Send, UserCheck, CheckCircle2, Clock } from 'lucide-react'
import { STAFF_CHAT_STATUS_CONFIG, ChatSessionStatus, ChatSenderType } from '../constants'
import Button from '../../../../components/ui/Button'

export const StaffChatRoom = ({
  session,
  onSendMessage,
  onAssign,
  onCloseSession,
  isSending = false,
  isAssigning = false,
  isClosing = false,
}) => {
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef(null)

  const activeSession = session?.data ?? session
  const messages = activeSession?.messages || []
  const status = activeSession?.status || ChatSessionStatus.WAITING_STAFF
  const statusCfg = STAFF_CHAT_STATUS_CONFIG[status] || STAFF_CHAT_STATUS_CONFIG.WAITING_STAFF
  const isConnected = status === ChatSessionStatus.STAFF_CONNECTED
  const isWaiting = status === ChatSessionStatus.WAITING_STAFF
  const isClosed = status === ChatSessionStatus.CLOSED

  const customerName =
    activeSession?.customerName ||
    activeSession?.customer?.fullName ||
    `Khách #${activeSession?.customerId || activeSession?.sessionId}`

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (e) => {
    e?.preventDefault()
    const content = inputText.trim()
    if (!content || !isConnected || isSending) return
    onSendMessage(content)
    setInputText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className="flex-1 bg-surface-card border border-border-subtle rounded-2xl flex flex-col overflow-hidden shadow-xs">
      {/* Room Header */}
      <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-bg border border-border-subtle flex items-center justify-center text-text-muted shrink-0">
            <User className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-main">{customerName}</h3>
              <span className="text-[10px] font-mono text-text-dim">
                #{activeSession.sessionId}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] border ${statusCfg.color}`}
              >
                <span className={`w-1 h-1 rounded-full ${statusCfg.dotColor}`} />
                <span>{statusCfg.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isWaiting && (
            <Button
              variant="primary"
              size="sm"
              icon={UserCheck}
              isLoading={isAssigning}
              onClick={() => onAssign(activeSession.sessionId)}
            >
              Tiếp nhận hỗ trợ
            </Button>
          )}

          {isConnected && (
            <Button
              variant="outline"
              size="sm"
              icon={CheckCircle2}
              isLoading={isClosing}
              onClick={() => onCloseSession(activeSession.sessionId)}
              className="text-xs text-status-success hover:bg-status-success/10 border-status-success/30"
            >
              Hoàn tất & Đóng phiên
            </Button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-surface-bg/40 scrollbar-thin"
      >
        {messages.map((msg, index) => {
          const isStaff = msg.senderType === ChatSenderType.STAFF
          const isBot = msg.senderType === ChatSenderType.BOT
          const isCustomer = msg.senderType === ChatSenderType.CUSTOMER

          return (
            <div
              key={msg.messageId || index}
              className={`flex items-end gap-2 ${isStaff ? 'justify-end' : 'justify-start'}`}
            >
              {!isStaff && (
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-surface-bg text-[10px] font-bold ${
                    isBot ? 'bg-brand-primary text-surface-bg' : 'bg-surface-card border border-border-subtle text-text-muted'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
              )}

              <div className={`max-w-[75%] space-y-1 ${isStaff ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[10px] font-semibold text-text-dim">
                    {isStaff ? 'Bạn (Nhân viên)' : isBot ? 'Chatbot AI' : customerName}
                  </span>
                  <span className="text-[9px] text-text-dim flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTime(msg.createdAt)}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    isStaff
                      ? 'bg-brand-primary text-surface-bg font-medium rounded-br-none'
                      : isBot
                      ? 'bg-surface-card border border-brand-primary/20 text-text-body rounded-bl-none'
                      : 'bg-surface-card border border-border-subtle text-text-main rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>

              {isStaff && (
                <div className="w-7 h-7 rounded-lg bg-status-info text-white flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Input Area / Status Notification */}
      {isConnected ? (
        <form
          onSubmit={handleSend}
          className="p-3 bg-surface-card border-t border-border-subtle flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Nhập phản hồi trực tiếp cho khách hàng (Enter để gửi)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            maxLength={2000}
            className="flex-1 bg-surface-input border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-9 h-9 rounded-xl bg-brand-primary hover:bg-brand-hover text-surface-bg flex items-center justify-center shrink-0 shadow-md shadow-brand-primary/20 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : isWaiting ? (
        <div className="p-3.5 bg-status-warning/10 border-t border-status-warning/20 text-center text-xs text-status-warning flex items-center justify-center gap-2">
          <span>Phiên này đang chờ tiếp nhận. Bấm</span>
          <button
            type="button"
            onClick={() => onAssign(activeSession.sessionId)}
            className="underline font-bold hover:text-brand-primary cursor-pointer"
          >
            "Tiếp nhận hỗ trợ"
          </button>
          <span>để bắt đầu trả lời khách hàng.</span>
        </div>
      ) : (
        <div className="p-3.5 bg-surface-bg border-t border-border-subtle text-center text-xs text-text-dim">
          Phiên hỗ trợ này đã được đóng.
        </div>
      )}
    </div>
  )
}

export default StaffChatRoom

