import { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'

/**
 * Đồng Hồ Đếm Ngược Thanh Toán QR (QrCountdownTimer)
 * - Cô lập chu kỳ đếm giây để chống re-render toàn bộ modal
 * - Độ dài < 50 dòng
 */
export default function QrCountdownTimer({
  initialSeconds = 900,
  onExpire,
}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const timerRef = useRef(null)

  useEffect(() => {
    setSecondsLeft(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [onExpire])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`
  const isUrgent = secondsLeft < 180

  return (
    <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-surface-bg border border-border-subtle">
      <span className="text-text-muted flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-brand-primary" />
        <span>Thời gian quét mã còn:</span>
      </span>
      <span
        className={`font-mono font-bold tracking-wider ${
          isUrgent ? 'text-status-error animate-pulse' : 'text-brand-primary'
        }`}
      >
        {timeFormatted}
      </span>
    </div>
  )
}

