import { Bell, CheckCheck, ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import MocSiteHeader from '../../components/navigation/MocSiteHeader'
import MocFooter from '../../components/navigation/MocFooter'
import Modal from '../../components/ui/Modal'
import useLivePolling from '../../lib/useLivePolling'
import { apiErrorMessage } from '../../lib/apiError'
import { feedbackApi, noticesApi, readAllNoticesApi, readNoticeApi } from './services'
import { useAuth } from '../../contexts/AuthContext'

function FeedbackForm({ item, onSaved }) {
  const [rating, setRating] = useState(item.feedback?.rating || 5)
  const [comment, setComment] = useState(item.feedback?.comment || '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    try { await feedbackApi(item.noticeId, { rating, comment }); setMessage('Mộc đã nhận đánh giá. Cảm ơn bạn!'); onSaved() }
    catch (error) { setMessage(apiErrorMessage(error)) }
    finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl border border-[#d8cbc0] bg-white p-4"><label className="flex items-center gap-3 text-sm font-semibold">Bữa ăn của bạn <select aria-label="Điểm đánh giá" value={rating} onChange={(event) => setRating(Number(event.target.value))} className="rounded-lg border border-[#cbbcb0] px-3 py-2">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}/5 điểm</option>)}</select></label><textarea aria-label="Góp ý cho Mộc" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} rows={2} placeholder="Điều gì khiến bạn hài lòng? Mộc cần chăm chút thêm điều gì?" className="w-full resize-none rounded-lg border border-[#cbbcb0] p-3 text-sm" /><button disabled={busy} className="moc-inverse rounded-full bg-[#6f1d32] px-4 py-2.5 text-sm font-semibold text-white">{busy ? 'Đang gửi…' : item.feedback ? 'Cập nhật đánh giá' : 'Gửi cảm nhận'}</button>{message && <p role="status" className="text-sm text-[#6f1d32]">{message}</p>}</form>
}

/** Hiển thị đúng các dòng backend đã tính (cùng công thức với email); tình trạng hoàn tiền hiện tại tách riêng. */
function ReceiptDetail({ receipt }) {
  return <>
    <p className="mb-4 text-sm text-[#625a55]">Biên nhận của nhà hàng tại thời điểm thu tiền{receipt.paidAt ? ` (${new Date(receipt.paidAt).toLocaleString('vi-VN')})` : ''}, không phải hóa đơn thuế.</p>
    <div className="divide-y divide-[#d8cbc0]">{receipt.rows.map((row, index) => <div key={index} className={`flex justify-between gap-4 py-3 text-sm ${['total', 'paid'].includes(row.kind) ? 'font-bold text-[#211b18]' : row.kind === 'line' ? '' : 'text-[#625a55]'}`}><span className="min-w-0 break-words">{row.label}</span><span className="shrink-0">{row.amount.toLocaleString('vi-VN')} đ</span></div>)}</div>
    {receipt.updateText && <p role="note" className="mt-4 rounded-xl bg-[#f8e7e7] p-4 text-sm leading-relaxed text-[#5c1424]">{receipt.updateText}</p>}
  </>
}

export default function NotificationsPage() {
  const { user } = useAuth()
  // Remount all private state, including open receipts/forms, when another tab changes account.
  return <AccountNotifications key={user?.accountId ?? 'guest'} />
}

function AccountNotifications() {
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(null)
  const { data, dataKey, refresh, status } = useLivePolling(async ({ signal }) => (await noticesApi({ page }, signal)).data, { interval: 10000, hiddenInterval: 0, resetKey: String(page) })
  const loadingPage = !!data && dataKey !== String(page)
  const read = async (id) => {
    try { await (id ? readNoticeApi(id) : readAllNoticesApi()); refresh() }
    catch (requestError) { setError(apiErrorMessage(requestError)) }
  }
  return <div className="moc-page-shell"><MocSiteHeader /><main className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
    <p className="moc-eyebrow">Mộc luôn đồng hành</p><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><h1 className="moc-serif text-4xl sm:text-5xl">Thông báo của bạn</h1><button onClick={() => read()} className="flex items-center gap-2 rounded-full border border-[#6f1d32] px-4 py-2.5 text-sm font-semibold text-[#6f1d32]"><CheckCheck className="h-4 w-4" /> Đọc tất cả</button></div>
    <p className="mt-4 text-base leading-relaxed text-[#625a55]">Đặt bàn, đơn hàng và những phản hồi từ Mộc. Khi bạn không mở website, email sẽ là kênh thông báo bên ngoài ứng dụng.</p>
    {(error || status === 'error' || status === 'offline') && <p role="alert" className="mt-5 rounded-xl bg-[#f8e7e7] p-4 text-sm text-[#8a1c1c]">{error || 'Chưa tải được thông báo. Vui lòng thử lại.'}</p>}
    {loadingPage && <p role="status" className="mt-6 text-sm text-[#625a55]">Đang tải trang {page}…</p>}
    <div aria-busy={loadingPage} className={`mt-8 space-y-3 ${loadingPage ? 'pointer-events-none opacity-50' : ''}`}>{data?.items?.map((item) => <article key={item.noticeId} className={`rounded-2xl border p-5 sm:p-6 ${item.readAt ? 'border-[#d8cbc0] bg-[#fffdf8]' : 'border-[#6f1d32]/40 bg-[#fffaf3] shadow-sm'}`}>
      <div className="flex gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#6f1d32]/8 text-[#6f1d32]">{item.kind === 'PAYMENT_RECEIPT' ? <ReceiptText className="h-5 w-5" /> : <Bell className="h-5 w-5" />}</div><div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold text-[#211b18]">{item.title}</h2>{!item.readAt && <span className="rounded-full bg-[#6f1d32]/8 px-2 py-1 text-xs font-bold text-[#6f1d32]">Mới</span>}</div>
        <p className="mt-2 text-[15px] leading-relaxed text-[#625a55]">{item.body}</p><p className="mt-3 text-xs text-[#625a55]">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-[#6f1d32]"><Link to={item.path} onClick={() => read(item.noticeId)}>Xem chi tiết →</Link>{item.receipt && <button onClick={() => { setReceipt(item.receipt); read(item.noticeId) }}>Xem biên nhận</button>}{!item.readAt && <button onClick={() => read(item.noticeId)}>Đánh dấu đã đọc</button>}</div>
        {item.kind === 'FEEDBACK_REQUEST' && <FeedbackForm key={item.noticeId} item={item} onSaved={refresh} />}
      </div></div>
    </article>)}</div>
    {!data && <p role="status" className="mt-10 text-[#625a55]">Đang tải thông báo…</p>}
    {data?.items?.length === 0 && <div className="moc-panel mt-8 rounded-2xl p-12 text-center"><Bell className="mx-auto h-9 w-9 text-[#6f1d32]" /><p className="moc-serif mt-4 text-2xl">Chưa có thông báo mới.</p><p className="mt-2 text-sm text-[#625a55]">Những cập nhật về bữa ăn của bạn sẽ xuất hiện tại đây.</p></div>}
    <div className="mt-6 flex justify-between"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="p-3 text-sm disabled:opacity-40">← Trang trước</button><button disabled={!data || loadingPage || page >= data.pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="p-3 text-sm disabled:opacity-40">Trang sau →</button></div>
  </main><MocFooter /><Modal isOpen={!!receipt} onClose={() => setReceipt(null)} title="Biên nhận thanh toán · Mộc Dining">{receipt && <ReceiptDetail receipt={receipt} />}</Modal></div>
}
