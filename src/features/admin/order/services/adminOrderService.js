import apiClient from '../../../../lib/axios'

/**
 * Service Quản lý Đơn hàng & Thanh toán (Admin / Staff)
 * Tham chiếu đặc tả: docs/modules/order.md (ORD-06 -> ORD-13) & docs/modules/payment.md (PAY-03 -> PAY-06)
 */

// ==================== ĐƠN HÀNG (ORDERS) ====================

// ORD-06: Danh sách đơn hàng phía Quản trị
export const getAdminOrdersApi = async (params = {}) => {
  return await apiClient.get('/admin/orders', { params })
}

// ORD-07: Xem chi tiết đơn hàng
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

// ORD-08: Cập nhật trạng thái đơn hàng theo FSM
export const updateOrderStatusApi = async (orderId, targetStatus) => {
  return await apiClient.patch(`/admin/orders/${orderId}/status`, {
    targetStatus,
  })
}

// ORD-08: Hủy đơn hàng kèm lý do
export const cancelAdminOrderApi = async (orderId, cancelReason) => {
  return await apiClient.post(`/admin/orders/${orderId}/cancel`, {
    cancelReason,
  })
}

// ORD-13: Thu ngân / Quản lý xác nhận thanh toán thủ công từ màn hình đơn hàng
export const confirmOrderPaymentApi = async (orderId, note = '') => {
  return await apiClient.post(`/admin/orders/${orderId}/confirm-payment`, {
    note: note || 'Xác nhận thanh toán thủ công từ POS/Admin',
  })
}

// ==================== THANH TOÁN (PAYMENTS) ====================

// PAY-04: Danh sách giao dịch thanh toán phía Quản trị
export const getAdminPaymentsApi = async (params = {}) => {
  return await apiClient.get('/admin/payments', { params })
}

// PAY-03: Xác nhận thanh toán thủ công bởi Nhân viên/Thu ngân
export const confirmPaymentApi = async (paymentId, note = '') => {
  return await apiClient.post(`/admin/payments/${paymentId}/confirm`, {
    note: note || 'Nhân viên xác nhận tiền đã vào tài khoản',
  })
}

// PAY-05: Hoàn tiền giao dịch & tự hủy đơn hàng
export const refundPaymentApi = async (paymentId, refundReason, extra = {}) => {
  return await apiClient.post(`/admin/payments/${paymentId}/refund`, {
    refundReason,
    ...extra,
  })
}

// PAY-06: Đối soát số tiền thanh toán
export const reconcilePaymentApi = async (payload = {}) => {
  return await apiClient.post('/admin/payments/reconcile', payload)
}

// Xem logs webhook callback
export const getPaymentCallbackLogsApi = async (params = {}) => {
  return await apiClient.get('/admin/payments/callback-logs', { params })
}
