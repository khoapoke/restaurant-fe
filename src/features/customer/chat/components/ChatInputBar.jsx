import { useState } from 'react'
import { Send } from 'lucide-react'

export const ChatInputBar = ({ onSendMessage, disabled, isClosed }) => {
  const [text, setText] = useState('')

  const handleSend = (e) => {
    e?.preventDefault()
    const content = text.trim()
    if (!content || disabled || isClosed) return
    onSendMessage(content)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <form
      onSubmit={handleSend}
      className="p-3 bg-surface-card border-t border-border-subtle flex items-center gap-2 shrink-0"
    >
      <input
        type="text"
        placeholder={
          isClosed
            ? 'Phiên trò chuyện này đã kết thúc'
            : 'Nhập câu hỏi cho trợ lý T-ResMK...'
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isClosed}
        maxLength={2000}
        className="flex-1 bg-surface-input border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      />

      <button
        type="submit"
        disabled={!text.trim() || disabled || isClosed}
        title="Gửi tin nhắn (Enter)"
        className="w-9 h-9 rounded-xl bg-brand-primary hover:bg-brand-hover text-surface-bg flex items-center justify-center shrink-0 transition-colors shadow-md shadow-brand-primary/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}

export default ChatInputBar

