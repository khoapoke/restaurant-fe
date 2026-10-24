import axios from 'axios'
import { AUTH_EXPIRED_EVENT, STORAGE_KEYS } from '../features/auth/constants'
import { translateApiMessage } from './apiError'
import { clearAllPending } from '../features/communications/pendingMessages'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor: Gắn Bearer Token vào header nếu có
apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Xử lý response và bắt mã lỗi tập trung
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const isAuthRequest = /\/auth\/(login|register)$/.test(error.config?.url || '')
    const isLocked = status === 403 && /locked/i.test(error.response?.data?.message || '')

    if (typeof error.response?.data?.message === 'string') {
      error.response.data.message = translateApiMessage(error.response.data.message)
    }

    // Token hết hạn hoặc tài khoản bị khóa: xóa phiên lưu trữ và báo AuthContext đăng xuất ngay
    if (!isAuthRequest && (status === 401 || isLocked)) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.ACCOUNT)
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      sessionStorage.removeItem(STORAGE_KEYS.ACCOUNT)
      clearAllPending()
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, {
        detail: { reason: isLocked ? 'LOCKED' : 'EXPIRED' },
      }))
    }

    return Promise.reject(error)
  }
)

export default apiClient
