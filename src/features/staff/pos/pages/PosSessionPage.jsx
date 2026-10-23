import { AlertTriangle, ArrowLeft, CalendarClock, CircleSlash, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Alert from '../../../../components/ui/Alert'
import Button from '../../../../components/ui/Button'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import Skeleton from '../../../../components/ui/Skeleton'
import { apiErrorMessage } from '../../../../lib/apiError'
import { getCategoriesApi, getDishesApi } from '../../../customer/menu/services/menuService'
import { useAuth } from '../../../../contexts/AuthContext'
import BillingPanel from '../components/BillingPanel'
import DishPicker from '../components/DishPicker'
import InvoiceReceiptModal from '../components/InvoiceReceiptModal'
import ItemCorrectionModal from '../components/ItemCorrectionModal'
import PosHeader from '../components/PosHeader'
import PosOrderPanel from '../components/PosOrderPanel'
import SessionLivePanel from '../components/SessionLivePanel'
import SessionManagePanel from '../components/SessionManagePanel'
import usePendingPayment from '../hooks/usePendingPayment'
import {
  addPosOrderItemApi,
  cancelPosSessionApi,
  closePosSessionApi,
  createInvoiceApi,
  createPosOrderApi,
  deletePosOrderItemApi,
  getPosSessionApi,
  payInvoiceApi,
  reopenWithReasonApi,
  sendOrderToKitchenApi,
  updatePosOrderItemApi,
} from '../services/posService'

const createRequestId = (prefix) =>
  globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`

const formatTime = (value) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

const LOCKED_MESSAGE = {
  AWAITING_PAYMENT: 'Phiên đã lập hóa đơn nên thực đơn tạm khóa. Bấm “Gọi thêm món” nếu khách muốn gọi thêm.',
  CLOSED: 'Phiên đã đóng. Bàn đang chờ vệ sinh trên sơ đồ.',
  CANCELLED: 'Phiên đã hủy.',
}

const CLOSED_BY_WRITE_OFF = 'Phiên đã đóng với khoản thất thu do quản lý duyệt.'
const CLOSED_NO_CHARGE = 'Phiên đã kết thúc không phát sinh tiền (mọi món đã hủy hoặc bếp từ chối).'

export const PosSessionPage = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [dishes, setDishes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [addingDishId, setAddingDishId] = useState(null)
  const [busyItemId, setBusyItemId] = useState(null)
  const [dialog, setDialog] = useState(null)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [correcting, setCorrecting] = useState(null)
  const { user, role } = useAuth()
  const isAdmin = role === 'ADMIN'

  const loadSession = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true)
    try {
      const response = await getPosSessionApi(sessionId)
      setSession(response.data)
      setError(null)
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Không thể tải phiên phục vụ.'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [sessionId])

  useEffect(() => {
    let active = true
    Promise.all([getPosSessionApi(sessionId), getCategoriesApi(), getDishesApi({ perPage: 100 })])
      .then(([sessionResponse, categoryResponse, dishResponse]) => {
        if (!active) return
        setSession(sessionResponse.data)
        setCategories(categoryResponse.data || [])
        setDishes(dishResponse.data?.items || [])
      })
      .catch((requestError) => active && setError(apiErrorMessage(requestError, 'Không thể tải dữ liệu POS.')))
      .finally(() => active && setLoading(false))

    const timer = window.setInterval(() => {
      getPosSessionApi(sessionId).then((response) => active && setSession(response.data)).catch(() => {})
    }, 4000)
    return () => { active = false; window.clearInterval(timer) }
  }, [sessionId])

  const runAction = async (action, successMessage) => {
    setActionBusy(true)
    setError(null)
    setNotice(null)
    try {
      await action()
      await loadSession({ quiet: true })
      setNotice(successMessage)
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Thao tác chưa thể hoàn tất.'))
      loadSession({ quiet: true })
    } finally {
      setActionBusy(false)
    }
  }

  const order = session?.orders?.find((sessionOrder) => sessionOrder.status !== 'CANCELLED') || null
  const sessionLocked = session?.status !== 'OPEN'
  const activeItems = order?.items?.filter((item) => !['CANCELLED', 'REJECTED'].includes(item.kitchenStatus)) || []
  const unfinishedCount = activeItems.filter((item) => !['READY', 'SERVED'].includes(item.kitchenStatus)).length
  const canCancelSession = session?.status === 'OPEN' && activeItems.every((item) => item.kitchenStatus === 'DRAFT')
    && !(order?.items || []).some((item) => ['CANCELLED', 'REJECTED'].includes(item.kitchenStatus) && item.billedQuantity > 0)

  const handleAddDish = async (dish) => {
    if (!order || sessionLocked) return
    setAddingDishId(dish.dishId)
    setError(null)
    try {
      await addPosOrderItemApi(order.orderId, { dishId: dish.dishId, quantity: 1, note: null, clientRequestId: createRequestId('item') })
      await loadSession({ quiet: true })
      setNotice(`Đã thêm ${dish.dishName}.`)
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Không thể thêm món.'))
    } finally {
      setAddingDishId(null)
    }
  }

  const handleItemAction = async (item, action, message) => {
    setBusyItemId(item.itemId)
    setError(null)
    try {
      await action()
      await loadSession({ quiet: true })
      setNotice(message)
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Không thể cập nhật món.'))
    } finally {
      setBusyItemId(null)
    }
  }

  const editNote = (item) => setDialog({
    title: `Ghi chú cho ${item.dishName}`,
    description: 'Ghi chú hiển thị cho bếp trên màn hình KDS.',
    confirmLabel: 'Lưu ghi chú',
    reason: { label: 'Ghi chú món', placeholder: 'Ví dụ: Ít cay, không hành', required: false, defaultValue: item.note || '', maxLength: 255 },
    onConfirm: async (note) => {
      await updatePosOrderItemApi(item.itemId, { note: note || null })
      await loadSession({ quiet: true })
      setNotice(`Đã cập nhật ghi chú ${item.dishName}.`)
    },
  })

  const currentInvoiceId = session?.invoice && session.invoice.status !== 'VOID' ? session.invoice.invoiceId : null
  const payment = usePendingPayment({
    invoiceId: currentInvoiceId,
    submit: useCallback((payload, key) => payInvoiceApi(currentInvoiceId, { ...payload, idempotencyKey: key }), [currentInvoiceId]),
    onRecorded: useCallback((payload, wasRetry) => {
      setError(null)
      setNotice(`${wasRetry ? 'Đã xác nhận với máy chủ: ' : ''}${payload.method === 'CASH'
        ? (payload.cashTendered > payload.amount ? `Đã ghi nhận ${payload.amount.toLocaleString('vi-VN')} ₫ tiền mặt. Thối lại khách ${(payload.cashTendered - payload.amount).toLocaleString('vi-VN')} ₫.` : 'Đã ghi nhận thanh toán tiền mặt.')
        : 'Đã ghi nhận chuyển khoản.'}`)
      loadSession({ quiet: true })
    }, [loadSession]),
    onRejected: useCallback((message) => {
      setNotice(null)
      setError(message)
      loadSession({ quiet: true })
    }, [loadSession]),
  })

  const handlePay = (payload) => payment.collect(payload)

  const discardPendingPayment = () => setDialog({
    title: 'Bỏ khoản thu chưa rõ kết quả',
    tone: 'danger',
    description: `Chỉ bỏ khi đã kiểm tra số "Đã thu" của hóa đơn không bao gồm khoản ${Number(payment.pending?.payload?.amount || 0).toLocaleString('vi-VN')} ₫ này (ví dụ khách chưa đưa tiền).`,
    confirmLabel: 'Bỏ khoản thu này',
    onConfirm: async () => {
      payment.discard()
      setNotice('Đã bỏ khoản thu chưa rõ kết quả. Bạn có thể thu lại như một khoản mới.')
    },
  })

  const handleReopen = () => setDialog({
    title: 'Gọi thêm món',
    description: 'Bản hóa đơn hiện tại sẽ bị hủy (mã QR cũ hết hiệu lực) để thêm món. Tiền khách đã trả được giữ nguyên và trừ vào hóa đơn mới.',
    confirmLabel: 'Mở lại để gọi thêm',
    reason: { label: 'Lý do', placeholder: 'Ví dụ: Khách gọi thêm 2 ly trà', required: false, maxLength: 255 },
    onConfirm: async (reason) => {
      await reopenWithReasonApi(session.sessionId, reason || 'Khách gọi thêm món')
      await loadSession({ quiet: true })
      setNotice('Đã mở lại phiên. Khách có thể gọi thêm món.')
    },
  })

  const handleCancelSession = () => setDialog({
    title: `Hủy phiên #${session.sessionId}`,
    tone: 'danger',
    description: 'Chỉ dùng khi mở nhầm bàn hoặc khách rời đi trước khi gọi món. Món nháp sẽ bị hủy và bàn trở lại trạng thái sẵn sàng.',
    confirmLabel: 'Hủy phiên',
    reason: { label: 'Lý do', placeholder: 'Ví dụ: Mở nhầm bàn, khách đổi ý', minLength: 3 },
    onConfirm: async (reason) => {
      await cancelPosSessionApi(session.sessionId, reason)
      navigate('/staff/floor', { replace: true })
    },
  })

  const handleClose = async () => {
    setActionBusy(true)
    setError(null)
    try {
      await closePosSessionApi(session.sessionId, session.version)
      navigate('/staff/floor', { replace: true })
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Chưa thể đóng phiên. Kiểm tra trạng thái món tại bếp.'))
      setActionBusy(false)
      loadSession({ quiet: true })
    }
  }

  if (loading) return <div className="min-h-screen bg-[#f5f0e7]"><PosHeader /><main className="max-w-[1500px] mx-auto p-6 lg:p-8 space-y-5"><Skeleton className="h-28" /><div className="grid lg:grid-cols-[1.45fr_.85fr] gap-5"><Skeleton className="h-[640px]" /><Skeleton className="h-[640px]" /></div></main></div>

  if (!session) return (
    <div className="min-h-screen bg-[#f5f0e7]"><PosHeader /><main className="max-w-3xl mx-auto p-8 text-center"><AlertTriangle className="w-10 h-10 mx-auto text-red-700" /><h1 className="mt-4 moc-serif text-3xl">Không mở được phiên phục vụ</h1><p className="mt-2 text-sm text-[#625a55]">{error}</p><div className="mt-6 flex justify-center gap-3"><Button variant="outline" onClick={() => { setLoading(true); loadSession() }}>THỬ LẠI</Button><Button onClick={() => navigate('/staff/floor')}>VỀ SƠ ĐỒ BÀN</Button></div></main></div>
  )

  const tableNames = session.tables.map((table) => table.tableName)

  return (
    <div className="min-h-screen bg-[#f5f0e7] text-[#211b18]">
      <PosHeader title={`Phiên #${session.sessionId}`} subtitle={tableNames.join(' · ')} syncedAt={new Date().toISOString()} onRefresh={() => loadSession({ quiet: true })} refreshing={refreshing} />
      <main className="max-w-[1500px] mx-auto px-4 lg:px-8 py-6 lg:py-8 pb-28 xl:pb-8">
        <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button type="button" onClick={() => navigate('/staff/floor')} className="w-11 h-11 shrink-0 grid place-items-center border border-[var(--moc-line)] bg-[#fffdf8]" aria-label="Về sơ đồ bàn"><ArrowLeft className="w-5 h-5" /></button>
            <div className="min-w-0"><span className="moc-eyebrow">PHIÊN ĐANG PHỤC VỤ</span><h1 className="mt-1 moc-serif text-3xl sm:text-4xl truncate">{tableNames.join(' + ')}</h1></div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#625a55]">
            <UsersRound className="w-5 h-5 text-[#6f1d32]" /><strong className="text-[#211b18]">{session.guestCount} khách</strong><span>·</span><span>{session.staff.fullName || session.staff.username}</span>
            {canCancelSession && <Button size="sm" variant="ghost" icon={CircleSlash} onClick={handleCancelSession}>Hủy phiên</Button>}
          </div>
        </div>

        {session.reservation && (
          <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 border border-[#6f1d32]/25 bg-[#fffdf8] px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-[#6f1d32]"><CalendarClock className="w-4 h-4" /> Khách đặt trước #{session.reservation.reservationId} · {formatTime(session.reservation.reservationTime)}</span>
            <span>{session.reservation.customerName}{session.reservation.customerPhone ? ` · ${session.reservation.customerPhone}` : ''}</span>
            {session.reservation.note && <span className="text-[#625a55]">Ghi chú: {session.reservation.note}</span>}
          </div>
        )}

        {['OPEN', 'AWAITING_PAYMENT'].includes(session.status) && <SessionLivePanel session={session} onChanged={() => loadSession({ quiet: true })} />}

        <SessionManagePanel
          session={session}
          isAdmin={isAdmin}
          currentUserId={user?.accountId}
          outstanding={Number(session.invoice && session.invoice.status !== 'VOID' ? session.invoice.outstanding : order?.totalAmount || 0)}
          onChanged={() => loadSession({ quiet: true })}
          onNotice={(message) => { setError(null); setNotice(message) }}
          onError={setError}
        />

        {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-5" />}
        {notice && <Alert type="success" message={notice} onClose={() => setNotice(null)} className="mb-5" />}
        {sessionLocked && <Alert type="info" message={session.endType === 'WRITE_OFF' ? CLOSED_BY_WRITE_OFF : session.endType === 'NO_CHARGE' ? CLOSED_NO_CHARGE : LOCKED_MESSAGE[session.status] || 'Phiên đang tạm khóa.'} className="mb-5" />}

        <div className="min-w-0 grid xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,.75fr)] gap-5 items-start">
          <DishPicker dishes={dishes} categories={categories} onAdd={handleAddDish} addingDishId={addingDishId} disabled={!order || sessionLocked} />
          <aside id="pos-order-panel" className="min-w-0 space-y-5 scroll-mt-28 xl:sticky xl:top-[106px]">
            <PosOrderPanel order={order} onCreateOrder={() => runAction(() => createPosOrderApi(session.sessionId), 'Đã tạo order cho bàn.')} onChangeQuantity={(item, quantity) => handleItemAction(item, () => updatePosOrderItemApi(item.itemId, { quantity }), 'Đã cập nhật số lượng.')} onRemove={(item) => handleItemAction(item, () => deletePosOrderItemApi(item.itemId), `Đã xóa ${item.dishName}.`)} onEditNote={editNote} onSendKitchen={(itemIds) => runAction(() => sendOrderToKitchenApi(order.orderId, itemIds), `Đã gửi ${itemIds.length} món xuống bếp.`)} onCorrect={setCorrecting} correctionsEnabled={['OPEN', 'AWAITING_PAYMENT'].includes(session.status)} busyItemId={busyItemId} actionBusy={actionBusy} sessionLocked={sessionLocked} />
            {['OPEN', 'AWAITING_PAYMENT'].includes(session.status) && (
              <BillingPanel key={session.invoice?.invoiceId ? `${session.invoice.invoiceId}-${session.invoice.status}` : 'no-invoice'} session={session} order={order} unfinishedCount={unfinishedCount} actionBusy={actionBusy} onCreateInvoice={() => runAction(() => createInvoiceApi(session.sessionId), 'Đã lập hóa đơn cho phiên.')} onPay={handlePay} pendingPayment={payment.pending} paymentSending={payment.sending} onRetryPending={payment.retry} onDiscardPending={discardPendingPayment} onReopen={handleReopen} onClose={handleClose} onPrint={() => setReceiptOpen(true)} />
            )}
          </aside>
        </div>
      </main>

      {order && (
        <div className="xl:hidden fixed inset-x-0 bottom-0 z-30 border-t border-[var(--moc-line)] bg-[#fffdf8]/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0 text-sm">
            <p className="font-semibold">{activeItems.reduce((total, item) => total + item.quantity, 0)} phần · {activeItems.filter((item) => item.kitchenStatus === 'DRAFT').length} chưa gửi bếp</p>
            <p className="text-[#6f1d32] font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}</p>
          </div>
          <Button size="sm" onClick={() => document.getElementById('pos-order-panel')?.scrollIntoView({ behavior: 'smooth' })}>XEM ORDER</Button>
        </div>
      )}

      <InvoiceReceiptModal session={session} order={order} isOpen={receiptOpen} onClose={() => setReceiptOpen(false)} />
      {dialog && <ConfirmDialog key={dialog.title} isOpen {...dialog} onClose={() => setDialog(null)} />}
      {correcting && (
        <ItemCorrectionModal
          key={correcting.itemId}
          item={correcting}
          dishes={dishes}
          isAdmin={isAdmin}
          onClose={() => setCorrecting(null)}
          onDone={(message) => { setCorrecting(null); setError(null); setNotice(message); loadSession({ quiet: true }) }}
        />
      )}
    </div>
  )
}

export default PosSessionPage
