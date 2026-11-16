import { Bot } from 'lucide-react'

export const ChatFloatingButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-primary to-brand-hover text-surface-bg font-bold shadow-xl shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all duration-300 hover:scale-105 cursor-pointer"
    >
      <div className="relative">
        <Bot className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-status-success ring-2 ring-surface-bg animate-pulse" />
      </div>
      <span className="text-xs tracking-wide">Trợ lý T-ResMK</span>
    </button>
  )
}

export default ChatFloatingButton

