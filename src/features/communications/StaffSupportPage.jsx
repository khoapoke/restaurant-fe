import { MessageCircle, RefreshCw, UserRound } from 'lucide-react'
import { useState } from 'react'
import PosHeader from '../staff/pos/components/PosHeader'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import useLivePolling from '../../lib/useLivePolling'
import { useAuth } from '../../contexts/AuthContext'
import { apiErrorMessage } from '../../lib/apiError'
import ChatMessages from './ChatMessages'
import ChatComposer from './ChatComposer'
import { staffChatActionApi, staffChatApi, staffSendChatApi, supportAssigneesApi, supportQueueApi } from './services'

const labels = { AI: 'AI đang hỗ trợ', WAITING: 'Chờ tiếp nhận', HUMAN: 'Nhân viên hỗ trợ', CLOSED: 'Đã kết thúc' }
const REASON = { label: 'Lý do (ghi nhật ký)', minLength: 5, placeholder: 'Ví dụ: hết ca, cần bộ phận khác hỗ trợ, khách cần quản lý' }

function ConversationPanel({ id, onUpdate }) {
  const { user } = useAuth()
  const admin = user.role === 'ADMIN'
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [dialog, setDialog] = useState(null)
  const [assignees, setAssignees] = useState([])
  const [assignee, setAssignee] = useState('')
  const { data, setData, refresh, status } = useLivePolling(async ({ signal }) => (await staffChatApi(id, signal)).data.conversation, { interval: 2500, hiddenInterval: 0 })
  const apply = (conversation) => { setData(conversation); refresh(); onUpdate() }
  const run = async (name, payload) => apply((await staffChatActionApi(id, name, payload)).data.conversation)
  const claim = async () => {
    setBusy(true)
    setError('')
    try { await run('claim') }
    catch (requestError) { setError(apiErrorMessage(requestError)) }
    finally { setBusy(false) }
  }
  const openReassign = async () => {
    setError('')
    try {
      setAssignees((await supportAssigneesApi()).data.items)
      setAssignee('')
      setDialog('reassign')
    } catch (requestError) { setError(apiErrorMessage(requestError)) }
  }
  const owner = data?.isMine || admin
  const heldByOther = data?.status === 'HUMAN' && !data.isMine
  const dialogs = {
    close: { title: 'Kết thúc cuộc trò chuyện?', description: 'Khách sẽ thấy hội thoại đã kết thúc và cần mở cuộc mới nếu muốn hỏi tiếp. Lịch sử vẫn được giữ.', confirmLabel: 'Kết thúc', tone: 'danger', onConfirm: () => run('close') },
    release: { title: 'Trả hội thoại về hàng chờ?', description: 'Bạn sẽ không còn phụ trách; nhân viên khác có thể tiếp nhận. AI không tự trả lời lại. Khách được báo và lịch sử được giữ nguyên.', confirmLabel: 'Trả về hàng chờ', reason: REASON, onConfirm: (reason) => run('release', { reason }) },
    takeover: { title: 'Tiếp quản hội thoại?', description: `Bạn sẽ trở thành người phụ trách thay ${data?.assignedName || 'nhân viên hiện tại'}. Người phụ trách cũ không trả lời được nữa.`, confirmLabel: 'Tiếp quản', reason: REASON, onConfirm: (reason) => run('takeover', { reason }) },
    reassign: {
      title: 'Chuyển người phụ trách', description: 'Chọn nhân viên đang hoạt động sẽ tiếp tục hỗ trợ khách. Người nhận thấy toàn bộ lịch sử trò chuyện.', confirmLabel: 'Chuyển hội thoại', reason: REASON,
      details: <label className="grid gap-1.5 text-sm font-semibold text-[#211b18]">Người nhận<select aria-label="Người nhận hội thoại" value={assignee} onChange={(event) => setAssignee(event.target.value)} className="rounded-lg border border-[#cbbcb0] bg-white px-3 py-2.5 text-sm font-normal"><option value="">Chọn nhân viên</option>{assignees.filter((item) => item.accountId !== data?.assignedTo).map((item) => <option key={item.accountId} value={item.accountId}>{item.name} · {item.role === 'ADMIN' ? 'Quản lý' : 'Nhân viên'}</option>)}</select></label>,
      onConfirm: (reason) => {
        if (!assignee) throw { response: { data: { message: 'Vui lòng chọn người nhận hội thoại.' } } }
        return run('reassign', { reason, assigneeId: Number(assignee) })
      },
    },
  }
  return <section className="moc-panel flex h-[calc(100dvh-215px)] min-h-[480px] flex-col overflow-hidden rounded-2xl">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8cbc0] px-5 py-4"><div className="min-w-0"><h2 className="font-semibold">{data?.customerName || 'Đang tải…'}</h2><p className="mt-1 text-sm text-[#625a55]">{labels[data?.status]}{data?.assignedName ? ` · ${data.assignedName}` : ''}</p></div><div className="flex flex-wrap gap-2">
      {data && ['WAITING', 'AI'].includes(data.status) && <button disabled={busy} onClick={claim} className="moc-inverse rounded-full bg-[#6f1d32] px-4 py-2 text-sm font-semibold text-white">Tiếp nhận</button>}
      {data && admin && heldByOther && <button disabled={busy} onClick={() => setDialog('takeover')} className="rounded-full border border-[#6f1d32] px-4 py-2 text-sm font-semibold text-[#6f1d32]">Tiếp quản</button>}
      {data && data.status === 'HUMAN' && owner && <button disabled={busy} onClick={() => setDialog('release')} className="rounded-full border border-[#cbbcb0] px-4 py-2 text-sm">Trả về hàng chờ</button>}
      {data && admin && ['WAITING', 'HUMAN'].includes(data.status) && <button disabled={busy} onClick={openReassign} className="rounded-full border border-[#cbbcb0] px-4 py-2 text-sm">Chuyển người phụ trách</button>}
      {data && data.status !== 'CLOSED' && owner && <button disabled={busy} onClick={() => setDialog('close')} className="rounded-full border border-[#cbbcb0] px-4 py-2 text-sm">Kết thúc</button>}
    </div></div>
    {(error || ['error', 'offline'].includes(status)) && <p role="alert" className="px-5 py-3 text-sm text-[#8a1c1c]">{error || 'Chưa đồng bộ được hội thoại.'}</p>}
    <div className="min-h-0 flex-1 overflow-y-auto p-5">{data && <ChatMessages key={id} conversation={data} staff fetchOlder={(before) => staffChatApi(id, undefined, before)} />}</div>
    {data && <ChatComposer key={id} scope="staff" accountId={user.accountId} conversationId={id} deliveredKeys={data.messages.map((message) => message.clientKey).filter(Boolean)} disabled={data.status !== 'HUMAN' || !data.isMine} send={(payload) => staffSendChatApi(id, payload)} onSent={apply} />}
    {dialog && <ConfirmDialog key={dialog} isOpen {...dialogs[dialog]} onClose={() => setDialog(null)} />}
  </section>
}

