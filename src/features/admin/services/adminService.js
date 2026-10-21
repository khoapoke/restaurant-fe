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
export const updateOrderStatusApi = (orderId, targetStatus) => apiClient.patch(`/admin/orders/${orderId}/status`, { targetStatus })
export const updateFulfillmentStatusApi = (orderId, targetStatus) => apiClient.patch(`/admin/orders/${orderId}/fulfillment-status`, { targetStatus })
export const cancelAdminOrderApi = (orderId, cancelReason) => apiClient.post(`/admin/orders/${orderId}/cancel`, { cancelReason })

export const getAdminPaymentsApi = (params = {}) => apiClient.get('/admin/payments', { params })
export const reconcilePaymentsApi = (paymentIds = []) => apiClient.post('/admin/payments/reconcile', { paymentIds })
export const refundPaymentApi = (paymentId, refundReason) => apiClient.post(`/admin/payments/${paymentId}/refund`, { refundReason })
export const confirmPaymentApi = (paymentId, payload) => apiClient.post(`/admin/payments/${paymentId}/confirm`, payload)

export const getAdminTablesApi = () => apiClient.get('/admin/tables')
export const createTableApi = (payload) => apiClient.post('/admin/tables', payload)
export const updateTableApi = (tableId, payload) => apiClient.put(`/admin/tables/${tableId}`, payload)

export const getAdminReservationsApi = (params = {}) => apiClient.get('/admin/reservations', { params })
export const updateReservationStatusApi = (reservationId, targetStatus, adminNote = null) =>
  apiClient.patch(`/admin/reservations/${reservationId}/status`, { targetStatus, adminNote })
