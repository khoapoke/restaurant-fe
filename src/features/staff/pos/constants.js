export const TableStatus = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  OCCUPIED: 'OCCUPIED',
  CLEANING: 'CLEANING',
  MAINTENANCE: 'MAINTENANCE',
}

export const TABLE_STATUS_META = {
  [TableStatus.AVAILABLE]: {
    label: 'Sẵn sàng',
    dot: 'bg-emerald-600',
    card: 'border-emerald-700/25 bg-emerald-50/60',
  },
  [TableStatus.RESERVED]: {
    label: 'Đã đặt',
    dot: 'bg-amber-500',
    card: 'border-amber-700/25 bg-amber-50/60',
  },
  [TableStatus.OCCUPIED]: {
    label: 'Đang phục vụ',
    dot: 'bg-[#6f1d32]',
    card: 'border-[#6f1d32]/35 bg-[#6f1d32]/5',
  },
  [TableStatus.CLEANING]: {
    label: 'Chờ vệ sinh',
    dot: 'bg-sky-600',
    card: 'border-sky-700/25 bg-sky-50/60',
  },
  [TableStatus.MAINTENANCE]: {
    label: 'Bảo trì',
    dot: 'bg-stone-500',
    card: 'border-stone-400/35 bg-stone-100/70',
  },
}

export const KitchenStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  QUEUED: 'QUEUED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
}

export const KITCHEN_STATUS_META = {
  [KitchenStatus.DRAFT]: { label: 'Chưa gửi bếp', tone: 'bg-stone-100 text-stone-700' },
  [KitchenStatus.SENT]: { label: 'Mới gửi', tone: 'bg-amber-100 text-amber-800' },
  [KitchenStatus.QUEUED]: { label: 'Đã nhận', tone: 'bg-sky-100 text-sky-800' },
  [KitchenStatus.PREPARING]: { label: 'Đang chế biến', tone: 'bg-[#6f1d32]/10 text-[#6f1d32]' },
  [KitchenStatus.READY]: { label: 'Sẵn sàng', tone: 'bg-emerald-100 text-emerald-800' },
  [KitchenStatus.SERVED]: { label: 'Đã phục vụ', tone: 'bg-stone-200 text-stone-700' },
  [KitchenStatus.CANCELLED]: { label: 'Đã hủy', tone: 'bg-red-50 text-red-800' },
  [KitchenStatus.REJECTED]: { label: 'Bếp từ chối', tone: 'bg-red-50 text-red-800' },
}

/** Lý do hủy/đổi/làm lại món (ItemVoidReason). */
export const VOID_REASONS = [
  { value: 'ORDER_ENTRY_ERROR', label: 'Nhân viên gọi nhầm', restaurantFault: true },
  { value: 'CUSTOMER_CHANGED_MIND', label: 'Khách đổi ý', restaurantFault: false },
  { value: 'OUT_OF_STOCK', label: 'Hết nguyên liệu', restaurantFault: true },
  { value: 'RESTAURANT_MISTAKE', label: 'Bếp làm sai', restaurantFault: true },
  { value: 'DAMAGED', label: 'Món hỏng, đổ vỡ', restaurantFault: true },
  { value: 'NOT_SERVED', label: 'Khách chưa nhận được món', restaurantFault: true },
]

export const KITCHEN_REJECT_REASONS = VOID_REASONS.filter((reason) => ['OUT_OF_STOCK', 'RESTAURANT_MISTAKE', 'DAMAGED'].includes(reason.value))
export const REMAKE_REASONS = VOID_REASONS.filter((reason) => ['RESTAURANT_MISTAKE', 'DAMAGED', 'NOT_SERVED', 'ORDER_ENTRY_ERROR'].includes(reason.value))

export const LINE_TYPE_LABEL = { REMAKE: 'Làm lại (không tính tiền)', EXCHANGE: 'Món đổi' }

/** Món đã bắt đầu chế biến: hủy cần quản lý duyệt (ADR-024). */
export const COOKED_STATUSES = [KitchenStatus.PREPARING, KitchenStatus.READY, KitchenStatus.SERVED]

export const APPROVAL_STATUS_LABEL = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', CANCELLED: 'Đã rút' }

