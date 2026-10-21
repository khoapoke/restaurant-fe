import { useCallback, useEffect, useState } from 'react'
import { apiErrorMessage } from './apiError'

/**
 * Tải dữ liệu từ API với đủ trạng thái loading / refreshing / error / reload.
 * `loader` phải được bọc useCallback ở nơi gọi; mỗi lần loader đổi (ví dụ bộ lọc đổi) sẽ tải lại,
 * phản hồi cũ về muộn bị bỏ qua để tránh hiển thị sai dữ liệu.
 */
export const useApiResource = (loader, { fallbackError = 'Không thể tải dữ liệu. Vui lòng thử lại.' } = {}) => {
  const [state, setState] = useState({ data: null, loading: true, refreshing: false, error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    loader()
      .then((data) => {
        if (active) setState({ data, loading: false, refreshing: false, error: null })
      })
      .catch((error) => {
        if (active) setState((current) => ({ ...current, loading: false, refreshing: false, error: apiErrorMessage(error, fallbackError) }))
      })
    return () => { active = false }
  }, [loader, version, fallbackError])

  const reload = useCallback(({ quiet = false } = {}) => {
    setState((current) => ({
      ...current,
      loading: !quiet && !current.data,
      refreshing: true,
      error: quiet ? current.error : null,
    }))
    setVersion((value) => value + 1)
  }, [])

  return { ...state, reload }
}

export default useApiResource
