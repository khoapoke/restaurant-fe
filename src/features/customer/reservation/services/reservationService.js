import apiClient from '../../../../lib/axios'

/**
 * Service Đặt bàn trực tuyến (Customer)
 * Tham chiếu đặc tả: docs/api/customer-reservation.md (BKG-01 -> BKG-04)
 */

export const getAvailableTablesApi = async ({ date, time, guestCount }) => {
  return await apiClient.get('/customer/tables/available', {
    params: {
      date,
      time,
      guestCount,
    },
  })
}

export const createReservationApi = async (payload) => {
  return await apiClient.post('/customer/reservations', payload)
}

export const getCustomerReservationsApi = async () => {
  return await apiClient.get('/customer/reservations')
}

export const updateReservationApi = async (reservationId, payload) => {
  return await apiClient.put(`/customer/reservations/${reservationId}`, payload)
}

export const cancelCustomerReservationApi = async (reservationId) => {
  return await apiClient.post(`/customer/reservations/${reservationId}/cancel`)
}

