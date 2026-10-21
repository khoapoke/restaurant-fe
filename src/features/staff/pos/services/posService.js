import apiClient from '../../../../lib/axios'

export const getPosFloorApi = () => apiClient.get('/staff/pos/tables')

export const completeTableCleaningApi = (tableId) =>
  apiClient.post(`/staff/pos/tables/${tableId}/complete-cleaning`)

export const openPosSessionApi = ({ tableIds, guestCount, reservationId = null, idempotencyKey }) =>
  apiClient.post(
    '/staff/pos/sessions',
    { tableIds, guestCount, reservationId },
    { headers: { 'Idempotency-Key': idempotencyKey } }
  )

export const getPosSessionApi = (sessionId) =>
  apiClient.get(`/staff/pos/sessions/${sessionId}`)

export const createPosOrderApi = (sessionId, note = null) =>
  apiClient.post(`/staff/pos/sessions/${sessionId}/orders`, { note })

export const addPosOrderItemApi = (orderId, payload) =>
  apiClient.post(`/staff/pos/orders/${orderId}/items`, payload)

export const updatePosOrderItemApi = (itemId, payload) =>
  apiClient.patch(`/staff/pos/order-items/${itemId}`, payload)

export const deletePosOrderItemApi = (itemId) =>
  apiClient.delete(`/staff/pos/order-items/${itemId}`)

export const sendOrderToKitchenApi = (orderId, itemIds) =>
  apiClient.post(`/staff/pos/orders/${orderId}/send-kitchen`, { itemIds })

export const getKitchenItemsApi = () => apiClient.get('/staff/kitchen/items')

export const updateKitchenItemStatusApi = (itemId, status) =>
  apiClient.patch(`/staff/kitchen/items/${itemId}/status`, { status })

export const createInvoiceApi = (sessionId) =>
  apiClient.post(`/staff/pos/sessions/${sessionId}/invoices`)

export const payInvoiceApi = (invoiceId, payload) =>
  apiClient.post(`/staff/invoices/${invoiceId}/payments`, payload, {
    headers: { 'Idempotency-Key': payload.idempotencyKey },
  })

export const reopenPosSessionApi = (sessionId) =>
  apiClient.post(`/staff/pos/sessions/${sessionId}/reopen`)

export const cancelPosSessionApi = (sessionId, reason) =>
  apiClient.post(`/staff/pos/sessions/${sessionId}/cancel`, { reason })

export const closePosSessionApi = (sessionId, expectedVersion) =>
  apiClient.post(`/staff/pos/sessions/${sessionId}/close`, { expectedVersion })
