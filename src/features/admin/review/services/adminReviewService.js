import apiClient from '../../../../lib/axios'

/**
 * Service Quản trị Đánh giá & Kiểm duyệt Ngôn từ Món ăn (ADMIN / STAFF)
 * Tham chiếu đặc tả: docs/modules/review.md (REV-06 -> REV-11)
 */

const cleanParams = (params = {}) =>
  Object.entries(params).reduce((acc, [key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      acc[key] = val
    }
    return acc
  }, {})

/** REV-06: Lấy danh sách toàn bộ đánh giá kèm thống kê (stats) và bộ lọc */
export const getAdminReviewsApi = async (params = {}) => {
  return await apiClient.get('/admin/reviews', {
    params: cleanParams(params),
  })
}

/** REV-07: Admin/Staff gửi phản hồi cho đánh giá của khách */
export const replyReviewApi = async (reviewId, content) => {
  return await apiClient.post(`/admin/reviews/${reviewId}/reply`, { content })
}

/** REV-08: Ẩn / Hiện đánh giá (VISIBLE <-> HIDDEN) */
export const toggleReviewVisibilityApi = async (reviewId, status) => {
  const payload = status ? { status } : {}
  return await apiClient.patch(`/admin/reviews/${reviewId}/visibility`, payload)
}

/** REV-09: Xóa vĩnh viễn đánh giá vi phạm / spam */
export const deleteAdminReviewApi = async (reviewId) => {
  return await apiClient.delete(`/admin/reviews/${reviewId}`)
}

/** REV-10: Lọc danh sách bình luận tục tĩu / ngôn từ không phù hợp + summary */
export const getFlaggedReviewsApi = async (params = {}) => {
  return await apiClient.get('/admin/reviews/flagged', {
    params: cleanParams(params),
  })
}

/** REV-11: Ẩn hàng loạt bình luận vi phạm đang hiển thị (VISIBLE -> HIDDEN) */
export const autoHideFlaggedReviewsApi = async (severities = []) => {
  const payload = Array.isArray(severities) && severities.length > 0 ? { severities } : {}
  return await apiClient.post('/admin/reviews/flagged/auto-hide', payload)
}
