import { BellRing, CreditCard, Droplets, HandPlatter, MessageSquareMore, Sparkles } from 'lucide-react'

export const VisitStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
}

export const DineItemStatus = {
  SENT: 'SENT',
  QUEUED: 'QUEUED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
}

/** Bốn bước khách nhìn thấy trên timeline món. */
export const TRACK_STEPS = [
  { key: 'SENT', label: 'Đã gửi bếp' },
  { key: 'PREPARING', label: 'Đang chế biến' },
  { key: 'READY', label: 'Hoàn thành' },
  { key: 'SERVED', label: 'Đã phục vụ' },
]

export const ITEM_STATUS_META = {
  SENT: { step: 0, label: 'Đã gửi bếp', tone: 'bg-[#f3e7d3] text-[#6b4a12] border-[#d9bd8b]' },
  QUEUED: { step: 0, label: 'Bếp đã nhận', tone: 'bg-[#f3e7d3] text-[#6b4a12] border-[#d9bd8b]' },
  PREPARING: { step: 1, label: 'Đang chế biến', tone: 'bg-[#6f1d32]/10 text-[#6f1d32] border-[#6f1d32]/30' },
  READY: { step: 2, label: 'Hoàn thành', tone: 'bg-[#e3f1e6] text-[#14532d] border-[#9fcaa9]' },
  SERVED: { step: 3, label: 'Đã phục vụ', tone: 'bg-[#ece6dd] text-[#3d2f2a] border-[#cfc3b4]' },
  CANCELLED: { step: -1, label: 'Đã hủy', tone: 'bg-[#fbeaea] text-[#8a1c1c] border-[#efb7b7]' },
  REJECTED: { step: -1, label: 'Bếp từ chối', tone: 'bg-[#fbeaea] text-[#8a1c1c] border-[#efb7b7]' },
}

export const SERVICE_OPTIONS = [
  { type: 'CALL_STAFF', label: 'Gọi nhân viên', hint: 'Nhân viên đến bàn ngay', icon: BellRing },
  { type: 'WATER', label: 'Xin thêm nước', hint: 'Nước lọc, trà đá', icon: Droplets },
  { type: 'CUTLERY', label: 'Xin thêm dụng cụ', hint: 'Bát, đũa, khăn giấy', icon: HandPlatter },
  { type: 'CLEAN_TABLE', label: 'Dọn bàn', hint: 'Thu dọn bát đĩa đã dùng', icon: Sparkles },
  { type: 'PAYMENT', label: 'Yêu cầu thanh toán', hint: 'Nhân viên lập hóa đơn', icon: CreditCard },
  { type: 'OTHER', label: 'Yêu cầu khác', hint: 'Ghi chú ngắn cho nhân viên', icon: MessageSquareMore },
]

export const SERVICE_STATUS_META = {
  NEW: { label: 'Đã gửi · chờ nhân viên', tone: 'text-[#6b4a12] bg-[#f3e7d3]' },
  ACKNOWLEDGED: { label: 'Nhân viên đang đến', tone: 'text-[#6f1d32] bg-[#6f1d32]/10' },
  COMPLETED: { label: 'Đã hoàn tất', tone: 'text-[#14532d] bg-[#e3f1e6]' },
  CANCELLED: { label: 'Đã hủy', tone: 'text-[#625a55] bg-[#ece6dd]' },
}

export const ALLERGEN_LABEL = {
  PEANUT: 'Đậu phộng',
  SHELLFISH: 'Hải sản có vỏ',
  DAIRY: 'Sữa',
  EGG: 'Trứng',
  GLUTEN: 'Gluten',
  SOY: 'Đậu nành',
  SESAME: 'Mè',
  FISH: 'Cá',
}

export const PAYMENT_METHOD_LABEL = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER_QR: 'Chuyển khoản QR',
}

export const FALLBACK_DISH_IMAGE = '/images/menu/pho-bo.jpg'

export const MAX_QUANTITY = 20
export const MAX_NOTE_LENGTH = 120

export const formatVnd = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0)

export const formatClock = (value) =>
  value ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''
