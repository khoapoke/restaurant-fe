/**
 * Constants & Enums cho Quản lý Tài khoản (Admin)
 * Tham chiếu docs/api/enums.md và docs/api/admin-account.md
 */

export const AccountStatus = {
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
}

export const ACCOUNT_STATUS_CONFIG = {
  ACTIVE: {
    label: 'Đang hoạt động',
    color: 'text-status-success bg-status-success/10 border-status-success/30',
    dotColor: 'bg-status-success',
  },
  LOCKED: {
    label: 'Đã bị khóa',
    color: 'text-status-error bg-status-error/10 border-status-error/30',
    dotColor: 'bg-status-error',
  },
}

export const Role = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
}

export const ROLE_CONFIG = {
  ADMIN: {
    label: 'Quản trị viên',
    color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/30 font-bold',
  },
  CUSTOMER: {
    label: 'Khách hàng',
    color: 'text-status-info bg-status-info/10 border-status-info/20 font-medium',
  },
}
