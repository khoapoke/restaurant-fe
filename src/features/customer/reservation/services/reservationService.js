import apiClient from '../../../../lib/axios'

/**
 * Service Đặt bàn trực tuyến (Customer)
 * Tham chiếu đặc tả: docs/modules/reservation.md (BKG-01 -> BKG-06, BKG-13)
 */

// BKG-01: Tìm danh sách bàn trống khả dụng
export const getAvailableTablesApi = async ({ date, time, guestCount }) => {
  try {
    return await apiClient.get('/customer/reservations/available-tables', {
      params: { date, time, guestCount },
    })
  } catch {
    return await apiClient.get('/customer/tables/available', {
      params: { date, time, guestCount },
    })
  }
}

// BKG-02: Tạo phiếu đặt bàn mới (Redis Lock 5s)
export const createReservationApi = async (payload) => {
  return await apiClient.post('/customer/reservations', payload)
}

// BKG-05: Lấy danh sách lịch sử đặt bàn của khách
export const getCustomerReservationsApi = async (params = {}) => {
  return await apiClient.get('/customer/reservations', { params })
}

// BKG-06: Xem chi tiết phiếu đặt bàn
export const getReservationDetailApi = async (reservationId) => {
  return await apiClient.get(`/customer/reservations/${reservationId}`)
}

// BKG-03: Sửa lịch hẹn đặt bàn (Quy tắc trước >= 60 phút)
export const updateReservationApi = async (reservationId, payload) => {
  return await apiClient.put(`/customer/reservations/${reservationId}`, payload)
}

// BKG-04: Hủy lịch hẹn đặt bàn (Quy tắc trước >= 60 phút)
export const cancelCustomerReservationApi = async (reservationId) => {
  try {
    return await apiClient.put(`/customer/reservations/${reservationId}/cancel`)
  } catch (err) {
    if (err?.response?.status === 405) {
      return await apiClient.post(`/customer/reservations/${reservationId}/cancel`)
    }
    throw err
  }
}

// BKG-13: Khách hàng giả lập thanh toán cọc thành công (Mock Deposit cho FE test)
export const mockDepositApi = async (reservationId) => {
  return await apiClient.post(`/customer/reservations/${reservationId}/mock-deposit`)
}
