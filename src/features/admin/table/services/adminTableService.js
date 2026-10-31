import apiClient from '../../../../lib/axios'

/**
 * Service Quản lý Bàn ăn & Đặt bàn (Admin)
 * Tham chiếu đặc tả: docs/api/admin-table-report.md (BKG-05 -> BKG-12)
 */

// ==================== BÀN ĂN (TABLES) ====================

export const getAdminTablesApi = async () => {
  return await apiClient.get('/admin/tables')
}

export const createTableApi = async (payload) => {
  return await apiClient.post('/admin/tables', payload)
}

export const updateTableApi = async (tableId, payload) => {
  return await apiClient.put(`/admin/tables/${tableId}`, payload)
}

// ==================== ĐẶT BÀN (RESERVATIONS) ====================

export const getAdminReservationsApi = async (params = {}) => {
  return await apiClient.get('/admin/reservations', { params })
}

export const updateReservationStatusApi = async (reservationId, payload) => {
  return await apiClient.patch(`/admin/reservations/${reservationId}/status`, payload)
}

export const updateTimeSlotsApi = async (payload) => {
  return await apiClient.put('/admin/reservations/time-slots', payload)
}

