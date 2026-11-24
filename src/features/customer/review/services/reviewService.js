import apiClient from '../../../../lib/axios'

/**
 * Service gọi API Đánh giá & Nhận xét Món ăn (Phân hệ Khách hàng)
 * Tham chiếu đặc tả: docs/modules/review.md (REV-01 -> REV-05)
 */

export const REVIEW_TAG_SUGGESTIONS = [
  'Ngon miệng',
  'Nóng hổi',
  'Đóng gói kỹ',
  'Đầy đặn',
  'Vừa miệng',
  'Giao nhanh',
  'Đáng tiền',
  'Tươi ngon',
]

export const REVIEW_SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'highest', label: 'Đánh giá cao nhất' },
  { value: 'lowest', label: 'Đánh giá thấp nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
]

export const RATING_LABELS = {
  1: 'Rất tệ',
  2: 'Chưa hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Tuyệt vời',
}

const cleanQueryParams = (params = {}) =>
  Object.entries(params).reduce((acc, [key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      acc[key] = val
    }
    return acc
  }, {})

/** REV-01: Lấy danh sách đánh giá công khai & thống kê sao của món ăn */
export const getDishReviewsApi = async (dishId, params = {}) => {
  return await apiClient.get(`/customer/dishes/${dishId}/reviews`, {
    params: cleanQueryParams(params),
  })
}

/** REV-02: Khách hàng gửi đánh giá mới cho món ăn */
export const createDishReviewApi = async (dishId, payload) => {
  return await apiClient.post(`/customer/dishes/${dishId}/reviews`, payload)
}

/** REV-03: Lấy lịch sử đánh giá của chính khách hàng */
export const getMyReviewsApi = async (params = {}) => {
  return await apiClient.get('/customer/reviews/my', {
    params: cleanQueryParams(params),
  })
}

/** REV-04: Khách hàng sửa đánh giá của chính mình */
export const updateMyReviewApi = async (reviewId, payload) => {
  return await apiClient.put(`/customer/reviews/${reviewId}`, payload)
}

/** REV-05: Khách hàng xóa đánh giá của chính mình */
export const deleteMyReviewApi = async (reviewId) => {
  return await apiClient.delete(`/customer/reviews/${reviewId}`)
}
