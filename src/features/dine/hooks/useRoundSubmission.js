import { useCallback, useEffect, useRef, useState } from 'react'
import { apiErrorMessage } from '../../../lib/apiError'

/**
 * Gửi lượt món an toàn trước mất mạng, reload và nhiều tab (ADR-022).
 *
 * Trước khi gọi API, lượt món (Idempotency-Key + payload đã chốt + phạm vi bàn/thiết bị)
 * được ghi vào localStorage và tách khỏi giỏ. Mọi lần gửi lại — kể cả sau reload hay từ
 * tab khác — dùng đúng key và đúng payload đó, nên backend trả lại lượt cũ thay vì tạo
 * lượt mới. Bản ghi chỉ bị xoá khi đã biết chắc kết quả:
 * - 2xx: bếp đã nhận (lần đầu hoặc trước đó);
 * - 4xx nghiệp vụ (401/404/409/422): backend đã xử lý và từ chối trong transaction, lượt
 *   chưa được tạo → trả món về giỏ để khách chỉnh;
 * - 409 "key đã dùng với nội dung khác": đã có lượt mang key này → coi như đã nhận.
 * Lỗi mạng, timeout, 5xx, 429: chưa biết kết quả → giữ nguyên, cho phép gửi lại an toàn.
 */
const pendingKey = (tableToken) => `moc.dine.pending.${tableToken}`
const IDEMPOTENCY_MISMATCH = 'Idempotency key was already used with a different request.'

const readPending = (tableToken) => {
  try {
    const raw = window.localStorage.getItem(pendingKey(tableToken))
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.key && Array.isArray(parsed.items) ? parsed : null
  } catch {
    return null
  }
}

const writePending = (tableToken, value) => {
  try {
    if (value) window.localStorage.setItem(pendingKey(tableToken), JSON.stringify(value))
    else window.localStorage.removeItem(pendingKey(tableToken))
    return true
  } catch {
    return false
  }
}

const newRoundKey = () => `dine-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`
const fingerprint = (visitToken) => (visitToken ? visitToken.slice(-16) : null)

const classify = (error) => {
  const response = error?.response
  if (!response || response.status >= 500 || response.status === 429 || error?.code === 'ECONNABORTED') return 'unknown'
  if (response.status === 409 && response.data?.rawMessage === IDEMPOTENCY_MISMATCH) return 'received'
  return 'rejected'
}

export const useRoundSubmission = ({ tableToken, visitToken, submitOrder, cart, canOrder, onSent }) => {
  const [pending, setPending] = useState(() => readPending(tableToken))
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const inFlightRef = useRef(false)
  const autoCheckedRef = useRef(null)

  const persist = useCallback((value) => {
    writePending(tableToken, value)
    setPending(value)
  }, [tableToken])

  // Đồng bộ giữa các tab của cùng thiết bị.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === pendingKey(tableToken)) setPending(readPending(tableToken))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [tableToken])

  const send = useCallback(async (entry) => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    setStatus('sending')
    setError(null)
    try {
      const response = await submitOrder(entry.items, entry.key, entry.expectedTotal ?? null)
      persist(null)
      setStatus('idle')
      onSent({ ...response.data.round, replayed: !response.data.created })
    } catch (requestError) {
      const outcome = classify(requestError)
      if (outcome === 'unknown') {
        persist({ ...entry, attempts: (entry.attempts || 0) + 1, lastTriedAt: new Date().toISOString() })
        setStatus('unknown')
        setError('Chưa nhận được xác nhận từ bếp. Lượt món vẫn được giữ nguyên, bạn có thể gửi lại an toàn mà không bị trùng.')
      } else if (outcome === 'received') {
        persist(null)
        setStatus('idle')
        setNotice('Bếp đã nhận một lượt mang mã này trước đó. Vui lòng xem tab Theo dõi để kiểm tra món.')
      } else {
        persist(null)
        const details = requestError?.response?.data?.errors
        if (details?.reason === 'PRICE_CHANGED') {
          // Giá đổi: trả món về giỏ với giá mới để khách xem lại tổng trước khi gửi (MNU-02).
          const prices = new Map((details.prices || []).map((price) => [price.dishId, price.unitPrice]))
          cart.restoreLines((entry.lines || []).map((line) => (prices.has(line.dishId) ? { ...line, price: prices.get(line.dishId) } : line)))
          setStatus('idle')
          setError(`Giá món vừa thay đổi: tổng lượt này giờ là ${Number(details.currentTotal).toLocaleString('vi-VN')} ₫. Món đã trở lại giỏ với giá mới, vui lòng xem lại rồi gửi.`)
          return
        }
        cart.restoreLines(entry.lines || [])
        setStatus('idle')
        setError(`${apiErrorMessage(requestError, 'Bếp chưa nhận lượt món này.')} Món đã được trả lại giỏ để bạn chỉnh và gửi lại.`)
      }
    } finally {
      inFlightRef.current = false
    }
  }, [submitOrder, persist, onSent, cart])

  /** Chốt giỏ hiện tại thành một lượt (ghi bền vững trước khi gửi), hoặc gửi lại lượt đang chờ. */
  const submit = useCallback(() => {
    if (pending) return send(pending)
    if (!cart.lines.length) return undefined
    const entry = {
      key: newRoundKey(),
      visit: fingerprint(visitToken),
      createdAt: new Date().toISOString(),
      items: cart.lines.map(({ dishId, quantity, note }) => ({ dishId, quantity, note: note || null })),
      lines: cart.lines,
      expectedTotal: cart.lines.every((line) => Number.isFinite(Number(line.price)))
        ? Math.round(cart.lines.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0) * 100) / 100
        : null,
      attempts: 0,
    }
    if (!writePending(tableToken, entry)) {
      setError('Trình duyệt đang chặn bộ nhớ nên chưa thể gửi an toàn. Hãy tắt chế độ riêng tư hoặc gọi nhân viên.')
      return undefined
    }
    setPending(entry)
    cart.clear()
    return send(entry)
  }, [pending, cart, visitToken, tableToken, send])

  // Sau reload / mở tab mới: tự kiểm tra lượt còn treo bằng đúng key cũ (một lần cho mỗi key).
  useEffect(() => {
    if (!pending || !visitToken || autoCheckedRef.current === pending.key) return
    autoCheckedRef.current = pending.key
    if (pending.visit && pending.visit !== fingerprint(visitToken)) {
      // Lượt của một phiên/thiết bị cũ: không gửi vào phiên hiện tại.
      const stale = pending
      Promise.resolve().then(() => {
        persist(null)
        cart.restoreLines(stale.lines || [])
        setNotice('Có một lượt món chưa xác nhận từ phiên trước. Món đã được đưa lại vào giỏ, hãy kiểm tra trước khi gửi.')
      })
      return
    }
    const resume = pending
    Promise.resolve().then(() => send(resume))
  }, [pending, visitToken, send, persist, cart])

  return {
    pending,
    status,
    error,
    notice,
    canSubmit: canOrder && status !== 'sending',
    submit,
    retry: () => pending && send(pending),
    dismissNotice: () => setNotice(null),
    clearError: () => setError(null),
  }
}

export default useRoundSubmission
