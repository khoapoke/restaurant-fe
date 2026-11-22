import apiClient from '../../../../lib/axios'

/**
 * Service gọi API Gợi ý Món ăn (Neo4j Graph & AI Collaborative Filtering)
 * Tham chiếu đặc tả: docs/modules/recommendation.md
 */

/**
 * Lấy danh sách các món thường được gọi cùng với món hiện tại (Market Basket Analysis)
 * @param {number|string} dishId
 * @param {number} limit
 */
export const getPairedDishesApi = async (dishId, limit = 4) => {
  return await apiClient.get(`/customer/dishes/${dishId}/recommendations/graph`, {
    params: { limit },
  })
}

/**
 * Lấy danh sách món gợi ý cá nhân hóa cho khách hàng đã đăng nhập (Collaborative Filtering)
 * @param {number} limit
 */
export const getPersonalizedRecommendationsApi = async (limit = 5) => {
  return await apiClient.get('/customer/recommendations/personalized', {
    params: { limit },
  })
}

/**
 * Lấy thống kê số node và mối quan hệ trong đồ thị Neo4j
 */
export const getGraphStatsApi = async () => {
  return await apiClient.get('/customer/recommendations/graph-stats')
}

