/**
 * Constants & Enums cho Admin/Staff Live Chat Support
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

export const STAFF_QUEUE_TABS = [
  {
    id: 'WAITING_STAFF',
    label: 'Chờ tiếp nhận',
    status: ChatSessionStatus.WAITING_STAFF,
  },
  {
    id: 'STAFF_CONNECTED',
    label: 'Đang hỗ trợ',
    status: ChatSessionStatus.STAFF_CONNECTED,
  },
  {
    id: 'CLOSED',
    label: 'Lịch sử đã đóng',
    status: ChatSessionStatus.CLOSED,
  },
]

export const STAFF_CHAT_STATUS_CONFIG = {
  BOT: {
    label: 'Khách đang chat với Bot',
    color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20',
    dotColor: 'bg-brand-primary',
  },
  WAITING_STAFF: {
    label: 'Khách đang chờ tiếp nhận',
    color: 'text-status-warning bg-status-warning/10 border-status-warning/30 animate-pulse font-bold',
    dotColor: 'bg-status-warning',
  },
  STAFF_CONNECTED: {
    label: 'Đang hỗ trợ',
    color: 'text-status-success bg-status-success/10 border-status-success/30 font-bold',
    dotColor: 'bg-status-success',
  },
  CLOSED: {
    label: 'Đã đóng phiên',
    color: 'text-text-muted bg-surface-subtle border-border-subtle',
    dotColor: 'bg-text-dim',
  },
}
