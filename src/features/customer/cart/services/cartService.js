import apiClient from '../../../../lib/axios'

/**
 * Service gọi API Giỏ hàng khách hàng
 * Tham chiếu đặc tả: docs/modules/cart.md
 */

export const getCartApi = async () => {
  return await apiClient.get('/customer/cart')
}

export const addToCartApi = async ({
  dishId,
  quantity = 1,
  selectedOptions = null,
  itemNote = null,
}) => {
  return await apiClient.post('/customer/cart/items', {
    dishId,
    quantity,
    selectedOptions,
    itemNote,
  })
}

export const updateCartItemApi = async (dishId, quantity) => {
  return await apiClient.put(`/customer/cart/items/${dishId}`, {
    quantity,
  })
}

export const removeCartItemApi = async (dishId) => {
  return await apiClient.delete(`/customer/cart/items/${dishId}`)
}
