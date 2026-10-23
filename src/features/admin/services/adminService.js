import apiClient from '../../../lib/axios'

export const getDashboardReportApi = (params = {}) => apiClient.get('/admin/reports/dashboard', { params })

export const getAccountsApi = (params = {}) => apiClient.get('/admin/accounts', { params })
export const lockAccountApi = (accountId) => apiClient.patch(`/admin/accounts/${accountId}/lock`)
export const unlockAccountApi = (accountId) => apiClient.patch(`/admin/accounts/${accountId}/unlock`)

export const getAdminCategoriesApi = () => apiClient.get('/admin/categories')
export const createCategoryApi = (payload) => apiClient.post('/admin/categories', payload)
export const updateCategoryApi = (categoryId, payload) => apiClient.put(`/admin/categories/${categoryId}`, payload)
export const toggleCategoryApi = (categoryId, isVisible) => apiClient.patch(`/admin/categories/${categoryId}/visibility`, { isVisible })
export const deleteCategoryApi = (categoryId) => apiClient.delete(`/admin/categories/${categoryId}`)

export const getAdminDishesApi = (params = {}) => apiClient.get('/admin/dishes', { params })
export const createDishApi = (payload) => apiClient.post('/admin/dishes', payload)
export const updateDishApi = (dishId, payload) => apiClient.put(`/admin/dishes/${dishId}`, payload)
export const toggleDishAvailabilityApi = (dishId, isAvailable) => apiClient.patch(`/admin/dishes/${dishId}/availability`, { isAvailable })
export const toggleDishVisibilityApi = (dishId, isVisible) => apiClient.patch(`/admin/dishes/${dishId}/visibility`, { isVisible })
export const deleteDishApi = (dishId) => apiClient.delete(`/admin/dishes/${dishId}`)

export const getAdminOrdersApi = (params = {}) => apiClient.get('/admin/orders', { params })
export const updateOrderStatusApi = (orderId, targetStatus, reason = null) => apiClient.patch(`/admin/orders/${orderId}/status`, { targetStatus, reason })
export const updateFulfillmentStatusApi = (orderId, targetStatus, details = {}) => apiClient.patch(`/admin/orders/${orderId}/fulfillment-status`, { targetStatus, ...details })
export const cancelAdminOrderApi = (orderId, cancelReason, options = {}) => apiClient.post(`/admin/orders/${orderId}/cancel`, { cancelReason, ...options })
export const updateOrderRecipientApi = (orderId, payload) => apiClient.patch(`/admin/orders/${orderId}/recipient`, payload)
export const getOrderHistoryApi = (orderId) => apiClient.get(`/admin/orders/${orderId}/history`)

export const getAdminPaymentsApi = (params = {}) => apiClient.get('/admin/payments', { params })
export const reconcilePaymentsApi = (paymentIds = []) => apiClient.post('/admin/payments/reconcile', { paymentIds })
/** Ghi nhận đã hoàn tiền (không chuyển tiền thật): { refundReason, amount, method, referenceCode, refundedAt? }. */
export const refundPaymentApi = (paymentId, payload, idempotencyKey) => apiClient.post(`/admin/payments/${paymentId}/refund`, payload, { headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {} })
export const confirmPaymentApi = (paymentId, payload) => apiClient.post(`/admin/payments/${paymentId}/confirm`, payload)

// Sổ giao dịch tiền (ADR-023)
export const getMoneyTransactionsApi = (params = {}) => apiClient.get('/admin/payments/transactions', { params })
export const refundTransactionApi = (transactionId, payload, idempotencyKey) => apiClient.post(`/admin/payments/transactions/${transactionId}/refunds`, payload, { headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {} })
export const allocateTransactionApi = (transactionId, payload) => apiClient.post(`/admin/payments/transactions/${transactionId}/allocate`, payload)
export const resolveTransactionApi = (transactionId, note) => apiClient.post(`/admin/payments/transactions/${transactionId}/resolve`, { note })

export const getAdminTablesApi = () => apiClient.get('/admin/tables')
export const rotateTableQrApi = (tableId) => apiClient.post(`/admin/tables/${tableId}/qr-token`)
export const createTableApi = (payload) => apiClient.post('/admin/tables', payload)
export const updateTableApi = (tableId, payload) => apiClient.put(`/admin/tables/${tableId}`, payload)

export const getAdminReservationsApi = (params = {}) => apiClient.get('/admin/reservations', { params })
export const updateReservationStatusApi = (reservationId, targetStatus, { reason = null, internalNote = null } = {}) =>
  apiClient.patch(`/admin/reservations/${reservationId}/status`, { targetStatus, reason, internalNote })
export const updateAdminReservationApi = (reservationId, payload) => apiClient.put(`/admin/reservations/${reservationId}`, payload)
export const getReservationHistoryApi = (reservationId) => apiClient.get(`/admin/reservations/${reservationId}/history`)

// Yêu cầu duyệt từ nhân viên (ADMIN duyệt bằng tài khoản của mình)
export const getApprovalRequestsApi = (params = {}) => apiClient.get('/staff/approvals', { params })
export const approveRequestApi = (approvalId, note = null) => apiClient.post(`/staff/approvals/${approvalId}/approve`, { note })
export const declineRequestApi = (approvalId, note) => apiClient.post(`/staff/approvals/${approvalId}/reject`, { note })
