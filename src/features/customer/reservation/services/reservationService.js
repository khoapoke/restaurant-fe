import apiClient from '../../../../lib/axios'

export const getAvailableTablesApi = (params) => apiClient.get('/customer/tables/available', { params })
export const getReservationsApi = (params = {}) => apiClient.get('/customer/reservations', { params })
export const createReservationApi = (payload) => apiClient.post('/customer/reservations', payload)
export const updateReservationApi = (reservationId, payload) => apiClient.put(`/customer/reservations/${reservationId}`, payload)
export const cancelReservationApi = (reservationId) => apiClient.post(`/customer/reservations/${reservationId}/cancel`)
