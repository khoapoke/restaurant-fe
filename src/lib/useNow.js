import { useEffect, useState } from 'react'

/**
 * Đồng hồ dùng chung cho các bộ đếm thời gian chờ (giữ component thuần, không gọi
 * Date.now() khi render). `offsetMs` bù lệch giờ giữa máy khách và máy chủ.
 */
export const useNow = (tickMs = 1000, offsetMs = 0) => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), tickMs)
    return () => window.clearInterval(timer)
  }, [tickMs])

  return now + offsetMs
}

export const minutesSince = (isoValue, now) => {
  if (!isoValue) return 0
  return Math.max(0, Math.floor((now - new Date(isoValue).getTime()) / 60000))
}

export const formatWait = (minutes) => {
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút`
  return `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`
}

export default useNow
