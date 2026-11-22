/**
 * Constants & Enums cho Quản lý Tài khoản (Admin)
 * Tham chiếu docs/system_conventions.md và docs/modules/auth.md
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
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
}

export const ROLE_CONFIG = {
  ADMIN: {
    label: 'Quản trị viên',
    color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/30 font-bold',
  },
  STAFF: {
    label: 'Nhân viên',
    color: 'text-status-warning bg-status-warning/10 border-status-warning/30 font-semibold',
  },
  CUSTOMER: {
    label: 'Khách hàng',
    color: 'text-status-info bg-status-info/10 border-status-info/20 font-medium',
  },
}

/**
 * Chuẩn hóa mã vai trò từ response của Backend (ADMIN | STAFF | CUSTOMER)
 */
export const resolveAccountRole = (acc) => {
  if (!acc) return 'CUSTOMER'
  const direct =
    typeof acc.role === 'string'
      ? acc.role.toUpperCase()
      : acc.role?.roleCode || acc.roleCode || ''
  if (direct === 'ADMIN' || direct === 'STAFF' || direct === 'CUSTOMER') {
    return direct
  }
  const roleName = String(acc.roleName || acc.role?.roleName || '').toLowerCase()
  if (roleName.includes('quản trị') || roleName === 'admin' || acc.ma_vai_tro === 1) {
    return 'ADMIN'
  }
  if (roleName.includes('nhân viên') || roleName === 'staff' || acc.ma_vai_tro === 2) {
    return 'STAFF'
  }
  return 'CUSTOMER'
}
