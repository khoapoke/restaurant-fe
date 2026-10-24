import { Plus, Sparkles, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '../../contexts/CartContext'
import { apiErrorMessage } from '../../lib/apiError'
import { ALLERGEN_LABEL } from '../dine/constants'

export default function ChatMessages({ conversation, staff = false, fetchOlder }) {
  const bottom = useRef(null)
  const { addToCart } = useCart()
  const [notice, setNotice] = useState('')
  const [adding, setAdding] = useState(false)
  const [older, setOlder] = useState([])
  const [more, setMore] = useState(null)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const messages = [...new Map([...older, ...(conversation?.messages || [])].map((message) => [message.messageId, message])).values()].sort((a, b) => a.messageId - b.messageId)
  const loadOlder = async () => {
    setLoadingOlder(true)
    try {
      const response = await fetchOlder(messages[0].messageId)
      setOlder((previous) => [...response.data.conversation.messages, ...previous])
      setMore(response.data.conversation.hasOlder)
    } catch (error) { setNotice(apiErrorMessage(error)) }
    finally { setLoadingOlder(false) }
  }
  const lastId = conversation?.messages?.at(-1)?.messageId
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [lastId])

  const add = async (dish) => {
    setAdding(true)
    try { await addToCart({ dishId: dish.dishId, quantity: 1 }); setNotice(`Đã thêm ${dish.dishName} vào giỏ.`) }
    catch (error) { setNotice(apiErrorMessage(error)) }
    finally { setAdding(false) }
  }

  return <div className="space-y-4">
    {fetchOlder && (more ?? conversation?.hasOlder) && <button disabled={loadingOlder} onClick={loadOlder} className="w-full rounded-full border border-[#cbbcb0] px-4 py-2 text-sm text-[#6f1d32]">{loadingOlder ? 'Đang tải…' : 'Xem tin nhắn trước'}</button>}
    {messages.map((message) => {
      const mine = staff ? message.sender === 'STAFF' : message.sender === 'CUSTOMER'
      if (message.sender === 'SYSTEM') return <p key={message.messageId} className="rounded-xl bg-[#eee6dc] px-4 py-3 text-center text-sm leading-relaxed text-[#625a55]">{message.body}</p>
      return <div key={message.messageId} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
        <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[#625a55]">
          {message.sender === 'AI' ? <Sparkles className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
          {message.sender === 'AI' ? 'Mộc AI' : message.sender === 'STAFF' ? 'Nhân viên Mộc' : 'Khách hàng'}
          <span className="font-normal">· {new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
        </span>
        <p className={`max-w-[92%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${mine ? 'moc-inverse rounded-br-sm bg-[#6f1d32] text-white' : 'rounded-bl-sm border border-[#d8cbc0] bg-white text-[#211b18]'}`}>{message.body}</p>
        {!!message.dishes?.length && <div className="mt-2 grid w-full gap-2">{message.dishes.map((dish) => <div key={dish.dishId} className="flex items-center gap-3 rounded-xl border border-[#d8cbc0] bg-white p-3">
          {dish.imageUrl && <img src={dish.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" loading="lazy" />}
          <div className="min-w-0 flex-1"><p className="font-semibold text-[#211b18]">{dish.dishName}</p><p className="mt-1 text-sm font-bold text-[#6f1d32]">{dish.price.toLocaleString('vi-VN')} đ</p>{!!dish.allergens?.length && <p className="text-xs text-[#625a55]">Có chứa: {dish.allergens.map((allergen) => ALLERGEN_LABEL[allergen] || allergen).join(', ')}</p>}</div>
          {!staff && <button type="button" disabled={adding} onClick={() => add(dish)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#6f1d32] text-[#6f1d32] disabled:opacity-50" aria-label={`Thêm ${dish.dishName} vào giỏ`}><Plus className="h-4 w-4" /></button>}
        </div>)}</div>}
      </div>
    })}
    {notice && <p role="status" className="text-sm text-[#6f1d32]">{notice}</p>}
    {conversation?.pendingAi && <p role="status" className="flex items-center gap-2 text-sm text-[#6f1d32]"><Sparkles className="h-4 w-4 animate-pulse" /> Mộc AI đang chuẩn bị câu trả lời…</p>}
    <div ref={bottom} />
  </div>
}
