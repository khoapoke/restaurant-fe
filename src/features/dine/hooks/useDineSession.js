import { useCallback, useEffect, useRef, useState } from 'react'
import useLivePolling from '../../../lib/useLivePolling'
import {
  cancelCheckInApi,
  cancelServiceRequestApi,
  getTableStateApi,
  joinTableApi,
  raiseServiceRequestApi,
  requestCheckInApi,
  submitTableOrderApi,
} from '../services/dineService'
import { ITEM_STATUS_META } from '../constants'

const storageKey = (tableToken) => `moc.dine.visit.${tableToken}`

const readVisitToken = (tableToken) => {
  try {
    return window.localStorage.getItem(storageKey(tableToken))
  } catch {
    return null
  }
}

const writeVisitToken = (tableToken, token) => {
  try {
    if (token) window.localStorage.setItem(storageKey(tableToken), token)
    else window.localStorage.removeItem(storageKey(tableToken))
  } catch {
    // Trình duyệt chặn bộ nhớ: phiên vẫn chạy trong tab hiện tại.
  }
}

/** So sánh hai snapshot để báo các thay đổi đáng chú ý (món xong, nhân viên đang đến...). */
const diffEvents = (previous, next) => {
  if (!previous?.rounds || !next?.rounds) return []
  const events = []
  const before = new Map(previous.rounds.flatMap((round) => round.items).map((item) => [item.lineId, item.status]))
  next.rounds.flatMap((round) => round.items).forEach((item) => {
    const old = before.get(item.lineId)
    if (old && old !== item.status && ['PREPARING', 'READY', 'SERVED'].includes(item.status)) {
      events.push({ tone: item.status === 'READY' ? 'success' : 'info', message: `${item.dishName}: ${ITEM_STATUS_META[item.status].label.toLowerCase()}` })
    }
  })
  const requestsBefore = new Map((previous.serviceRequests || []).map((request) => [request.requestId, request.status]))
  ;(next.serviceRequests || []).forEach((request) => {
    if (request.isMine && requestsBefore.get(request.requestId) === 'NEW' && request.status === 'ACKNOWLEDGED') {
      events.push({ tone: 'info', message: `${request.label}: nhân viên đang đến bàn bạn` })
    }
  })
  if (previous.invoice?.status !== next.invoice?.status && next.invoice?.status === 'OPEN') {
    events.push({ tone: 'info', message: 'Hóa đơn của bàn đã sẵn sàng' })
  }
  if (previous.invoice?.status === 'OPEN' && next.invoice?.status === 'PAID') {
    events.push({ tone: 'success', message: 'Thanh toán đã được xác nhận. Cảm ơn bạn!' })
  }
  return events
}

/**
 * Trạng thái Live Dining của một bàn: mã thiết bị, polling có version marker,
 * thao tác của khách và thông báo khi trạng thái thay đổi.
 */
