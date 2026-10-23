import { useCallback, useEffect, useRef, useState } from 'react'
import { apiErrorMessage } from '../../../../lib/apiError'

/**
 * Thu tiền tại POS an toàn trước mất phản hồi (review D).
 *
 * Trước khi gọi API, khoản thu (Idempotency-Key + nội dung đã chốt) được ghi vào localStorage theo
 * hóa đơn. Mọi lần gửi lại — kể cả sau reload — dùng đúng khóa và nội dung đó, nên backend trả lại
 * khoản đã ghi thay vì thu thêm. Chỉ xóa bản ghi khi đã biết chắc kết quả:
 * - 2xx: đã ghi nhận;
 * - 4xx nghiệp vụ: backend từ chối trong transaction, chưa ghi gì;
 * - lỗi mạng, timeout, 5xx, 429: chưa rõ → giữ nguyên, chỉ cho "Gửi lại khoản thu" (cùng khóa) hoặc
 *   bỏ qua sau khi nhân viên đã kiểm tra.
 * Một lần thu mới thật sự luôn có khóa mới, nên vẫn phân biệt được với lần gửi lại.
 */
const storageKey = (invoiceId) => `moc.pos.payment.${invoiceId}`

const readPending = (invoiceId) => {
  if (!invoiceId) return null
  try {
    const raw = window.localStorage.getItem(storageKey(invoiceId))
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.key && parsed?.payload ? parsed : null
  } catch {
    return null
  }
}

const writePending = (invoiceId, value) => {
  try {
    if (value) window.localStorage.setItem(storageKey(invoiceId), JSON.stringify(value))
    else window.localStorage.removeItem(storageKey(invoiceId))
    return true
  } catch {
    return false
  }
}

const isUnknownOutcome = (error) => {
  const response = error?.response
  return !response || response.status >= 500 || response.status === 429 || error?.code === 'ECONNABORTED'
}

const newKey = () => `pay-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`

export const usePendingPayment = ({ invoiceId, submit, onRecorded, onRejected }) => {
  const [pending, setPending] = useState(() => readPending(invoiceId))
  const [sending, setSending] = useState(false)
  const inFlightRef = useRef(false)
  const autoCheckedRef = useRef(null)

  // Đổi hóa đơn (lập lại phiên bản mới) thì đọc lại bản ghi của hóa đơn đó.
  const [trackedInvoiceId, setTrackedInvoiceId] = useState(invoiceId)
  if (trackedInvoiceId !== invoiceId) {
    setTrackedInvoiceId(invoiceId)
    setPending(readPending(invoiceId))
  }

  const persist = useCallback((value) => {
    if (invoiceId) writePending(invoiceId, value)
    setPending(value)
  }, [invoiceId])

  const send = useCallback(async (entry) => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    setSending(true)
    try {
      await submit(entry.payload, entry.key)
      persist(null)
      onRecorded(entry.payload, entry.attempts > 0)
    } catch (error) {
      if (isUnknownOutcome(error)) {
        persist({ ...entry, attempts: (entry.attempts || 0) + 1, lastTriedAt: new Date().toISOString() })
        onRejected(`Chưa nhận được phản hồi cho khoản thu ${Number(entry.payload.amount).toLocaleString('vi-VN')} ₫. Khoản này được giữ nguyên — bấm “Gửi lại khoản thu” để thử lại an toàn, hệ thống không ghi trùng.`, true)
      } else {
        persist(null)
        onRejected(apiErrorMessage(error, 'Chưa ghi nhận được khoản thu.'), false)
      }
    } finally {
      inFlightRef.current = false
      setSending(false)
    }
  }, [submit, persist, onRecorded, onRejected])

  /** Thu một khoản mới; nếu còn khoản chưa rõ kết quả thì chỉ được gửi lại khoản đó. */
  const collect = useCallback((payload) => {
    if (pending) return send(pending)
    const entry = { key: newKey(), payload, invoiceId, createdAt: new Date().toISOString(), attempts: 0 }
    if (!writePending(invoiceId, entry)) {
      onRejected('Trình duyệt đang chặn bộ nhớ nên chưa thể thu tiền an toàn. Hãy tắt chế độ riêng tư rồi thử lại.', false)
      return undefined
    }
    setPending(entry)
    return send(entry)
  }, [pending, send, invoiceId, onRejected])

  // Sau reload: tự gửi lại khoản treo một lần, đúng khóa cũ.
  useEffect(() => {
    if (!pending || autoCheckedRef.current === pending.key) return
    autoCheckedRef.current = pending.key
    const resume = pending
    Promise.resolve().then(() => send(resume))
  }, [pending, send])

  return {
    pending,
    sending,
    collect,
    retry: () => pending && send(pending),
    discard: () => persist(null),
  }
}

export default usePendingPayment
