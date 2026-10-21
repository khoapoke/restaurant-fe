/**
 * Auth Constants & Enums
 * Tuân thủ docs/api/enums.md (Toàn bộ ENUM viết hoa tiếng Anh)
 */

export const Role = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
}

export const AccountStatus = {
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
}

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'restaurant_access_token',
  ACCOUNT: 'restaurant_account',
}

export const AUTH_EXPIRED_EVENT = 'moc:auth-expired'

export const HOME_PATH_BY_ROLE = {
  ADMIN: '/admin',
  STAFF: '/staff/floor',
  CUSTOMER: '/',
}
