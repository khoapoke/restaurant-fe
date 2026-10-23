import apiClient from '../../../../lib/axios'

/**
 * Service gọi API Đơn hàng & Thanh toán QR
 * Tham chiếu đặc tả: docs/api/customer-order.md
 */

export const checkoutApi = async (payload) => {
  return await apiClient.post('/customer/orders/checkout', payload)
}

export const getOrdersApi = async (params = {}) => {
  return await apiClient.get('/customer/orders', { params })
}

export const getOrderDetailApi = async (orderId) => {
  return await apiClient.get(`/customer/orders/${orderId}`)
}

export const cancelOrderApi = async (orderId, cancelReason) => {
  return await apiClient.post(`/customer/orders/${orderId}/cancel`, {
    cancelReason,
  })
}

/** Sửa người nhận/SĐT/địa chỉ trước khi đơn được giao cho tài xế (DLV-01). */
export const updateOrderRecipientApi = async (orderId, payload) => {
  return await apiClient.patch(`/customer/orders/${orderId}/recipient`, payload)
}

export const generateQrApi = async (orderId) => {
  return await apiClient.post(`/customer/payments/${orderId}/qr`)
}

export const getPaymentStatusApi = async (orderId) => {
  return await apiClient.get(`/customer/payments/${orderId}/status`)
}

export const retryPaymentApi = async (orderId) => {
  return await apiClient.post(`/customer/payments/${orderId}/retry`)
}
