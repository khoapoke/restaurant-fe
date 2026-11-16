import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../../contexts/AuthContext'
import ChatFloatingButton from './ChatFloatingButton'
import ChatWindowHeader from './ChatWindowHeader'
import ChatMessageList from './ChatMessageList'
import ChatInputBar from './ChatInputBar'
import ChatSessionHistoryDrawer from './ChatSessionHistoryDrawer'
import ChatLoginPrompt from './ChatLoginPrompt'
import {
  getActiveCustomerChatSessionApi,
  createCustomerChatSessionApi,
  getCustomerChatSessionDetailApi,
  sendCustomerChatMessageApi,
  requestStaffApi,
  closeCustomerChatSessionApi,
  getCustomerChatSessionsApi,
} from '../services/chatService'
import { ChatSessionStatus } from '../constants'

export const CustomerChatWidget = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const isExcludedRoute =
    location.pathname.startsWith('/admin') ||
    ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname)

  const [isOpen, setIsOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [sessions, setSessions] = useState([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [isRequestingStaff, setIsRequestingStaff] = useState(false)
  const [isEndingSession, setIsEndingSession] = useState(false)

  const pollingRef = useRef(null)

  const loadInitialSession = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const activeRes = await getActiveCustomerChatSessionApi()
      const activeData = activeRes.data?.data ?? activeRes.data
      if (activeData?.sessionId) {
        setSession(activeData)
      } else {
        const createRes = await createCustomerChatSessionApi()
        setSession(createRes.data?.data ?? createRes.data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isOpen && !session && isAuthenticated) loadInitialSession()
  }, [isOpen, session, isAuthenticated, loadInitialSession])

  const loadHistorySessions = useCallback(async () => {
    try {
      const res = await getCustomerChatSessionsApi({ page: 1 })
      const raw = res.data?.data ?? res.data
      setSessions(Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : (raw?.items || [])))
    } catch {}
  }, [])

  const handleToggleHistory = () => {
    const next = !isHistoryOpen
    setIsHistoryOpen(next)
    if (next) loadHistorySessions()
  }

  useEffect(() => {
    const status = session?.status
    const needsPolling =
      isOpen &&
      session?.sessionId &&
      (status === ChatSessionStatus.WAITING_STAFF || status === ChatSessionStatus.STAFF_CONNECTED)

    if (needsPolling) {
      pollingRef.current = setInterval(async () => {
        try {
          const detailRes = await getCustomerChatSessionDetailApi(session.sessionId)
          const detailData = detailRes.data?.data ?? detailRes.data
          if (detailData) setSession(detailData)
        } catch {}
      }, 5000)
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [isOpen, session?.sessionId, session?.status])

  const handleSendMessage = async (content) => {
    if (!session?.sessionId) return
    const tempUserMsg = {
      messageId: `temp-${Date.now()}`,
      sessionId: session.sessionId,
      senderType: 'CUSTOMER',
      content,
      createdAt: new Date().toISOString(),
    }

    setSession((prev) => ({ ...prev, messages: [...(prev?.messages || []), tempUserMsg] }))
    if (session.status === ChatSessionStatus.BOT) setIsBotTyping(true)

    try {
      const res = await sendCustomerChatMessageApi(session.sessionId, { content })
      const payload = res.data?.data ?? res.data

      setSession((prev) => {
        const remaining = (prev?.messages || []).filter((m) => m.messageId !== tempUserMsg.messageId)
        const updated = [...remaining, payload?.sentMessage || tempUserMsg]
        if (payload?.botReply) updated.push(payload.botReply)
        return {
          ...prev,
          status: payload?.session?.status || prev.status,
          messages: updated,
        }
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi gửi tin nhắn.')
    } finally {
      setIsBotTyping(false)
    }
  }

  const handleRequestStaff = async () => {
    if (!session?.sessionId || isRequestingStaff) return
    setIsRequestingStaff(true)
    try {
      const reqRes = await requestStaffApi(session.sessionId)
      const resData = reqRes.data?.data ?? reqRes.data
      setSession((prev) => ({
        ...prev,
        status: ChatSessionStatus.WAITING_STAFF,
        messages: [
          ...(prev?.messages || []),
          {
            messageId: `sys-${Date.now()}`,
            sessionId: session.sessionId,
            senderType: 'BOT',
            content: resData?.message || 'Yêu cầu của bạn đã được chuyển đến nhân viên lễ tân T-ResMK. Vui lòng giữ cửa sổ chat, nhân viên sẽ kết nối hỗ trợ bạn ngay.',
            createdAt: new Date().toISOString(),
          },
        ],
      }))
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể yêu cầu nhân viên lúc này.')
    } finally {
      setIsRequestingStaff(false)
    }
  }

  const handleEndSession = async () => {
    if (!session?.sessionId || isEndingSession) return
    if (!window.confirm('Bạn có muốn kết thúc phiên trò chuyện này không?')) return

    setIsEndingSession(true)
    try {
      const res = await closeCustomerChatSessionApi(session.sessionId)
      const closedData = res.data?.data ?? res.data
      setSession((prev) => ({ ...prev, ...(closedData || {}), status: ChatSessionStatus.CLOSED }))
      loadHistorySessions()
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể kết thúc phiên lúc này.')
    } finally {
      setIsEndingSession(false)
    }
  }

  const handleSelectSession = async (sessionId) => {
    setLoading(true)
    try {
      const detailRes = await getCustomerChatSessionDetailApi(sessionId)
      const detailData = detailRes.data?.data ?? detailRes.data
      if (detailData) setSession(detailData)
      setIsHistoryOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNewSession = async () => {
    setLoading(true)
    try {
      const createRes = await createCustomerChatSessionApi()
      setSession(createRes.data?.data ?? createRes.data)
      setIsHistoryOpen(false)
      loadHistorySessions()
    } finally {
      setLoading(false)
    }
  }

  if (isExcludedRoute) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {!isOpen && <ChatFloatingButton onClick={() => setIsOpen(true)} />}

      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] max-h-[82vh] bg-surface-card border border-border-subtle rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-fade-in">
          {!isAuthenticated ? (
            <ChatLoginPrompt
              onClose={() => setIsOpen(false)}
              onLogin={() => {
                setIsOpen(false)
                navigate('/login')
              }}
            />
          ) : (
            <>
              <ChatWindowHeader
                session={session}
                onToggleHistory={handleToggleHistory}
                onRequestStaff={handleRequestStaff}
                onEndSession={handleEndSession}
                onClose={() => setIsOpen(false)}
                isRequestingStaff={isRequestingStaff}
                isEndingSession={isEndingSession}
              />
              <ChatMessageList
                messages={session?.messages || []}
                isBotTyping={isBotTyping}
                onSelectPrompt={handleSendMessage}
                sessionStatus={session?.status || ChatSessionStatus.BOT}
              />
              <ChatInputBar
                onSendMessage={handleSendMessage}
                disabled={loading || isBotTyping}
                isClosed={session?.status === ChatSessionStatus.CLOSED}
              />
              <ChatSessionHistoryDrawer
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                sessions={sessions}
                activeSessionId={session?.sessionId}
                onSelectSession={handleSelectSession}
                onCreateNewSession={handleCreateNewSession}
                loading={loading}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomerChatWidget
