import apiClient from '../../../../lib/axios'

/**
 * Service gọi API Trực Chat dành cho Nhân viên & Quản trị viên
 * Tham chiếu đặc tả: docs/modules/chat.md (Version 2.1 - STAFF-01 -> STAFF-05)
 */

/**
 * STAFF-01: Lấy danh sách các phiên chat đa năng cho 3 Tabs:
 * - Tab Chờ tiếp nhận: { status: 'WAITING_STAFF' }
 * - Tab Đang hỗ trợ của tôi: { status: 'STAFF_CONNECTED', assigned_to_me: true }
 * - Tab Lịch sử đã đóng: { status: 'CLOSED' }
 * Hỗ trợ search và page
 * GET /api/v1/staff/chat/sessions
 */
export const getStaffChatSessionsApi = async (params = {}) => {
  return await apiClient.get('/staff/chat/sessions', { params })
}

// Alias hỗ trợ tương thích ngược
export const getPendingChatSessionsApi = async (params = {}) => {
  return await getStaffChatSessionsApi({
    status: 'WAITING_STAFF',
    ...params,
  })
}

/**
 * STAFF-02: Xem chi tiết & lịch sử chat đầy đủ của phiên
 * GET /api/v1/staff/chat/sessions/{id}
 */
export const getStaffChatSessionDetailApi = async (sessionId) => {
  return await apiClient.get(`/staff/chat/sessions/${sessionId}`)
}

/**
 * STAFF-03: Nhân viên nhận phiên hỗ trợ khách hàng (chuyển sang STAFF_CONNECTED)
 * POST /api/v1/staff/chat/sessions/{id}/assign
 */
export const assignChatSessionApi = async (sessionId) => {
  return await apiClient.post(`/staff/chat/sessions/${sessionId}/assign`)
}

/**
 * STAFF-04: Nhân viên gửi tin nhắn trực tiếp đến khách hàng
 * POST /api/v1/staff/chat/sessions/{id}/messages
 */
export const sendStaffChatMessageApi = async (sessionId, { content }) => {
  return await apiClient.post(`/staff/chat/sessions/${sessionId}/messages`, {
    content,
  })
}

/**
 * STAFF-05: Đóng phiên hỗ trợ khách hàng (chuyển sang CLOSED)
 * POST /api/v1/staff/chat/sessions/{id}/close
 */
export const closeChatSessionApi = async (sessionId) => {
  return await apiClient.post(`/staff/chat/sessions/${sessionId}/close`)
}
