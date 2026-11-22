import { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'

/**
 * Đồng Hồ Đếm Ngược Thanh Toán QR (QrCountdownTimer)
 * - Tính thời gian còn lại theo mốc thực tế (expiresAt + sessionStorage)
 * - Không bị reset lại 15 phút khi khách đóng Modal đi và mở lại
 * - Độ dài < 85 dòng
 */
export default function QrCountdownTimer({
  expiresAt,
  storageKey,
  initialSeconds = 900,
  onExpire,
}) {
  const resolveDeadlineMs = () => {
    if (expiresAt) {
      const parsed = new Date(expiresAt).getTime()
      if (!Number.isNaN(parsed)) {
        if (storageKey) sessionStorage.setItem(storageKey, String(parsed))
        return parsed
      }
    }
    if (storageKey) {
      const saved = Number(sessionStorage.getItem(storageKey))
      if (saved && !Number.isNaN(saved)) return saved
    }
    const fallback = Date.now() + initialSeconds * 1000
    if (storageKey) sessionStorage.setItem(storageKey, String(fallback))
    return fallback
  }

  const [secondsLeft, setSecondsLeft] = useState(() => {
    const diff = Math.ceil((resolveDeadlineMs() - Date.now()) / 1000)
    return Math.max(0, diff)
  })
  const expiredNotifiedRef = useRef(false)

  useEffect(() => {
    expiredNotifiedRef.current = false
    const deadlineMs = resolveDeadlineMs()

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining <= 0 && !expiredNotifiedRef.current) {
        expiredNotifiedRef.current = true
        onExpire?.()
      }
    }

    tick()
    const timerId = setInterval(tick, 1000)
    return () => clearInterval(timerId)
  }, [expiresAt, storageKey, initialSeconds, onExpire])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeFormatted = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
  const isUrgent = secondsLeft < 180

  return (
    <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-surface-bg border border-border-subtle">
      <span className="text-text-muted flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-brand-primary" />
        <span>Thời gian quét mã còn:</span>
      </span>
      <span
        className={`font-mono font-bold tracking-wider ${
          secondsLeft === 0
            ? 'text-status-error'
            : isUrgent
            ? 'text-status-error animate-pulse'
            : 'text-brand-primary'
        }`}
      >
        {secondsLeft === 0 ? '00:00 (Đã hết hạn)' : timeFormatted}
      </span>
    </div>
  )
}
