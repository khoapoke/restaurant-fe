import apiClient from '../../../../lib/axios'

/**
 * Service Quản lý Danh mục & Món ăn (Admin)
 * Tham chiếu đặc tả: docs/modules/menu.md (MNU-08 -> MNU-17)
 */

// ==================== DANH MỤC (CATEGORIES) ====================

export const getAdminCategoriesApi = async () => {
  try {
    return await apiClient.get('/admin/categories')
  } catch (err) {
    if (err.response?.status === 404) {
      return await apiClient.get('/customer/categories')
    }
    throw err
  }
}

export const createCategoryApi = async (payload) => {
  return await apiClient.post('/admin/categories', payload)
}

export const updateCategoryApi = async (categoryId, payload) => {
  return await apiClient.put(`/admin/categories/${categoryId}`, payload)
}

export const toggleCategoryVisibilityApi = async (categoryId) => {
  return await apiClient.patch(`/admin/categories/${categoryId}/visibility`)
}

export const deleteCategoryApi = async (categoryId) => {
  return await apiClient.delete(`/admin/categories/${categoryId}`)
}

// ==================== MÓN ĂN (DISHES) ====================

export const getAdminDishesApi = async (params = {}) => {
  try {
    return await apiClient.get('/admin/dishes', { params })
  } catch (err) {
    if (err.response?.status === 404) {
      return await apiClient.get('/customer/dishes', { params })
    }
    throw err
  }
}

export const createDishApi = async (payload) => {
  return await apiClient.post('/admin/dishes', payload)
}

export const updateDishApi = async (dishId, payload) => {
  return await apiClient.put(`/admin/dishes/${dishId}`, payload)
}

export const toggleDishAvailabilityApi = async (dishId) => {
  return await apiClient.patch(`/admin/dishes/${dishId}/availability`)
}

export const toggleDishVisibilityApi = async (dishId) => {
  return await apiClient.patch(`/admin/dishes/${dishId}/visibility`)
}

export const deleteDishApi = async (dishId) => {
  return await apiClient.delete(`/admin/dishes/${dishId}`)
}

