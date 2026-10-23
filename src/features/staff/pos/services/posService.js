import apiClient from '../../../../lib/axios'

export const getPosFloorApi = (config = {}) => apiClient.get('/staff/pos/tables', config)

export const completeTableCleaningApi = (tableId) =>
  apiClient.post(`/staff/pos/tables/${tableId}/complete-cleaning`)

export const openPosSessionApi = ({ tableIds, guestCount, reservationId = null, idempotencyKey }) =>
  apiClient.post(
    '/staff/pos/sessions',
    { tableIds, guestCount, reservationId },
    { headers: { 'Idempotency-Key': idempotencyKey } }
  )

export const getPosSessionApi = (sessionId, config = {}) =>
  apiClient.get(`/staff/pos/sessions/${sessionId}`, config)

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

export const getKitchenItemsApi = (config = {}) => apiClient.get('/staff/kitchen/items', config)

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

// Live Dining: hàng đợi check-in QR và yêu cầu phục vụ (docs/api/live-dining.md)
export const getLiveQueueApi = (config = {}) => apiClient.get('/staff/live/queue', config)

export const acceptCheckInApi = (visitId, { guestCount = null, reservationId = null } = {}) =>
  apiClient.post(`/staff/live/check-ins/${visitId}/accept`, { guestCount, reservationId })

export const rejectCheckInApi = (visitId, reason) =>
  apiClient.post(`/staff/live/check-ins/${visitId}/reject`, { reason })

export const acknowledgeServiceRequestApi = (requestId) =>
  apiClient.post(`/staff/live/service-requests/${requestId}/acknowledge`)

export const completeServiceRequestApi = (requestId) =>
  apiClient.post(`/staff/live/service-requests/${requestId}/complete`)

export const getTableQrApi = (tableId) => apiClient.get(`/staff/live/tables/${tableId}/qr`)

export const rotateJoinCodeApi = (sessionId) => apiClient.post(`/staff/live/sessions/${sessionId}/join-code`)

// ADR-024: hủy / miễn tiền / làm lại / đổi / tách món, từ chối & hoàn tác tại bếp
export const voidOrderItemApi = (itemId, payload) => apiClient.post(`/staff/pos/order-items/${itemId}/void`, payload)
export const waiveOrderItemApi = (itemId, note) => apiClient.post(`/staff/pos/order-items/${itemId}/waive`, { note })
export const remakeOrderItemApi = (itemId, payload) => apiClient.post(`/staff/pos/order-items/${itemId}/remake`, payload)
export const exchangeOrderItemApi = (itemId, payload) => apiClient.post(`/staff/pos/order-items/${itemId}/exchange`, payload)
export const splitOrderItemApi = (itemId, quantity) => apiClient.post(`/staff/pos/order-items/${itemId}/split`, { quantity })
export const rejectKitchenItemApi = (itemId, payload) => apiClient.post(`/staff/kitchen/items/${itemId}/reject`, payload)
export const undoKitchenItemApi = (itemId) => apiClient.post(`/staff/kitchen/items/${itemId}/undo`)

// Yêu cầu quản lý duyệt (STAFF gửi, ADMIN duyệt bằng phiên đăng nhập của mình)
export const getApprovalsApi = (params = {}, config = {}) => apiClient.get('/staff/approvals', { params, ...config })
export const createApprovalApi = (payload) => apiClient.post('/staff/approvals', payload)
export const cancelApprovalApi = (approvalId) => apiClient.post(`/staff/approvals/${approvalId}/cancel`)
export const approveApprovalApi = (approvalId, note = null) => apiClient.post(`/staff/approvals/${approvalId}/approve`, { note })
export const rejectApprovalApi = (approvalId, note) => apiClient.post(`/staff/approvals/${approvalId}/reject`, { note })

// ADR-025: phiên phục vụ — số khách, chuyển/ghép bàn, lịch sử, thất thu
export const changeGuestCountApi = (sessionId, guestCount, reason = null) =>
  apiClient.patch(`/staff/pos/sessions/${sessionId}/guest-count`, { guestCount, reason })
export const changeSessionTablesApi = (sessionId, { tableIds, reason, releaseAs = 'CLEANING' }) =>
  apiClient.post(`/staff/pos/sessions/${sessionId}/tables`, { tableIds, reason, releaseAs })
export const getSessionHistoryApi = (sessionId) => apiClient.get(`/staff/pos/sessions/${sessionId}/history`)
export const writeOffSessionApi = (sessionId, note) => apiClient.post(`/staff/pos/sessions/${sessionId}/write-off`, { note })
export const finishWithoutChargeApi = (sessionId, note) => apiClient.post(`/staff/pos/sessions/${sessionId}/finish-without-charge`, { note })
export const reopenWithReasonApi = (sessionId, reason) => apiClient.post(`/staff/pos/sessions/${sessionId}/reopen`, { reason })

// ADR-025: khách đặt bàn đến trễ
export const extendReservationApi = (reservationId, minutes, reason) =>
  apiClient.post(`/staff/pos/reservations/${reservationId}/extend`, { minutes, reason })
export const markReservationNoShowApi = (reservationId, note) =>
  apiClient.post(`/staff/pos/reservations/${reservationId}/no-show`, { note })
export const openSessionWithOptionsApi = ({ idempotencyKey, ...payload }) =>
  apiClient.post('/staff/pos/sessions', payload, { headers: { 'Idempotency-Key': idempotencyKey } })
