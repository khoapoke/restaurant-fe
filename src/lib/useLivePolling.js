import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Polling "gần realtime" ổn định cho Live Dining, POS và KDS (ADR-020: không dùng WebSocket).
 *
 * - Chuỗi setTimeout (không setInterval) nên không bao giờ có hai request chồng nhau.
 * - Huỷ request đang chạy bằng AbortController khi unmount hoặc khi gọi `refresh()`.
 * - Tab bị ẩn: giãn chu kỳ (`hiddenInterval`) hoặc dừng hẳn nếu `hiddenInterval = 0`;
 *   quay lại tab thì đồng bộ ngay.
 * - Lỗi mạng: backoff 2× tới `maxBackoff`, trạng thái chuyển `reconnecting` → `offline`.
 *
 * `fetcher({ signal, previous })` trả về dữ liệu mới. Trả về `undefined` để giữ nguyên
 * dữ liệu cũ (ví dụ server báo `changed: false`).
 */
export const useLivePolling = (fetcher, {
  interval = 3000,
  hiddenInterval = 15000,
  maxBackoff = 20000,
  enabled = true,
} = {}) => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(enabled ? 'connecting' : 'idle')
  const [lastSyncedAt, setLastSyncedAt] = useState(null)

  const fetcherRef = useRef(fetcher)
  const dataRef = useRef(null)
  const timerRef = useRef(null)
  const controllerRef = useRef(null)
  const failuresRef = useRef(0)
  const runRef = useRef(null)

  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const applyData = useCallback((next) => {
    const value = typeof next === 'function' ? next(dataRef.current) : next
    dataRef.current = value
    setData(value)
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    let disposed = false

    const schedule = (delay) => {
      window.clearTimeout(timerRef.current)
      if (disposed || delay <= 0) return
      timerRef.current = window.setTimeout(() => runRef.current?.(), delay)
    }

    const nextDelay = () => {
      if (failuresRef.current > 0) return Math.min(maxBackoff, interval * 2 ** failuresRef.current)
      if (document.visibilityState === 'hidden') return hiddenInterval
      return interval
    }

    const run = async () => {
      window.clearTimeout(timerRef.current)
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      try {
        const next = await fetcherRef.current({ signal: controller.signal, previous: dataRef.current })
        if (disposed || controller.signal.aborted) return
        if (next !== undefined) applyData(next)
        failuresRef.current = 0
        setError(null)
        setStatus('live')
        setLastSyncedAt(new Date())
      } catch (requestError) {
        if (disposed || controller.signal.aborted || requestError?.code === 'ERR_CANCELED') return
        setError(requestError)
        // Lỗi nghiệp vụ (4xx) không phải mất kết nối: giữ chu kỳ bình thường.
        const httpStatus = requestError?.response?.status
        if (httpStatus && httpStatus < 500 && httpStatus !== 429) {
          failuresRef.current = 0
          setStatus('error')
        } else {
          failuresRef.current += 1
          setStatus(failuresRef.current >= 3 ? 'offline' : 'reconnecting')
        }
      } finally {
        if (!disposed && controllerRef.current === controller) schedule(nextDelay())
      }
    }

    runRef.current = run

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') run()
      else if (hiddenInterval <= 0) {
        window.clearTimeout(timerRef.current)
        controllerRef.current?.abort()
      }
    }
    const handleOnline = () => run()

    run()
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('online', handleOnline)

    return () => {
      disposed = true
      runRef.current = null
      window.clearTimeout(timerRef.current)
      controllerRef.current?.abort()
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('online', handleOnline)
    }
  }, [enabled, interval, hiddenInterval, maxBackoff, applyData])

  const refresh = useCallback(() => runRef.current?.(), [])

  return { data, setData: applyData, error, status, lastSyncedAt, refresh }
}

export default useLivePolling
