import apiClient from '../../../../lib/axios'

/**
 * Service gọi API Hồ sơ khách hàng
 * Tham chiếu đặc tả: docs/modules/auth.md
 */

export const getProfileApi = async () => {
  return await apiClient.get('/customer/profile')
}

export const updateProfileApi = async (payload) => {
  return await apiClient.put('/customer/profile', payload)
}
