/**
 * Constants & Enums cho Quản lý Bàn ăn & Đặt bàn (Admin)
 * Tham chiếu docs/system_conventions.md và docs/modules/reservation.md
 * 100% Centralized Design Tokens
 */

export const TableStatus = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
}

export const TABLE_STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Bàn trống',
    color: 'text-status-success bg-status-success/10 border-status-success/30',
    dotColor: 'bg-status-success',
    cardBorder: 'border-status-success/30 hover:border-status-success/60',
  },
  RESERVED: {
    label: 'Đã đặt trước',
    color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/30',
    dotColor: 'bg-brand-primary',
    cardBorder: 'border-brand-primary/30 hover:border-brand-primary/60',
  },
  OCCUPIED: {
    label: 'Đang có khách',
    color: 'text-status-info bg-status-info/10 border-status-info/30',
    dotColor: 'bg-status-info',
    cardBorder: 'border-status-info/30 hover:border-status-info/60',
  },
  MAINTENANCE: {
    label: 'Đang bảo trì',
    color: 'text-status-error bg-status-error/10 border-status-error/30',
    dotColor: 'bg-status-error',
    cardBorder: 'border-status-error/30 hover:border-status-error/60',
  },
}

export const ReservationStatus = {
  PENDING_DEPOSIT: 'PENDING_DEPOSIT',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  OCCUPIED: 'OCCUPIED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
}

export const RESERVATION_STATUS_CONFIG = {
  PENDING_DEPOSIT: {
    label: 'Chờ đặt cọc',
    color: 'text-status-warning bg-status-warning/10 border-status-warning/30 font-semibold animate-pulse',
  },
  PENDING: {
    label: 'Chờ duyệt',
    color: 'text-status-warning bg-status-warning/10 border-status-warning/30',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-status-info bg-status-info/10 border-status-info/30',
  },
  OCCUPIED: {
    label: 'Đang có khách',
    color: 'text-brand-hover bg-brand-primary/10 border-brand-primary/30 font-bold',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-status-success bg-status-success/10 border-status-success/30',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-text-muted bg-surface-elevated border-border-strong',
  },
  REJECTED: {
    label: 'Đã từ chối',
    color: 'text-status-error bg-status-error/10 border-status-error/30',
  },
}
