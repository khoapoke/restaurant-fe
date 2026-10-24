import { MessageCircle, Sparkles, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import useLivePolling from '../../lib/useLivePolling'
import { apiErrorMessage } from '../../lib/apiError'
import ChatMessages from './ChatMessages'
import ChatComposer from './ChatComposer'
import { chatActionApi, chatApi, currentChatApi, openChatApi, sendChatApi } from './services'

const STATUS = { AI: 'Trợ lý AI · có thể chuyển nhân viên', WAITING: 'Đang chờ nhân viên tiếp nhận', HUMAN: 'Nhân viên đang hỗ trợ · AI đã tạm dừng', CLOSED: 'Hội thoại đã kết thúc' }

function CustomerChat({ accountId, initialId }) {
  const [selected, setSelected] = useState(initialId)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { data, setData, refresh, status } = useLivePolling(async ({ signal }) => {
    const response = selected ? await chatApi(selected, signal) : await currentChatApi(signal)
    return response.data.conversation
  }, { interval: 2500, hiddenInterval: 0, resetKey: String(selected ?? 'current') })
  const update = (conversation) => {
    setData(conversation)
    // Hội thoại khác (mở cuộc mới): đổi resetKey để hook hủy request cũ và tải đúng cuộc mới ngay.
    if (conversation.conversationId === selected) refresh()
    else setSelected(conversation.conversationId)
  }
  const action = async (name) => {
    setBusy(true)
    setError('')
    try {
      const response = name === 'open' ? await openChatApi() : await chatActionApi(data.conversationId, name)
      update(response.data.conversation)
    } catch (requestError) { setError(apiErrorMessage(requestError)) }
    finally { setBusy(false) }
  }

  return <>
    <div className="flex items-center justify-between gap-3 border-b border-[#d8cbc0] px-4 py-3 text-xs text-[#625a55]">
      <span>{STATUS[data?.status] || 'Tư vấn món · đặt bàn · hỗ trợ đơn hàng'}</span>
      {data?.status === 'AI' && <button disabled={busy} onClick={() => action('handoff')} className="shrink-0 rounded-full border border-[#6f1d32] px-3 py-2 font-semibold text-[#6f1d32]">Gặp nhân viên</button>}
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
      {['reconnecting', 'offline', 'error'].includes(status) && <p role="alert" className="mb-3 rounded-lg bg-[#f8e7e7] p-3 text-sm text-[#8a1c1c]">Chưa đồng bộ được hội thoại. Đang thử kết nối lại…</p>}
      {error && <p role="alert" className="mb-3 text-sm text-[#8a1c1c]">{error}</p>}
      {data ? <ChatMessages key={data.conversationId} conversation={data} fetchOlder={(before) => chatApi(data.conversationId, undefined, before)} /> : <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
        <Sparkles className="h-9 w-9 text-[#6f1d32]" />
        <h3 className="moc-serif text-3xl text-[#211b18]">Một người bạn tại Mộc.</h3>
        <p className="text-sm leading-relaxed text-[#625a55]">Tìm món hợp khẩu vị, hỏi về đặt bàn hoặc trò chuyện với nhân viên.</p>
        <p className="text-xs leading-relaxed text-[#625a55]">Khi dùng trợ lý AI, nội dung chat được xử lý qua Google Gemini. Đừng gửi thông tin nhạy cảm. AI có thể trả lời sai; dữ liệu trên màn đặt hàng là thông tin xác nhận cuối cùng.</p>
        <button disabled={busy} onClick={() => action('open')} className="moc-inverse rounded-full bg-[#6f1d32] px-6 py-3 text-sm font-semibold text-white">{busy ? 'Đang mở…' : 'Bắt đầu trò chuyện'}</button>
      </div>}
    </div>
    {data?.status === 'CLOSED' ? <button disabled={busy} onClick={() => action('open')} className="m-4 rounded-xl border border-[#6f1d32] px-4 py-3 text-sm font-semibold text-[#6f1d32]">Mở cuộc trò chuyện mới</button> : data && <>
      <div className="flex items-center justify-between px-4 py-2 text-xs text-[#625a55]"><span>Đồng bộ mỗi 2,5 giây khi mở chat</span><button disabled={busy} onClick={() => action('close')} className="underline">Kết thúc</button></div>
      <ChatComposer key={data.conversationId} scope="customer" accountId={accountId} conversationId={data.conversationId} deliveredKeys={data.messages.map((message) => message.clientKey).filter(Boolean)} send={(payload) => sendChatApi(data.conversationId, payload)} onSent={update} />
    </>}
  </>
}

export default function SupportWidget() {
  const { user, isAuthenticated, role } = useAuth()
  const location = useLocation()
  const target = Number(new URLSearchParams(location.search).get('support')) || null
  const [open, setOpen] = useState(!!target)
  useEffect(() => {
    // Navigation from a support notification must reopen the existing widget.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (target) setOpen(true)
  }, [target])
  useEffect(() => {
    const escape = (event) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [])
  if (['STAFF', 'ADMIN'].includes(role) || location.pathname.startsWith('/dine/') || ['/login', '/register'].includes(location.pathname)) return null
  return <div className="fixed bottom-5 right-4 z-[70] sm:bottom-6 sm:right-6">
    {open && <section role="dialog" aria-labelledby="moc-chat-title" className="mb-3 flex h-[min(660px,calc(100dvh-110px))] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-[#cbbcb0] bg-[#f5f0e7] shadow-[0_20px_80px_#211b1830]">
      <header className="moc-inverse flex shrink-0 items-center gap-3 bg-[#6f1d32] px-5 py-4 text-white"><div className="grid h-10 w-10 place-items-center rounded-full border border-white/30"><MessageCircle className="h-5 w-5" /></div><div className="flex-1"><h2 id="moc-chat-title" className="moc-serif text-2xl">Mộc đồng hành</h2><p className="text-xs">Một chút quan tâm, trọn vẹn bữa ăn.</p></div><button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center" aria-label="Đóng chat"><X className="h-5 w-5" /></button></header>
      {isAuthenticated && role === 'CUSTOMER' ? <CustomerChat key={`${user.accountId}-${target}`} accountId={user.accountId} initialId={target} /> : <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center"><UserRound className="h-10 w-10 text-[#6f1d32]" /><h3 className="moc-serif text-3xl">Mộc sẵn lòng lắng nghe.</h3><p className="text-sm leading-relaxed text-[#625a55]">Đăng nhập để giữ lịch sử trò chuyện riêng tư và nhận hỗ trợ về đơn hàng của bạn.</p><Link to="/login" onClick={() => setOpen(false)} className="moc-inverse rounded-full bg-[#6f1d32] px-6 py-3 text-sm font-semibold text-white">Đăng nhập để trò chuyện</Link></div>}
    </section>}
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Thu gọn hỗ trợ Mộc' : 'Mở hỗ trợ Mộc'} className="moc-inverse ml-auto flex h-14 items-center gap-3 rounded-full bg-[#6f1d32] px-5 text-white shadow-lg"><MessageCircle className="h-5 w-5" /><span className="text-sm font-semibold">Hỏi Mộc</span></button>
  </div>
}