/** Nhãn thao tác trong nhật ký (NHAT_KY_THAO_TAC.hanh_dong). */
export const AUDIT_ACTION_LABEL = {
  SESSION_OPENED: 'Mở phiên',
  SESSION_CANCELLED: 'Hủy phiên',
  SESSION_GUEST_COUNT_CHANGED: 'Đổi số khách',
  SESSION_TABLES_MOVED: 'Chuyển bàn',
  SESSION_TABLES_MERGED: 'Ghép bàn',
  SESSION_WRITTEN_OFF: 'Ghi nhận thất thu',
  ITEM_VOIDED: 'Hủy món',
  ITEM_VOIDED_AFTER_COOKING: 'Hủy món đã chế biến',
  ITEM_CHARGE_WAIVED: 'Miễn tiền món',
  ITEM_REJECTED_BY_KITCHEN: 'Bếp từ chối món',
  DISH_MARKED_SOLD_OUT: 'Báo hết món',
  ITEM_REMADE: 'Làm lại món',
  ITEM_EXCHANGED: 'Đổi món',
  ITEM_SPLIT: 'Tách dòng món',
  KITCHEN_STEP_UNDONE: 'Hoàn tác bước bếp',
  INVOICE_VERSION_VOIDED: 'Hủy phiên bản hóa đơn',
  POS_PAYMENT_RECORDED: 'Thu tiền tại quầy',
  PAYMENT_TRANSFER_CONFIRMED: 'Xác nhận chuyển khoản',
  PAYMENT_REFUND_RECORDED: 'Ghi nhận đã hoàn tiền',
  PAYMENT_ALLOCATED_MANUALLY: 'Phân bổ tiền thủ công',
  PAYMENT_RECONCILED: 'Đối soát',
  SESSION_CLOSED: 'Đóng phiên',
  APPROVAL_REQUESTED: 'Gửi yêu cầu duyệt',
  APPROVAL_APPROVED: 'Quản lý duyệt',
  APPROVAL_REJECTED: 'Quản lý từ chối',
  APPROVAL_WITHDRAWN: 'Rút yêu cầu duyệt',
  RESERVATION_SEATED: 'Nhận khách đặt trước',
  RESERVATION_EXTENDED: 'Gia hạn giữ bàn',
  RESERVATION_NO_SHOW: 'Khách không đến',
  RESERVATION_EXPIRED: 'Hết hạn chờ xác nhận',
  RESERVATION_CONFIRMED: 'Xác nhận đặt bàn',
  RESERVATION_CANCELLED: 'Hủy đặt bàn',
  RESERVATION_REJECTED: 'Từ chối đặt bàn',
  RESERVATION_EDITED: 'Sửa đặt bàn',
  RESERVATION_UPDATED: 'Khách sửa đặt bàn',
  ORDER_STATUS_CHANGED: 'Đổi trạng thái đơn',
  ORDER_FULFILLMENT_CHANGED: 'Cập nhật giao nhận',
  ORDER_CANCELLED: 'Hủy đơn',
  ORDER_RECIPIENT_CHANGED: 'Sửa người nhận',
}

export const KITCHEN_NEXT_ACTION = {
  [KitchenStatus.SENT]: { status: KitchenStatus.QUEUED, label: 'NHẬN MÓN' },
  [KitchenStatus.QUEUED]: { status: KitchenStatus.PREPARING, label: 'BẮT ĐẦU NẤU' },
  [KitchenStatus.PREPARING]: { status: KitchenStatus.READY, label: 'BÁO SẴN SÀNG' },
  [KitchenStatus.READY]: { status: KitchenStatus.SERVED, label: 'ĐÃ PHỤC VỤ' },
}

export const formatMoney = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)

/** Tín hiệu cần chú ý của một bàn, dùng cho cả thẻ bàn và bộ lọc "Cần xử lý". */
export const tableSignals = (table) => {
  const live = table.activeSession?.live
  return {
    checkIn: !!table.pendingCheckIn,
    newRequests: live?.newRequests || 0,
    openRequests: live?.openRequests || 0,
    payment: !!live?.paymentRequested || table.activeSession?.status === 'AWAITING_PAYMENT',
    late: live?.lateCount || 0,
    needsAttention: !!table.pendingCheckIn || (live?.newRequests || 0) > 0 || (live?.lateCount || 0) > 0 || !!live?.paymentRequested,
  }
}

/** Mức SLA của một món trên KDS: normal / warning / late (ngưỡng lấy từ config backend). */
export const kitchenSlaLevel = (item, minutes, sla) => {
  if (['READY', 'SERVED'].includes(item.status)) return 'normal'
  if (minutes >= sla.lateMinutes) return 'late'
  if (minutes >= sla.warningMinutes) return 'warning'
  return 'normal'
}