export const useDineSession = (tableToken) => {
  const [visitToken, setVisitToken] = useState(() => readVisitToken(tableToken))
  const [fatalError, setFatalError] = useState(null)
  const [events, setEvents] = useState([])
  const [clockOffset, setClockOffset] = useState(0)
  const visitTokenRef = useRef(visitToken)
  const joinAttemptRef = useRef(false)

  const pushEvents = useCallback((items) => {
    if (!items.length) return
    const stamped = items.map((item, index) => ({ ...item, id: `${Date.now()}-${index}` }))
    setEvents((current) => [...current.slice(-3), ...stamped])
  }, [])

  const dismissEvent = useCallback((id) => setEvents((current) => current.filter((event) => event.id !== id)), [])

  const rememberVisit = useCallback((token) => {
    visitTokenRef.current = token
    writeVisitToken(tableToken, token)
    setVisitToken(token)
  }, [tableToken])

  const fetcher = useCallback(async ({ signal, previous }) => {
    try {
      const response = await getTableStateApi(tableToken, {
        visitToken: visitTokenRef.current,
        since: previous?.version,
        signal,
      })
      const snapshot = response.data
      setClockOffset(new Date(snapshot.serverTime).getTime() - Date.now())
      setFatalError(null)
      if (!snapshot.changed) return undefined

      if (visitTokenRef.current && !snapshot.visit) {
        // Mã thiết bị không còn hợp lệ với bàn này (mã QR đã đổi hoặc dữ liệu đã làm mới).
        visitTokenRef.current = null
        writeVisitToken(tableToken, null)
        setVisitToken(null)
      }

      pushEvents(diffEvents(previous, snapshot))
      return snapshot
    } catch (error) {
      if (error?.response?.status === 404) setFatalError(error)
      throw error
    }
  }, [tableToken, pushEvents])

  const polling = useLivePolling(fetcher, { interval: 2500, hiddenInterval: 20000, enabled: !fatalError })
  const { data: state, setData, refresh } = polling

  const applyLive = useCallback((live) => {
    if (live?.changed) setData(live)
  }, [setData])

  const join = useCallback(async (guestName, joinCode) => {
    const response = await joinTableApi(tableToken, { guestName, joinCode }, visitTokenRef.current)
    if (response.data.visitToken) rememberVisit(response.data.visitToken)
    applyLive(response.data.live)
    return response
  }, [tableToken, rememberVisit, applyLive])

  // Link mời từ một khách trong bàn: /dine/{token}#code=1234 → tự tham gia đúng phiên đó.
  // Mã nằm sau dấu # nên không bị gửi lên server/log; xoá khỏi URL ngay sau khi dùng.
  useEffect(() => {
    if (!state || joinAttemptRef.current) return
    const match = window.location.hash.match(/code=(\d{4,8})/)
    if (!match) return
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    if (!state.entry?.requiresJoinCode || state.entry.joinCodeLocked) return
    joinAttemptRef.current = true
    join(undefined, match[1]).catch(() => {}).finally(() => {
      joinAttemptRef.current = false
    })
  }, [state, join])

  const checkIn = useCallback(async ({ guestName, guestCount }) => {
    const response = await requestCheckInApi(tableToken, { guestName, guestCount }, visitTokenRef.current)
    rememberVisit(response.data.visitToken)
    applyLive(response.data.live)
    return response
  }, [tableToken, rememberVisit, applyLive])

  const cancelCheckIn = useCallback(async () => {
    const response = await cancelCheckInApi(tableToken, visitTokenRef.current)
    applyLive(response.data.live)
    return response
  }, [tableToken, applyLive])

  const startOver = useCallback(() => {
    rememberVisit(null)
    setData(null)
    refresh()
  }, [rememberVisit, setData, refresh])

  const submitOrder = useCallback(async (items, idempotencyKey, expectedTotal = null) => {
    const response = await submitTableOrderApi(tableToken, visitTokenRef.current, items, idempotencyKey, expectedTotal)
    applyLive(response.data.live)
    return response
  }, [tableToken, applyLive])

  const raiseRequest = useCallback(async (payload) => {
    const response = await raiseServiceRequestApi(tableToken, visitTokenRef.current, payload)
    applyLive(response.data.live)
    return response
  }, [tableToken, applyLive])

  const cancelRequest = useCallback(async (requestId) => {
    const response = await cancelServiceRequestApi(tableToken, visitTokenRef.current, requestId)
    applyLive(response.data.live)
    return response
  }, [tableToken, applyLive])

  return {
    state,
    visitToken,
    status: polling.status,
    error: polling.error,
    fatalError,
    lastSyncedAt: polling.lastSyncedAt,
    clockOffset,
    events,
    dismissEvent,
    refresh,
    checkIn,
    cancelCheckIn,
    join,
    startOver,
    submitOrder,
    raiseRequest,
    cancelRequest,
  }
}

export default useDineSession
