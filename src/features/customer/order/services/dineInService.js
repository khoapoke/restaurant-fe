import apiClient from '../../../../lib/axios'

/**
 * Service gọi API Phục vụ & Gọi món tại bàn (Dine-in Customer)
 * Tham chiếu đặc tả: docs/modules/order.md (ORD-DINE-02, ORD-DINE-03)
 */

// ORD-DINE-03: Lấy tiến độ món ăn real-time tại bàn
export const getDineInTrackingApi = async (orderId, token) => {
  try {
    return await apiClient.get(`/customer/orders/dine-in/${orderId}`, {
      params: { token },
    })
  } catch (err) {
    if (err.response?.status === 404) {
      return await apiClient.get(`/orders/dine-in/${orderId}`, {
        params: { token },
      })
    }
    throw err
  }
}

// ORD-DINE-02: Khách gọi món / thêm món trực tiếp vào bếp
export const addDineInItemsApi = async (orderId, { token, items }) => {
  try {
    return await apiClient.post(`/customer/orders/dine-in/${orderId}/items`, {
      token,
      items,
    })
  } catch (err) {
    if (err.response?.status === 404) {
      return await apiClient.post(`/orders/dine-in/${orderId}/items`, {
        token,
        items,
      })
    }
    throw err
  }
}
