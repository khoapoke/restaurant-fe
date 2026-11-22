import apiClient from '../../../../lib/axios'

/**
 * Service Quản lý Bàn ăn & Đặt bàn (Admin)
 * Tham chiếu đặc tả: docs/modules/reservation.md (BKG-07 -> BKG-14) & docs/modules/order.md (ORD-DINE-01)
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

export const updateTableStatusApi = async (tableId, status) => {
  return await apiClient.patch(`/admin/tables/${tableId}/status`, { status })
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

// BKG-14: Nhân viên / Admin xác nhận nhận cọc thủ công
export const confirmDepositApi = async (reservationId) => {
  return await apiClient.post(`/admin/reservations/${reservationId}/confirm-deposit`)
}

// ==================== DINE-IN (PHỤC VỤ MỞ BÀN TẠI CHỖ) ====================
// ORD-DINE-01: Phục vụ mở bàn ăn tại chỗ, sinh token và mã QR
export const openDineInTableApi = async (payload) => {
  return await apiClient.post('/admin/orders/dine-in/open-table', payload)
}

