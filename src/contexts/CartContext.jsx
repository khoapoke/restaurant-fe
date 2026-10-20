import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
} from '../features/customer/cart/services/cartService'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { isAuthenticated, role } = useAuth()
  const isCustomer = isAuthenticated && role === 'CUSTOMER'

  const [cart, setCart] = useState({
    cartId: null,
    accountId: null,
    items: [],
    totalQuantity: 0,
    estimatedTotalAmount: 0,
  })
  const [loading, setLoading] = useState(false)
  const [updatingDishIds, setUpdatingDishIds] = useState([])

  // Lấy dữ liệu giỏ hàng từ server
  const fetchCart = useCallback(async () => {
    if (!isCustomer) return
    setLoading(true)
    try {
      const response = await getCartApi()
      if (response.data) {
        setCart(response.data)
      }
    } catch {
      // Nếu giỏ trống hoặc lỗi tạm thời, giữ giỏ sạch
    } finally {
      setLoading(false)
    }
  }, [isCustomer])

  useEffect(() => {
    if (isCustomer) {
      fetchCart()
    } else {
      setCart({
        cartId: null,
        accountId: null,
        items: [],
        totalQuantity: 0,
        estimatedTotalAmount: 0,
      })
    }
  }, [isCustomer, fetchCart])

  // Thêm món vào giỏ
  const addToCart = async (payload) => {
    const response = await addToCartApi(payload)
    if (response.data) {
      setCart(response.data)
    }
    return response
  }

  // Cập nhật số lượng món
  const updateQuantity = async (dishId, quantity) => {
    setUpdatingDishIds((prev) => [...prev, dishId])
    try {
      const response = await updateCartItemApi(dishId, quantity)
      if (response.data) {
        setCart(response.data)
      }
      return response
    } finally {
      setUpdatingDishIds((prev) => prev.filter((id) => id !== dishId))
    }
  }

  // Xóa món khỏi giỏ
  const removeFromCart = async (dishId) => {
    setUpdatingDishIds((prev) => [...prev, dishId])
    try {
      const response = await removeCartItemApi(dishId)
      if (response.data) {
        setCart(response.data)
      }
      return response
    } finally {
      setUpdatingDishIds((prev) => prev.filter((id) => id !== dishId))
    }
  }

  const isDishUpdating = (dishId) => updatingDishIds.includes(dishId)

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalQuantity: cart.totalQuantity || 0,
        estimatedTotalAmount: cart.estimatedTotalAmount || 0,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        isDishUpdating,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
