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
}

export const KITCHEN_STATUS_META = {
  [KitchenStatus.DRAFT]: { label: 'Chưa gửi bếp', tone: 'bg-stone-100 text-stone-700' },
  [KitchenStatus.SENT]: { label: 'Mới gửi', tone: 'bg-amber-100 text-amber-800' },
  [KitchenStatus.QUEUED]: { label: 'Đã nhận', tone: 'bg-sky-100 text-sky-800' },
  [KitchenStatus.PREPARING]: { label: 'Đang chế biến', tone: 'bg-[#6f1d32]/10 text-[#6f1d32]' },
  [KitchenStatus.READY]: { label: 'Sẵn sàng', tone: 'bg-emerald-100 text-emerald-800' },
  [KitchenStatus.SERVED]: { label: 'Đã phục vụ', tone: 'bg-stone-200 text-stone-700' },
}

export const KITCHEN_NEXT_ACTION = {
  [KitchenStatus.SENT]: { status: KitchenStatus.QUEUED, label: 'NHẬN MÓN' },
  [KitchenStatus.QUEUED]: { status: KitchenStatus.PREPARING, label: 'BẮT ĐẦU NẤU' },
  [KitchenStatus.PREPARING]: { status: KitchenStatus.READY, label: 'BÁO SẴN SÀNG' },
  [KitchenStatus.READY]: { status: KitchenStatus.SERVED, label: 'ĐÃ PHỤC VỤ' },
}

export const formatMoney = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