export default function StaffSupportPage() {
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const queryKey = `${filter}|${page}`
  const { data, dataKey, refresh, status, lastSyncedAt } = useLivePolling(async ({ signal }) => (await supportQueueApi({ status: filter || undefined, page }, signal)).data, { interval: 3000, hiddenInterval: 0, resetKey: queryKey })
  const loadingQuery = dataKey !== queryKey
  return <div className="moc-page-shell min-h-screen"><PosHeader title="Mộc lắng nghe" subtitle="Hộp thư hỗ trợ · đồng bộ mỗi 3 giây" syncedAt={lastSyncedAt} onRefresh={refresh} connection={status} /><main className="mx-auto max-w-[1500px] p-5 lg:p-8">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="moc-eyebrow">Chăm sóc khách hàng</p><h1 className="moc-serif mt-3 text-4xl">Một lời đáp, một sự quan tâm.</h1></div><span className="rounded-full bg-[#6f1d32]/8 px-4 py-2 text-sm font-semibold text-[#6f1d32]">{data?.waitingCount || 0} cuộc đang chờ</span></div>
    {['offline', 'error'].includes(status) && <p role="alert" className="mb-4 text-sm text-[#8a1c1c]">Chưa tải được hộp thư. Đang thử lại…</p>}
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]"><aside className="moc-panel self-start overflow-hidden rounded-2xl"><div className="border-b border-[#d8cbc0] p-4"><label htmlFor="support-filter" className="text-sm font-semibold">Hội thoại</label><select id="support-filter" value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1) }} className="mt-2 w-full rounded-xl border border-[#cbbcb0] bg-white px-3 py-2.5 text-sm">{[['', 'Cần nhân viên hỗ trợ'], ['WAITING', 'Chờ tiếp nhận'], ['HUMAN', 'Đang hỗ trợ'], ['AI', 'AI đang hỗ trợ'], ['CLOSED', 'Đã kết thúc']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      {loadingQuery && <p role="status" className="px-4 pt-3 text-xs text-[#625a55]">Đang tải danh sách…</p>}
      <div aria-busy={loadingQuery} className={`max-h-[58dvh] overflow-y-auto ${loadingQuery ? 'opacity-50' : ''}`}>{data?.items?.map((item) => <button key={item.conversationId} disabled={loadingQuery} onClick={() => setSelected(item.conversationId)} className={`flex w-full gap-3 border-b border-[#d8cbc0] px-4 py-4 text-left ${selected === item.conversationId ? 'bg-[#6f1d32]/8' : 'hover:bg-[#eee6dc]'}`}><UserRound className="mt-1 h-5 w-5 shrink-0 text-[#6f1d32]" /><div className="min-w-0 flex-1"><p className="font-semibold">{item.customerName}</p><p className="mt-1 text-xs text-[#625a55]">{labels[item.status]}{item.assignedName ? ` · ${item.assignedName}` : ''}</p><p className="mt-2 text-xs text-[#625a55]">{new Date(item.lastMessageAt).toLocaleString('vi-VN')}</p></div>{item.unreadCount > 0 && <span className="moc-inverse h-fit rounded-full bg-[#6f1d32] px-2 py-1 text-xs text-white">{item.unreadCount}</span>}</button>)}</div>
      {!loadingQuery && data?.items?.length === 0 && <p className="p-6 text-sm text-[#625a55]">Chưa có hội thoại trong nhóm này.</p>}
      <div className="flex items-center justify-between p-3 text-sm"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="p-2 disabled:opacity-40" aria-label="Trang trước">←</button><span>Trang {page}</span><button disabled={!data || loadingQuery || page >= data.pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="p-2 disabled:opacity-40" aria-label="Trang sau">→</button></div>
    </aside>
    {selected ? <ConversationPanel key={selected} id={selected} onUpdate={refresh} /> : <section className="moc-panel flex min-h-[480px] flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center"><MessageCircle className="h-12 w-12 text-[#6f1d32]" /><h2 className="moc-serif text-3xl">Chọn một cuộc trò chuyện.</h2><p className="max-w-md text-sm leading-relaxed text-[#625a55]">Đọc lịch sử rồi bấm Tiếp nhận để trả lời. Khi bạn tiếp nhận, AI sẽ ngừng phản hồi; mỗi cuộc chỉ có một nhân viên phụ trách. Có thể trả hội thoại về hàng chờ kèm lý do khi cần người khác hỗ trợ.</p><button onClick={refresh} className="flex items-center gap-2 text-sm text-[#6f1d32]"><RefreshCw className="h-4 w-4" /> Làm mới hộp thư</button></section>}
    </div>
  </main></div>
}
