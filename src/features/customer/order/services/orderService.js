import apiClient from '../../../../lib/axios'

/**
 * Service gọi API Đơn hàng & Thanh toán QR (Customer)
 * Tham chiếu đặc tả: docs/modules/order.md (ORD-01 -> ORD-05) & docs/modules/payment.md (PAY-01, PAY-02, PAY-08)
 */

// ORD-01: Khách checkout đặt hàng từ giỏ hàng (Redis Distributed Lock 10s)
export const checkoutApi = async (payload) => {
  return await apiClient.post('/customer/orders/checkout', payload)
}

// ORD-04: Lấy danh sách lịch sử đơn hàng của khách
export const getOrdersApi = async (params = {}) => {
  return await apiClient.get('/customer/orders', { params })
}

// ORD-05: Xem chi tiết đơn hàng
export const getOrderDetailApi = async (orderId) => {
  return await apiClient.get(`/customer/orders/${orderId}`)
}

// ORD-02: Khách tự hủy đơn hàng (chỉ khi PENDING_CONFIRMATION)
export const cancelOrderApi = async (orderId, cancelReason = 'Khách hàng yêu cầu hủy đơn') => {
  return await apiClient.put(`/customer/orders/${orderId}/cancel`, {
    cancelReason,
  })
}

// PAY-01: Sinh mã VietQR Napas 247 cho đơn hàng
export const generateQrApi = async (orderId) => {
  return await apiClient.post(`/customer/payments/${orderId}/qr`)
}

// PAY-02: Lắng nghe trạng thái thanh toán real-time
export const getPaymentStatusApi = async (orderId) => {
  return await apiClient.get(`/customer/payments/${orderId}/status`)
}

// Thử tạo lại mã QR
export const retryPaymentApi = async (orderId) => {
  return await apiClient.post(`/customer/payments/${orderId}/retry`)
}

// PAY-08: Giả lập thanh toán thành công (Mock Payment cho FE test)
export const mockPaymentApi = async (orderId) => {
  return await apiClient.post(`/customer/payments/${orderId}/mock-payment`)
}
