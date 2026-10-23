import publicApiClient from '../../../lib/publicApi'

/**
 * Live Dining — API công khai theo mã QR của bàn (docs/api/live-dining.md).
 * Mã thiết bị (visit token) đi trong header `X-Dine-Visit`, không dùng tài khoản.
 */
const VISIT_HEADER = 'X-Dine-Visit'

const visitHeaders = (visitToken) => (visitToken ? { [VISIT_HEADER]: visitToken } : {})

export const getTableStateApi = (tableToken, { visitToken, since, signal } = {}) =>
  publicApiClient.get(`/public/dine/${tableToken}`, {
    params: since ? { since } : undefined,
    headers: visitHeaders(visitToken),
    signal,
  })

export const requestCheckInApi = (tableToken, { guestName, guestCount }, visitToken) =>
  publicApiClient.post(`/public/dine/${tableToken}/check-in`, { guestName, guestCount }, { headers: visitHeaders(visitToken) })

export const cancelCheckInApi = (tableToken, visitToken) =>
  publicApiClient.post(`/public/dine/${tableToken}/check-in/cancel`, {}, { headers: visitHeaders(visitToken) })

export const joinTableApi = (tableToken, { guestName, joinCode } = {}, visitToken) =>
  publicApiClient.post(`/public/dine/${tableToken}/join`, { guestName: guestName || null, joinCode: joinCode || null }, { headers: visitHeaders(visitToken) })

export const submitTableOrderApi = (tableToken, visitToken, items, idempotencyKey, expectedTotal = null) =>
  publicApiClient.post(`/public/dine/${tableToken}/orders`, { items, expectedTotal }, {
    headers: { ...visitHeaders(visitToken), 'Idempotency-Key': idempotencyKey },
  })

export const raiseServiceRequestApi = (tableToken, visitToken, payload) =>
  publicApiClient.post(`/public/dine/${tableToken}/service-requests`, payload, { headers: visitHeaders(visitToken) })

export const cancelServiceRequestApi = (tableToken, visitToken, requestId) =>
  publicApiClient.post(`/public/dine/${tableToken}/service-requests/${requestId}/cancel`, {}, { headers: visitHeaders(visitToken) })

export const getDineMenuApi = async () => {
  const [categories, dishes] = await Promise.all([
    publicApiClient.get('/customer/categories'),
    publicApiClient.get('/customer/dishes', { params: { perPage: 100 } }),
  ])

  return {
    categories: categories.data || [],
    dishes: dishes.data?.items || [],
  }
}
