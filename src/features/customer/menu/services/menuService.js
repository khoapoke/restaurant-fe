import apiClient from '../../../../lib/axios'

/**
 * Service gọi API Thực đơn & Gợi ý thời tiết
 * Tham chiếu đặc tả: docs/modules/menu.md
 */

export const getCategoriesApi = async () => {
  return await apiClient.get('/customer/categories')
}

export const getDishesApi = async (params = {}) => {
  // Loại bỏ các giá trị undefined hoặc rỗng để query string sạch
  const cleanParams = Object.entries(params).reduce((acc, [key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      acc[key] = val
    }
    return acc
  }, {})

  return await apiClient.get('/customer/dishes', { params: cleanParams })
}

export const getDishDetailApi = async (dishId) => {
  return await apiClient.get(`/customer/dishes/${dishId}`)
}

export const getWeatherRecommendationsApi = async (lat, lon) => {
  return await apiClient.get('/customer/recommendations/weather', {
    params: { lat, lon },
  })
}
