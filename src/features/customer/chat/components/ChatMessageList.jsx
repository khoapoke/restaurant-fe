import { useEffect, useRef } from 'react'
import { Bot, User, Headphones, Clock } from 'lucide-react'
import { ChatSenderType, QUICK_PROMPTS } from '../constants'

export const ChatMessageList = ({
  messages = [],
  isBotTyping = false,
  onSelectPrompt,
  sessionStatus,
}) => {
  const scrollRef = useRef(null)

  // Tự động cuộn xuống đáy khi có tin nhắn mới hoặc bot đang gõ
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isBotTyping])

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const showQuickPrompts = messages.length <= 2 && sessionStatus === 'BOT'

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-surface-bg/40 scrollbar-thin scrollbar-thumb-border-subtle"
    >
      {messages.map((msg, index) => {
        const isCustomer = msg.senderType === ChatSenderType.CUSTOMER
        const isBot = msg.senderType === ChatSenderType.BOT
        const isStaff = msg.senderType === ChatSenderType.STAFF

        return (
          <div
            key={msg.messageId || index}
            className={`flex items-end gap-2 ${isCustomer ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar for Bot / Staff */}
            {!isCustomer && (
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-surface-bg text-[11px] font-bold shadow-xs ${
                  isBot
                    ? 'bg-gradient-to-br from-brand-primary to-brand-active'
                    : 'bg-status-info text-white'
                }`}
              >
                {isBot ? <Bot className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
              </div>
            )}

            {/* Message Bubble Container */}
            <div className={`max-w-[78%] space-y-1 ${isCustomer ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[10px] font-semibold text-text-dim">
                  {isCustomer
                    ? 'Bạn'
                    : isBot
                    ? 'Trợ lý T-ResMK'
                    : msg.senderName || 'Nhân viên hỗ trợ'}
                </span>
                <span className="text-[9px] text-text-dim flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>

              {/* Message Content Bubble */}
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                  isCustomer
                    ? 'bg-brand-primary text-surface-bg font-medium rounded-br-none shadow-brand-primary/10'
                    : isStaff
                    ? 'bg-surface-card border border-status-info/30 text-text-main rounded-bl-none'
                    : 'bg-surface-card border border-border-subtle text-text-main rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>

            {/* Avatar for Customer */}
            {isCustomer && (
              <div className="w-7 h-7 rounded-lg bg-surface-card border border-border-subtle flex items-center justify-center text-text-muted shrink-0 text-[11px]">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        )
      })}

      {/* Typing Indicator khi Gemini AI đang phản hồi */}
      {isBotTyping && (
        <div className="flex items-end gap-2 justify-start animate-fade-in">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-primary to-brand-active flex items-center justify-center text-surface-bg shrink-0 shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-surface-card border border-border-subtle p-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 text-brand-primary shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce" />
          </div>
        </div>
      )}

      {/* Quick Prompt Chips */}
      {showQuickPrompts && !isBotTyping && (
        <div className="pt-2 space-y-1.5">
          <p className="text-[10px] text-text-muted font-medium px-1">
            Gợi ý câu hỏi nhanh cho trợ lý:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt(prompt)}
                className="px-2.5 py-1.5 rounded-xl text-[11px] text-text-muted hover:text-brand-primary bg-surface-card hover:bg-surface-card-hover border border-border-subtle hover:border-brand-primary/30 transition-colors text-left cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatMessageList

