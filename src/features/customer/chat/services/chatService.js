import apiClient from '../../../../lib/axios'

/**
 * Service gọi API Chat dành cho Khách hàng (Customer)
 * Tham chiếu đặc tả: docs/modules/chat.md (Version 2.1 - CHT-01 -> CHT-07)
 */

/**
 * CHT-01: Lấy phiên chat đang hoạt động (kèm messages)
 * GET /api/v1/customer/chat/sessions/active
 */
export const getActiveCustomerChatSessionApi = async () => {
  return await apiClient.get('/customer/chat/sessions/active')
}

/**
 * CHT-02: Khởi tạo phiên chat mới (nhận ngay câu chào mặc định từ Bot)
 * POST /api/v1/customer/chat/sessions
 */
export const createCustomerChatSessionApi = async (data = {}) => {
  return await apiClient.post('/customer/chat/sessions', data)
}

/**
 * CHT-03: Gửi tin nhắn và nhận phản hồi từ Gemini AI (nếu ở mode BOT)
 * POST /api/v1/customer/chat/sessions/{id}/messages
 */
export const sendCustomerChatMessageApi = async (sessionId, { content }) => {
  return await apiClient.post(`/customer/chat/sessions/${sessionId}/messages`, {
    content,
  })
}

/**
 * CHT-04: Yêu cầu chuyển giao sang nhân viên tư vấn trực tiếp (Human Handoff)
 * POST /api/v1/customer/chat/sessions/{id}/request-staff
 */
export const requestStaffApi = async (sessionId) => {
  return await apiClient.post(`/customer/chat/sessions/${sessionId}/request-staff`)
}

/**
 * CHT-05: Đóng phiên trò chuyện hiện tại (chuyển sang CLOSED)
 * POST /api/v1/customer/chat/sessions/{id}/close
 */
export const closeCustomerChatSessionApi = async (sessionId) => {
  return await apiClient.post(`/customer/chat/sessions/${sessionId}/close`)
}

/**
 * CHT-06: Lấy danh sách lịch sử các phiên chat cũ của khách hàng
 * GET /api/v1/customer/chat/sessions
 */
export const getCustomerChatSessionsApi = async (params = {}) => {
  return await apiClient.get('/customer/chat/sessions', { params })
}

/**
 * CHT-07: Xem chi tiết một phiên chat cũ kèm toàn bộ tin nhắn
 * GET /api/v1/customer/chat/sessions/{id}
 */
export const getCustomerChatSessionDetailApi = async (sessionId) => {
  return await apiClient.get(`/customer/chat/sessions/${sessionId}`)
}
