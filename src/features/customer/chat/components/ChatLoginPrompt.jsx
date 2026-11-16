import { Bot, LogIn, X } from 'lucide-react'

export const ChatLoginPrompt = ({ onClose, onLogin }) => {
  return (
    <div className="flex-1 flex flex-col justify-between p-6 text-center select-none">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card-hover transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 my-auto">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center mx-auto shadow-lg shadow-brand-primary/10">
          <Bot className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-text-main">
            Trợ lý Ảo Nhà hàng T-ResMK
          </h3>
          <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
            Vui lòng đăng nhập tài khoản thực khách để bắt đầu trò chuyện với AI, tra cứu dị ứng và trạng thái đơn hàng của bạn.
          </p>
        </div>
        <button
          type="button"
          onClick={onLogin}
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-surface-bg bg-brand-primary hover:bg-brand-hover transition-colors shadow-md shadow-brand-primary/20 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Đăng nhập ngay</span>
        </button>
      </div>

      <p className="text-[10px] text-text-dim">
        © T-ResMK Fine Dining Assistant
      </p>
    </div>
  )
}

export default ChatLoginPrompt

