import { Send, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiErrorMessage } from '../../lib/apiError'
import { readPending, removePending, savePending, storedAccountId } from './pendingMessages'

const SESSION_CHANGED = 'Phiên đăng nhập đã thay đổi ở tab khác. Vui lòng tải lại trang trước khi gửi.'

/**
 * Ô soạn tin có chống gửi trùng: khóa + nội dung lưu trước khi gửi, chỉ xóa khi biết chắc kết quả
 * (phản hồi nghiệp vụ hoặc tin đã có trong hội thoại). `deliveredKeys` là clientKey đã thấy trên server.
 */
export default function ChatComposer({ scope, accountId, conversationId, deliveredKeys = [], send, onSent, disabled = false }) {
  const [body, setBody] = useState('')
  const [stored, setStored] = useState(() => readPending(scope, accountId, conversationId))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const delivered = new Set(deliveredKeys)
  const pending = stored.filter((item) => !delivered.has(item.clientKey))
  const deliveredSignature = deliveredKeys.join('|')

  useEffect(() => {
    // Tin đã có trên server (phản hồi bị mất, gửi từ tab khác): bỏ khóa lưu tạm, không gửi lại.
    const keys = new Set(deliveredSignature.split('|'))
    stored.filter((item) => keys.has(item.clientKey)).forEach((item) => removePending(scope, accountId, conversationId, item.clientKey))
  }, [deliveredSignature, stored, scope, accountId, conversationId])

  const forget = (clientKey) => {
    removePending(scope, accountId, conversationId, clientKey)
    setStored((items) => items.filter((item) => item.clientKey !== clientKey))
  }

  const submit = async (event) => {
    event.preventDefault()
    const current = pending[0]
    if (busy || disabled || (!current && !body.trim())) return
    if (String(storedAccountId()) !== String(accountId)) {
      setError(SESSION_CHANGED)
      return
    }
    let payload = current
    if (!payload) {
      try {
        payload = savePending(scope, accountId, conversationId, { body: body.trim(), clientKey: crypto.randomUUID() })
      } catch {
        setError('Trình duyệt chưa lưu được khóa chống gửi trùng. Hãy cho phép lưu trữ trước khi gửi.')
        return
      }
      const saved = payload
      setStored((items) => [...items, saved])
      setBody('')
    }
    setBusy(true)
    setError('')
    try {
      const response = await send({ body: payload.body, clientKey: payload.clientKey })
      forget(payload.clientKey)
      onSent(response.data.conversation)
    } catch (requestError) {
      const status = requestError.response?.status
      if (status && status < 500 && status !== 429) {
        // Lỗi nghiệp vụ: tin chắc chắn chưa được nhận; trả nội dung về ô soạn để khách sửa.
        forget(payload.clientKey)
        setBody(payload.body)
      }
      setError(apiErrorMessage(requestError, 'Chưa xác định được kết quả gửi. Bấm thử lại để gửi bằng đúng mã cũ.'))
    } finally { setBusy(false) }
  }

  return <form onSubmit={submit} className="border-t border-[#d8cbc0] bg-[#fffdf8] p-4">
    {error && <p role="alert" className="mb-2 text-sm text-[#8a1c1c]">{error}</p>}
    {pending.map((item) => <p key={item.clientKey} className="mb-2 break-words text-xs text-[#625a55]">Tin đang chờ xác nhận: {item.body}</p>)}
    <div className="flex items-end gap-2">
      <textarea aria-label="Nội dung tin nhắn" value={body} onChange={(event) => setBody(event.target.value)} disabled={disabled || busy || pending.length > 0} maxLength={1500} rows={2} placeholder={disabled ? 'Hội thoại hiện chưa thể trả lời' : 'Bạn muốn Mộc hỗ trợ điều gì?'} className="min-h-12 min-w-0 flex-1 resize-none rounded-xl border border-[#cbbcb0] bg-white px-3 py-2.5 text-[15px] text-[#211b18] outline-none focus:border-[#6f1d32] disabled:bg-[#eee6dc]" />
      <button disabled={disabled || busy || (!pending.length && !body.trim())} type="submit" className="moc-inverse grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#6f1d32] text-white disabled:opacity-50" aria-label={pending.length ? 'Thử gửi lại tin nhắn' : 'Gửi tin nhắn'}>{pending.length ? <RotateCcw className={`h-5 w-5 ${busy ? 'animate-spin' : ''}`} /> : <Send className="h-5 w-5" />}</button>
    </div>
  </form>
}
