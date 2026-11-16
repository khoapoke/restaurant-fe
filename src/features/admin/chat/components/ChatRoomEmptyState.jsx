import { MessageSquare } from 'lucide-react'

export const ChatRoomEmptyState = () => {
  return (
    <div className="flex-1 bg-surface-card border border-border-subtle rounded-2xl flex flex-col items-center justify-center p-8 text-center text-text-muted space-y-3">
      <div className="w-16 h-16 rounded-2xl bg-surface-bg border border-border-subtle flex items-center justify-center text-text-dim">
        <MessageSquare className="w-8 h-8" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-text-main">Chưa chọn phiên trò chuyện</h4>
        <p className="text-xs text-text-muted max-w-xs mx-auto mt-1 leading-relaxed">
          Bấm chọn một khách hàng từ hàng đợi bên trái để xem nội dung trao đổi hoặc bấm "Tiếp nhận" để bắt đầu tư vấn.
        </p>
      </div>
    </div>
  )
}

export default ChatRoomEmptyState

