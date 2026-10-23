import { ChefHat, MessageSquareText, Minus, Plus, ReceiptText, Trash2, Wrench } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import { formatMoney, KITCHEN_STATUS_META, KitchenStatus, LINE_TYPE_LABEL } from '../constants'

const WITHDRAWN = [KitchenStatus.CANCELLED, KitchenStatus.REJECTED]

export const PosOrderPanel = ({ order, onCreateOrder, onChangeQuantity, onRemove, onEditNote, onSendKitchen, onCorrect, correctionsEnabled = true, busyItemId, actionBusy, sessionLocked }) => {
  if (!order) {
    return (
      <section className="bg-[#fffdf8] border border-[var(--moc-line)] p-6 min-h-80 flex flex-col items-center justify-center text-center">
        <ReceiptText className="w-10 h-10 text-[#6f1d32]" />
        <h2 className="mt-4 moc-serif text-3xl">Chưa có order</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#766e68]">Tạo order đầu tiên để bắt đầu ghi món cho bàn.</p>
        <Button className="mt-6" onClick={onCreateOrder} isLoading={actionBusy} disabled={sessionLocked}>BẮT ĐẦU GỌI MÓN</Button>
      </section>
    )
  }

  // Món nháp đã xóa không còn ý nghĩa; món đã gửi bếp rồi bị hủy/từ chối vẫn hiện để giải thích hóa đơn.
  const visibleItems = order.items.filter((item) => !(item.kitchenStatus === KitchenStatus.CANCELLED && !item.voidReason))
  const activeItems = visibleItems.filter((item) => !WITHDRAWN.includes(item.kitchenStatus))
  const draftItems = activeItems.filter((item) => item.kitchenStatus === KitchenStatus.DRAFT)

  return (
    <section className="bg-[#fffdf8] border border-[var(--moc-line)]">
      <div className="p-5 border-b border-[var(--moc-line)] flex items-end justify-between gap-4">
        <div><span className="moc-eyebrow">ORDER #{order.orderId}</span><h2 className="mt-2 moc-serif text-3xl">Món đã chọn</h2></div>
        <span className="text-sm font-semibold">{activeItems.reduce((total, item) => total + item.quantity, 0)} phần</span>
      </div>

      {visibleItems.length === 0 ? (
        <div className="min-h-48 grid place-items-center text-center p-6"><p className="text-sm text-[#766e68]">Chọn món từ thực đơn để thêm vào order.</p></div>
      ) : (
        <div className="divide-y divide-[var(--moc-line)]">
          {visibleItems.map((item) => {
            const withdrawn = WITHDRAWN.includes(item.kitchenStatus)
            const editable = item.kitchenStatus === KitchenStatus.DRAFT && !sessionLocked
            const correctable = correctionsEnabled && item.kitchenStatus !== KitchenStatus.DRAFT
            const meta = KITCHEN_STATUS_META[item.kitchenStatus] || KITCHEN_STATUS_META.DRAFT
            return (
              <article key={item.itemId} className={`p-4 ${withdrawn ? 'bg-[#f8f3ea]/70' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className={`text-base font-semibold leading-6 ${withdrawn ? 'text-[#625a55] line-through decoration-1' : ''}`}>{item.dishName}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold ${meta.tone}`}>{meta.label}</span>
                      {item.source === 'TABLE_QR' && <span className="inline-flex px-2 py-1 text-xs font-bold bg-[#e6eef6] text-[#1f4f7a]">QR khách gọi</span>}
                      {LINE_TYPE_LABEL[item.lineType] && <span className="inline-flex px-2 py-1 text-xs font-bold bg-[#f3e6c8] text-[#6b4a12]">{LINE_TYPE_LABEL[item.lineType]}</span>}
                      {item.waived && <span className="inline-flex px-2 py-1 text-xs font-bold bg-emerald-50 text-emerald-800">Đã miễn tiền</span>}
                    </div>
                    {item.voidReasonLabel && (
                      <p className="mt-2 text-sm text-[#8a1c1c]">{item.voidReasonLabel}{item.voidNote ? ` · ${item.voidNote}` : ''}</p>
                    )}
                    {item.note && <p className="mt-2 flex items-start gap-1.5 text-sm text-[#6f1d32]"><MessageSquareText className="mt-0.5 h-4 w-4 shrink-0" />{item.note}</p>}
                    {item.billedQuantity !== item.quantity && (
                      <p className="mt-1 text-xs text-[#625a55]">Tính tiền {item.billedQuantity}/{item.quantity} phần</p>
                    )}
                  </div>
                  <strong className={`shrink-0 text-sm ${withdrawn && item.subTotal === 0 ? 'text-[#625a55]' : 'text-[#6f1d32]'}`}>{formatMoney(item.subTotal)}</strong>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  {editable ? (
                    <div className="flex items-center border border-[var(--moc-line)]">
                      <button type="button" disabled={item.quantity <= 1 || busyItemId === item.itemId} onClick={() => onChangeQuantity(item, item.quantity - 1)} className="w-10 h-10 grid place-items-center disabled:opacity-30" aria-label="Giảm số lượng"><Minus className="w-4 h-4" /></button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button type="button" disabled={busyItemId === item.itemId} onClick={() => onChangeQuantity(item, item.quantity + 1)} className="w-10 h-10 grid place-items-center disabled:opacity-30" aria-label="Tăng số lượng"><Plus className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-[#625a55]">× {item.quantity}</span>
                  )}
                  <div className="flex items-center gap-1">
                    {editable && <button type="button" disabled={busyItemId === item.itemId} onClick={() => onEditNote(item)} className="min-h-10 px-3 inline-flex items-center gap-1.5 text-sm text-[#211b18] hover:bg-[#6f1d32]/7 disabled:opacity-30"><MessageSquareText className="w-4 h-4" />Ghi chú</button>}
                    {editable && <button type="button" disabled={busyItemId === item.itemId} onClick={() => onRemove(item)} className="w-10 h-10 grid place-items-center text-red-600 hover:bg-red-50 disabled:opacity-30" aria-label="Xóa món nháp"><Trash2 className="w-4 h-4" /></button>}
                    {correctable && <button type="button" onClick={() => onCorrect(item)} className="min-h-10 px-3 inline-flex items-center gap-1.5 border border-[var(--moc-line)] text-sm font-semibold text-[#211b18] hover:border-[#6f1d32]/40"><Wrench className="w-4 h-4" />Xử lý</button>}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="p-5 border-t border-[var(--moc-line)] bg-[#f8f3ea]">
        <div className="flex items-center justify-between text-lg"><span className="font-semibold">Tạm tính</span><strong className="moc-serif text-2xl text-[#6f1d32]">{formatMoney(order.totalAmount)}</strong></div>
        <Button className="mt-4 w-full" icon={ChefHat} onClick={() => onSendKitchen(draftItems.map((item) => item.itemId))} isLoading={actionBusy} disabled={!draftItems.length || sessionLocked}>
          GỬI {draftItems.length || ''} MÓN XUỐNG BẾP
        </Button>
      </div>
    </section>
  )
}

export default PosOrderPanel
