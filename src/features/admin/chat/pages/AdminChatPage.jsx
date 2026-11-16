import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getStaffChatSessionsApi,
  assignChatSessionApi,
  sendStaffChatMessageApi,
  closeChatSessionApi,
  getStaffChatSessionDetailApi,
} from '../services/adminChatService'
import AdminChatHeader from '../components/AdminChatHeader'
import PendingSessionQueue from '../components/PendingSessionQueue'
import StaffChatRoom from '../components/StaffChatRoom'
import ChatRoomEmptyState from '../components/ChatRoomEmptyState'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'
import { ChatSessionStatus } from '../constants'

export const AdminChatPage = () => {
  const [activeTab, setActiveTab] = useState('WAITING_STAFF')
  const [searchQuery, setSearchQuery] = useState('')
  const [waitingCount, setWaitingCount] = useState(0)

  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState(null)

  const [isAssigning, setIsAssigning] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const pollIntervalRef = useRef(null)

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 3000)
  }

  const fetchWaitingCount = useCallback(async () => {
    try {
      const res = await getStaffChatSessionsApi({ status: 'WAITING_STAFF', perPage: 1 })
      const raw = res.data?.data ?? res.data
      const total = raw?.meta?.total ?? (Array.isArray(raw?.data) ? raw.data.length : 0)
      setWaitingCount(total)
    } catch {}
  }, [])

  const fetchSessions = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true)
      setError(null)
      try {
        const params = { page: 1, perPage: 25 }
        if (activeTab === 'WAITING_STAFF') params.status = 'WAITING_STAFF'
        else if (activeTab === 'STAFF_CONNECTED') {
          params.status = 'STAFF_CONNECTED'
          params.assigned_to_me = true
        } else if (activeTab === 'CLOSED') params.status = 'CLOSED'

        if (searchQuery.trim()) params.search = searchQuery.trim()

        const res = await getStaffChatSessionsApi(params)
        const raw = res.data?.data ?? res.data
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : raw?.items || []

        setSessions(list)
        if (activeTab === 'WAITING_STAFF') setWaitingCount(raw?.meta?.total ?? list.length)
        else fetchWaitingCount()
      } catch (err) {
        if (!isSilent) {
          setError(err.response?.data?.message || 'Không thể tải danh sách phiên hỗ trợ.')
        }
      } finally {
        if (!isSilent) setLoading(false)
      }
    },
    [activeTab, searchQuery, fetchWaitingCount]
  )

  const refreshActiveSession = useCallback(async (sessionId) => {
    if (!sessionId) return
    try {
      const res = await getStaffChatSessionDetailApi(sessionId)
      const data = res.data?.data ?? res.data
      if (data) setActiveSession(data)
    } catch {}
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      fetchSessions(true)
      if (activeSession?.sessionId && activeSession?.status === ChatSessionStatus.STAFF_CONNECTED) {
        refreshActiveSession(activeSession.sessionId)
      }
    }, 8000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [fetchSessions, refreshActiveSession, activeSession?.sessionId, activeSession?.status])

  const handleSelectSession = async (sess) => {
    const id = sess.sessionId || sess.ma_phien
    try {
      const res = await getStaffChatSessionDetailApi(id)
      const data = res.data?.data ?? res.data
      setActiveSession(data || sess)
    } catch {
      setActiveSession(sess)
    }
  }

  const handleAssign = async (sessionId) => {
    setIsAssigning(true)
    try {
      const res = await assignChatSessionApi(sessionId)
      const assignedData = res.data?.data ?? res.data
      showToast('Đã tiếp nhận phiên hỗ trợ khách hàng!')
      setActiveSession((prev) => ({
        ...(prev || assignedData || {}),
        status: ChatSessionStatus.STAFF_CONNECTED,
      }))
      setActiveTab('STAFF_CONNECTED')
      refreshActiveSession(sessionId)
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi tiếp nhận phiên.')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleSendMessage = async (content) => {
    if (!activeSession?.sessionId || isSending) return
    setIsSending(true)
    try {
      const res = await sendStaffChatMessageApi(activeSession.sessionId, { content })
      const newMsg = res.data?.data ?? res.data
      setActiveSession((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), newMsg],
      }))
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể gửi tin nhắn.')
    } finally {
      setIsSending(false)
    }
  }

  const handleCloseSession = async (sessionId) => {
    const confirmed = window.confirm('Bạn có chắc muốn hoàn tất và đóng phiên hỗ trợ này không?')
    if (!confirmed) return

    setIsClosing(true)
    try {
      await closeChatSessionApi(sessionId)
      showToast('Đã hoàn tất và đóng phiên hỗ trợ!')
      setActiveSession((prev) => ({
        ...prev,
        status: ChatSessionStatus.CLOSED,
      }))
      fetchSessions(true)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể đóng phiên lúc này.')
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <div className="space-y-4 font-sans">
      <AdminChatHeader loading={loading} onRefresh={() => fetchSessions()} />

      {successToast && (
        <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />
      )}
      {error && (
        <Alert
          type="error"
          message={error}
          action={
            <Button variant="outline" size="sm" onClick={() => fetchSessions()}>
              Thử lại
            </Button>
          }
        />
      )}

      {loading && sessions.length === 0 ? (
        <div className="h-[580px] p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
          <Skeleton className="h-10 w-full bg-surface-subtle" />
          <Skeleton className="h-32 w-full bg-surface-subtle" />
          <Skeleton className="h-32 w-full bg-surface-subtle" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 h-[600px]">
          <PendingSessionQueue
            sessions={sessions}
            activeSessionId={activeSession?.sessionId}
            activeTab={activeTab}
            onChangeTab={(tabId) => setActiveTab(tabId)}
            waitingCount={waitingCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectSession={handleSelectSession}
            onAssign={handleAssign}
            onRefresh={() => fetchSessions(true)}
            loading={loading}
            isAssigning={isAssigning}
          />

          {activeSession ? (
            <StaffChatRoom
              session={activeSession}
              onSendMessage={handleSendMessage}
              onAssign={handleAssign}
              onCloseSession={handleCloseSession}
              isSending={isSending}
              isAssigning={isAssigning}
              isClosing={isClosing}
            />
          ) : (
            <ChatRoomEmptyState />
          )}
        </div>
      )}
    </div>
  )
}

export default AdminChatPage
