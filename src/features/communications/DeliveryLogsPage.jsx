import { useState } from 'react'
import useLivePolling from '../../lib/useLivePolling'
import { deliveriesApi, retryDeliveryApi } from './services'
import Modal from '../../components/ui/Modal'
import { apiErrorMessage } from '../../lib/apiError'

const ERROR_LABELS = {
  EMAIL_EXPIRED: 'Quá hạn gửi tự động', NO_LONGER_APPLICABLE: 'Thông báo đã bị thay thế', RECIPIENT_CHANGED: 'Khách đã đổi email',
  SMTP_TEMPORARY_FAILURE: 'Máy chủ mail tạm từ chối', SMTP_FAILURE_REVIEW_REQUIRED: 'Máy chủ mail từ chối',
  SEND_OUTCOME_UNKNOWN_REVIEW_REQUIRED: 'Chưa rõ kết quả gửi', SEND_ERROR_REVIEW_REQUIRED: 'Lỗi trước khi gửi', REAL_MAILER_REQUIRED: 'Chưa cấu hình bộ gửi thật',
}
const labels = { PENDING: 'Chờ gửi', RETRY: 'Chờ thử lại', SENDING: 'Đang gửi', ACCEPTED: 'Máy chủ đã nhận', SKIPPED: 'Đã bỏ qua', FAILED: 'Cần kiểm tra', SIMULATED: 'Giả lập, chưa gửi thật' }
export default function DeliveryLogsPage() {
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [retry, setRetry] = useState(null)
  const [reason, setReason] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const queryKey = `${filter}|${page}`
  const { data, dataKey, status, refresh } = useLivePolling(async ({ signal }) => (await deliveriesApi({ status: filter || undefined, page }, signal)).data, { interval: 10000, hiddenInterval: 0, resetKey: queryKey })
  const loadingQuery = !!data && dataKey !== queryKey
  const submitRetry = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try { await retryDeliveryApi(retry.deliveryId, { reason, acknowledgeDuplicateRisk: acknowledged }); setRetry(null); refresh() }
    catch (requestError) { setError(apiErrorMessage(requestError)) }
    finally { setBusy(false) }
  }
  return <><p className="moc-eyebrow">Vận hành thông báo</p><h1 className="moc-serif mt-4 text-4xl">Nhật ký gửi email</h1><p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#625a55]">“Máy chủ đã nhận” không đồng nghĩa khách đã đọc hoặc email chắc chắn vào Hộp thư đến. Lỗi không xác định cần kiểm tra trước khi gửi lại để tránh trùng thư.</p>
    <p className="mt-5 rounded-xl border border-[#d8cbc0] bg-[#fffdf8] p-4 text-sm">Gửi email: <strong>{data?.emailEnabled ? 'Đã bật' : 'Chưa bật'}</strong> · Bộ gửi: {data?.mailDriver || '…'} · Hàng đợi: communications</p>
    {data?.testMode && <p className="mt-3 rounded-xl bg-[#6f1d32]/8 p-4 text-sm text-[#6f1d32]">Chế độ demo an toàn: mọi email được chuyển tới hộp thư kiểm thử đã cấu hình, không gửi tới địa chỉ khách trong dữ liệu mẫu.</p>}
    <select aria-label="Lọc trạng thái email" value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1) }} className="my-6 rounded-xl border border-[#cbbcb0] bg-white px-4 py-3 text-sm"><option value="">Tất cả trạng thái</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    {['error', 'offline'].includes(status) && <p role="alert" className="mb-4 text-sm text-[#8a1c1c]">Chưa tải được nhật ký.</p>}
    {loadingQuery && <p role="status" className="mb-3 text-sm text-[#625a55]">Đang tải nhật ký…</p>}
    <div aria-busy={loadingQuery} className={`overflow-x-auto rounded-xl border border-[#d8cbc0] bg-[#fffdf8] ${loadingQuery ? 'pointer-events-none opacity-50' : ''}`}><table className="w-full text-left text-sm"><thead className="bg-[#eee6dc]"><tr>{['Nội dung', 'Trạng thái', 'Lần thử', 'Thời điểm', 'Mã lỗi'].map((label) => <th key={label} className="p-4 font-semibold">{label}</th>)}</tr></thead><tbody>{data?.items?.map((item) => <tr key={item.deliveryId} className="border-t border-[#d8cbc0]"><td className="p-4">{item.title}</td><td className="whitespace-nowrap p-4">{labels[item.status]}</td><td className="p-4">{item.attempts}</td><td className="whitespace-nowrap p-4">{new Date(item.createdAt).toLocaleString('vi-VN')}{item.expiresAt && <span className="block text-xs text-[#625a55]">Hạn gửi: {new Date(item.expiresAt).toLocaleString('vi-VN')}</span>}</td><td className="p-4 text-xs text-[#8a1c1c]">{item.errorCode ? <><span className="block text-sm">{ERROR_LABELS[item.errorCode] || item.errorCode}</span><span className="text-[#625a55]">{item.errorCode}</span></> : '—'}{item.status === 'FAILED' && <button onClick={() => { setRetry(item); setReason(''); setAcknowledged(false); setError('') }} className="mt-2 block rounded-full border border-[#6f1d32] px-3 py-2 text-sm font-semibold text-[#6f1d32]">Kiểm tra & gửi lại</button>}</td></tr>)}</tbody></table>{data?.items?.length === 0 && <p className="p-6 text-sm text-[#625a55]">Chưa có lượt gửi.</p>}</div>
    <div className="mt-4 flex justify-between text-sm"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="p-3 disabled:opacity-40">← Trang trước</button><button disabled={!data || loadingQuery || page >= data.pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="p-3 disabled:opacity-40">Trang sau →</button></div>
    <h2 className="moc-serif mt-10 text-2xl">Cảm nhận gần đây</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{data?.feedback?.map((item, index) => <article key={index} className="rounded-xl border border-[#d8cbc0] bg-[#fffdf8] p-4"><p className="font-semibold text-[#6f1d32]">{item.rating}/5 điểm</p><p className="mt-2 text-sm leading-relaxed">{item.comment || 'Khách không để lại lời nhắn.'}</p><p className="mt-2 text-xs text-[#625a55]">{new Date(item.created_at).toLocaleString('vi-VN')}</p></article>)}</div>
    <Modal isOpen={!!retry} onClose={() => !busy && setRetry(null)} title="Kiểm tra trước khi gửi lại email"><form onSubmit={submitRetry} className="space-y-4"><p className="text-sm leading-relaxed text-[#625a55]">Nếu lần trước mất phản hồi sau khi máy chủ đã nhận thư, gửi lại có thể tạo email trùng. Kiểm tra hộp thư và kết quả SMTP trước khi tiếp tục.</p><label className="block text-sm font-semibold">Lý do gửi lại<textarea required minLength={10} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-lg border border-[#cbbcb0] p-3 text-sm" /></label><label className="flex items-start gap-2 text-sm leading-relaxed"><input required type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-1" />Tôi đã kiểm tra và hiểu nguy cơ gửi trùng. Thao tác này được ghi nhật ký.</label>{error && <p role="alert" className="text-sm text-[#8a1c1c]">{error}</p>}<button disabled={busy || !acknowledged || reason.trim().length < 10} className="moc-inverse rounded-full bg-[#6f1d32] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Đang xử lý…' : 'Đưa vào hàng chờ gửi lại'}</button></form></Modal>
  </>
}
