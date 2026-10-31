import axios from 'axios'
import { STORAGE_KEYS } from '../features/auth/constants'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor: Gắn Bearer Token vào header nếu có (trừ route auth public)
apiClient.interceptors.request.use(
  (config) => {
    const isPublicAuth =
      config.url?.includes('/auth/login') || config.url?.includes('/auth/register')

    if (!isPublicAuth) {
      const token =
        localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
        sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } else {
      // Đảm bảo request login/register không bị dính token cũ
      delete config.headers.Authorization
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

    // Xử lý khi Token hết hạn hoặc tài khoản bị khóa
    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.ACCOUNT)
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      sessionStorage.removeItem(STORAGE_KEYS.ACCOUNT)
    }

    return Promise.reject(error)
  }
)

export default apiClient
