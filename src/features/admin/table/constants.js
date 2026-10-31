/**
 * Constants & Enums cho Quản lý Bàn ăn & Đặt bàn (Admin)
 * Tham chiếu docs/api/enums.md và docs/api/admin-table-report.md
 */

export const TableStatus = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  OCCUPIED: 'OCCUPIED',
}

export const TABLE_STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Bàn trống',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    cardBorder: 'border-emerald-500/30 hover:border-emerald-500/60',
  },
  RESERVED: {
    label: 'Đã đặt trước',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    dotColor: 'bg-amber-500',
    cardBorder: 'border-amber-500/30 hover:border-amber-500/60',
  },
  OCCUPIED: {
    label: 'Đang có khách',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    dotColor: 'bg-purple-500',
    cardBorder: 'border-purple-500/30 hover:border-purple-500/60',
  },
}

export const ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
}

export const RESERVATION_STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ duyệt',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-gray-400 bg-gray-800 border-gray-700',
  },
  REJECTED: {
    label: 'Đã từ chối',
    color: 'text-red-400 bg-red-500/10 border-red-500/30',
  },
}

