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
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    dotColor: 'bg-emerald-500',
  },
  LOCKED: {
    label: 'Đã bị khóa',
    color: 'text-red-400 bg-red-500/10 border-red-500/30',
    dotColor: 'bg-red-500',
  },
}

export const Role = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
}

export const ROLE_CONFIG = {
  ADMIN: {
    label: 'Quản trị viên',
    color: 'text-amber-400 bg-amber-500/15 border-amber-500/30 font-bold',
  },
  CUSTOMER: {
    label: 'Khách hàng',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 font-medium',
  },
}

