import axios from 'axios'
import { translateApiMessage } from './apiError'

/**
 * Axios riêng cho các endpoint công khai (Live Dining tại bàn).
 * Không gắn Bearer token của nhân viên/khách hàng và không phát sự kiện đăng xuất,
 * để lỗi của trang QR không ảnh hưởng tới phiên đăng nhập trên cùng trình duyệt.
 */
const publicApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 12000,
})

publicApiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (typeof error.response?.data?.message === 'string') {
      // Giữ message gốc để logic nghiệp vụ (ví dụ phân loại lỗi idempotency) không phụ thuộc bản dịch.
      error.response.data.rawMessage = error.response.data.message
      error.response.data.message = translateApiMessage(error.response.data.message)
    }
    return Promise.reject(error)
  }
)

export default publicApiClient
