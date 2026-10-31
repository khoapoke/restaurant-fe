import apiClient from '../../../../lib/axios'

/**
 * Service Quản lý Đơn hàng & Thanh toán (Admin)
 * Tham chiếu đặc tả: docs/api/admin-order.md (ORD-07 -> ORD-12, PAY-04 -> PAY-07)
 */

// ==================== ĐƠN HÀNG (ORDERS) ====================

export const getAdminOrdersApi = async (params = {}) => {
  return await apiClient.get('/admin/orders', { params })
}

export const getAdminOrderDetailApi = async (orderId) => {
  try {
    return await apiClient.get(`/admin/orders/${orderId}`)
  } catch (err) {
    if (err.response?.status === 404) {
      return await apiClient.get(`/customer/orders/${orderId}`)
    }
    throw err
  }
}

export const updateOrderStatusApi = async (orderId, targetStatus) => {
  return await apiClient.patch(`/admin/orders/${orderId}/status`, {
    targetStatus,
  })
}

export const cancelAdminOrderApi = async (orderId, cancelReason) => {
  return await apiClient.post(`/admin/orders/${orderId}/cancel`, {
    cancelReason,
  })
}

// ==================== THANH TOÁN (PAYMENTS) ====================

export const getAdminPaymentsApi = async (params = {}) => {
  return await apiClient.get('/admin/payments', { params })
}

export const reconcilePaymentApi = async (payload = {}) => {
  return await apiClient.post('/admin/payments/reconcile', payload)
}

export const refundPaymentApi = async (paymentId, refundReason) => {
  return await apiClient.post(`/admin/payments/${paymentId}/refund`, {
    refundReason,
  })
}

export const getPaymentCallbackLogsApi = async (params = {}) => {
  return await apiClient.get('/admin/payments/callback-logs', { params })
}

