import apiClient from '../../../../lib/axios'

/**
 * Service Quản lý Tài khoản Người dùng (Admin)
 * Tham chiếu đặc tả: docs/modules/auth.md (ADM-01 -> ADM-07)
 */

export const getAdminAccountsApi = async (params = {}) => {
  return await apiClient.get('/admin/accounts', { params })
}

export const lockAccountApi = async (accountId) => {
  return await apiClient.patch(`/admin/accounts/${accountId}/lock`)
}

export const unlockAccountApi = async (accountId) => {
  return await apiClient.patch(`/admin/accounts/${accountId}/unlock`)
}

