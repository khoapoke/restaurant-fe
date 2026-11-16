/**
 * Constants & Enums cho Module Chat & Trợ lý ảo (Chatbot)
 * Tham chiếu đặc tả: docs/modules/chat.md
 */

export const ChatSessionStatus = {
  BOT: 'BOT',
  WAITING_STAFF: 'WAITING_STAFF',
  STAFF_CONNECTED: 'STAFF_CONNECTED',
  CLOSED: 'CLOSED',
}

export const ChatSenderType = {
  CUSTOMER: 'CUSTOMER',
  BOT: 'BOT',
  STAFF: 'STAFF',
}

export const CHAT_STATUS_CONFIG = {
  BOT: {
    label: 'Trợ lý ảo AI',
    color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/30',
    dotColor: 'bg-brand-primary',
  },
  WAITING_STAFF: {
    label: 'Đang đợi nhân viên...',
    color: 'text-status-warning bg-status-warning/10 border-status-warning/30 animate-pulse',
    dotColor: 'bg-status-warning',
  },
  STAFF_CONNECTED: {
    label: 'Nhân viên hỗ trợ',
    color: 'text-status-success bg-status-success/10 border-status-success/30',
    dotColor: 'bg-status-success',
  },
  CLOSED: {
    label: 'Đã kết thúc',
    color: 'text-text-muted bg-surface-card border-border-subtle',
    dotColor: 'bg-text-dim',
  },
}

export const QUICK_PROMPTS = [
  'Gợi ý món bán chạy hôm nay',
  'Quán có món nào không chứa đậu phộng?',
  'Kiểm tra đơn hàng gần nhất của tôi',
  'Địa chỉ và giờ mở cửa nhà hàng?',
]

