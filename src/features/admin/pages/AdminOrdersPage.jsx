import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import AuditHistoryModal from '../../../components/ui/AuditHistoryModal'
import { useSearchParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import FeedbackBanner from '../../../components/ui/FeedbackBanner'
import Input from '../../../components/ui/Input'
import Pagination from '../../../components/ui/Pagination'
import { apiErrorMessage } from '../../../lib/apiError'
import { useApiResource } from '../../../lib/useApiResource'
import AdminDataState from '../components/AdminDataState'
import AdminOrderCard from '../components/AdminOrderCard'
import { CancelOrderModal, DeliveryFailureModal, PickupHandoffModal, RecipientModal } from '../components/OrderExceptionModals'
import { AUDIT_ACTION_LABEL } from '../../staff/pos/constants'
import { FULFILLMENT_STATUS_LABEL, FULFILLMENT_TYPE_LABEL, ORDER_STATUS_LABEL } from '../constants'
import { getAdminOrdersApi, getOrderHistoryApi, updateFulfillmentStatusApi, updateOrderStatusApi } from '../services/adminService'

const SUCCESS_MESSAGE = {
  CONFIRMED: (id) => `Đã xác nhận đơn #${id}. Bếp có thể bắt đầu chuẩn bị.`,
  PREPARING: (id) => `Đơn #${id} đã chuyển xuống bếp.`,
  READY: (id) => `Đơn #${id} đã sẵn sàng bàn giao.`,
  OUT_FOR_DELIVERY: (id) => `Đơn #${id} đã giao cho tài xế.`,
  DELIVERED: (id) => `Đơn #${id} đã giao thành công và hoàn tất.`,
  AWAITING_DRIVER: (id) => `Đơn #${id} chờ tài xế giao lại.`,
  COLLECTED: (id) => `Khách đã nhận đơn #${id}. Đơn hoàn tất.`,
}

const formatTime = (value) => (value ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—')

const selectClass = 'min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm text-[#211b18] outline-none focus:border-[#6f1d32]'

export const AdminOrdersPage = () => {
  const [searchParams] = useSearchParams()
  const [keywordInput, setKeywordInput] = useState(searchParams.get('keyword') || '')
  const [filters, setFilters] = useState({ keyword: searchParams.get('keyword') || '', status: '', fulfillmentType: '', fulfillmentStatus: searchParams.get('fulfillmentStatus') || '', page: 1 })
  const [modal, setModal] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [pendingId, setPendingId] = useState(null)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) => (current.keyword === keywordInput.trim() ? current : { ...current, keyword: keywordInput.trim(), page: 1 }))
    }, 350)
    return () => window.clearTimeout(timer)
  }, [keywordInput])

  const loader = useCallback(() => getAdminOrdersApi({
    keyword: filters.keyword || undefined,
    status: filters.status || undefined,
    fulfillmentType: filters.fulfillmentType || undefined,
    fulfillmentStatus: filters.fulfillmentStatus || undefined,
    page: filters.page,
    perPage: 10,
  }).then((response) => response.data), [filters])
  const { data, loading, refreshing, error, reload } = useApiResource(loader, { fallbackError: 'Không thể tải danh sách đơn hàng.' })
  const orders = data?.items || []
  const pagination = data?.pagination

  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value, page: 1 }))

  const runAction = async (order, action, successMessage) => {
    setPendingId(order.orderId)
    setFeedback(null)
    try {
      await action()
      setFeedback({ tone: 'success', message: successMessage })
      reload({ quiet: true })
    } catch (requestError) {
      setFeedback({ tone: 'error', message: apiErrorMessage(requestError, 'Không thể cập nhật đơn hàng.') })
      reload({ quiet: true })
    } finally {
      setPendingId(null)
    }
  }

  const advanceStatus = (order, targetStatus) => {
    if (targetStatus === 'PREPARING' && order.availableActions?.startRequiresReason) {
      // Đơn hẹn chưa tới giờ xuống bếp: ngoại lệ của quản lý, bắt buộc lý do và có nhật ký (review L).
      setDialog({
        title: `Cho đơn #${order.orderId} xuống bếp sớm`,
        description: `Đơn hẹn ${formatTime(order.scheduledAt)}; theo quy định bếp bắt đầu lúc ${formatTime(order.kitchenReleaseAt)}.`,
        confirmLabel: 'Xuống bếp ngay',
        reason: { label: 'Lý do bắt đầu sớm', placeholder: 'Ví dụ: Khách gọi xin lấy sớm lúc 11:00', minLength: 3, maxLength: 255 },
        onConfirm: async (reason) => {
          await updateOrderStatusApi(order.orderId, targetStatus, reason)
          setFeedback({ tone: 'success', message: SUCCESS_MESSAGE[targetStatus]?.(order.orderId) })
          reload({ quiet: true })
        },
      })
      return undefined
    }
    return runAction(order, () => updateOrderStatusApi(order.orderId, targetStatus), SUCCESS_MESSAGE[targetStatus]?.(order.orderId))
  }

  const advanceFulfillment = (order, targetStatus) => {
    const execute = () => runAction(order, () => updateFulfillmentStatusApi(order.orderId, targetStatus), SUCCESS_MESSAGE[targetStatus]?.(order.orderId))
    if (targetStatus === 'COLLECTED') return setModal({ kind: 'pickup', order })
    if (targetStatus !== 'DELIVERED') return execute()
    const isCash = order.payment?.paymentMethod === 'CASH' && Number(order.money?.outstanding || 0) > 0
    setDialog({
      title: targetStatus === 'DELIVERED' ? `Xác nhận đã giao đơn #${order.orderId}` : `Xác nhận khách đã nhận đơn #${order.orderId}`,
      description: 'Đơn sẽ chuyển sang hoàn thành và không thể quay lại bước trước.',
      details: isCash ? `Đơn tiền mặt: chỉ xác nhận khi tài xế đã thu ${order.money.outstanding.toLocaleString('vi-VN')} ₫. Nếu khách không nhận, dùng “Giao thất bại”.` : null,
      confirmLabel: 'Xác nhận hoàn tất',
      onConfirm: async () => {
        await updateFulfillmentStatusApi(order.orderId, targetStatus)
        setFeedback({ tone: 'success', message: SUCCESS_MESSAGE[targetStatus](order.orderId) })
        reload({ quiet: true })
      },
    })
  }

  const modalDone = (message) => {
    setModal(null)
    setFeedback({ tone: 'success', message })
    reload({ quiet: true })
  }
  const loadHistory = useCallback(() => getOrderHistoryApi(modal?.order?.orderId), [modal])

  return (
    <div className="max-w-[1500px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><span className="moc-eyebrow">ĐIỀU PHỐI ĐƠN</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Đơn hàng</h1><p className="mt-3 text-sm text-[#625a55]">Xác nhận, theo dõi bếp và bàn giao đơn giao tận nơi, tự đến lấy và tại bàn.</p></div>
        <Button variant="outline" icon={RefreshCw} isLoading={refreshing && !loading} onClick={() => reload({ quiet: true })}>Làm mới</Button>
      </header>

      <section className="mt-8 moc-panel p-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <Input icon={Search} value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="Mã đơn, tên hoặc SĐT người nhận..." aria-label="Tìm đơn hàng" />
        <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className={selectClass} aria-label="Lọc trạng thái">
          <option value="">Mọi trạng thái</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={filters.fulfillmentType} onChange={(event) => updateFilter('fulfillmentType', event.target.value)} className={selectClass} aria-label="Lọc hình thức">
          <option value="">Mọi hình thức</option>
          {Object.entries(FULFILLMENT_TYPE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={filters.fulfillmentStatus} onChange={(event) => updateFilter('fulfillmentStatus', event.target.value)} className={selectClass} aria-label="Lọc giao nhận">
          <option value="">Mọi bước giao nhận</option>
          {['AWAITING_DRIVER', 'OUT_FOR_DELIVERY', 'DELIVERY_FAILED', 'AWAITING_CUSTOMER'].map((value) => <option key={value} value={value}>{FULFILLMENT_STATUS_LABEL[value]}</option>)}
        </select>
      </section>

      <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} className="mt-4" />

      <div className="mt-5">
        <AdminDataState loading={loading} error={error} onRetry={() => reload()} empty={!orders.length} emptyMessage="Không có đơn hàng phù hợp với bộ lọc.">
          <div className="grid gap-4">
            {orders.map((order) => (
              <AdminOrderCard
                key={order.orderId}
                order={order}
                busy={pendingId === order.orderId}
                onAdvanceStatus={advanceStatus}
                onAdvanceFulfillment={advanceFulfillment}
                onCancel={(current) => setModal({ kind: 'cancel', order: current })}
                onDeliveryFailed={(current) => setModal({ kind: 'failed', order: current })}
                onEditRecipient={(current) => setModal({ kind: 'recipient', order: current })}
                onHistory={(current) => setModal({ kind: 'history', order: current })}
              />
            ))}
          </div>
          {pagination && <Pagination currentPage={pagination.currentPage} lastPage={pagination.totalPages} totalItems={pagination.totalItems} itemLabel="đơn" onPageChange={(page) => setFilters((current) => ({ ...current, page }))} disabled={refreshing} className="mt-2" />}
        </AdminDataState>
      </div>

      {dialog && <ConfirmDialog key={dialog.title} isOpen {...dialog} onClose={() => setDialog(null)} />}
      {modal?.kind === 'failed' && <DeliveryFailureModal order={modal.order} onClose={() => setModal(null)} onDone={modalDone} />}
      {modal?.kind === 'pickup' && <PickupHandoffModal order={modal.order} onClose={() => setModal(null)} onDone={modalDone} />}
      {modal?.kind === 'cancel' && <CancelOrderModal order={modal.order} onClose={() => setModal(null)} onDone={modalDone} />}
      {modal?.kind === 'recipient' && <RecipientModal order={modal.order} onClose={() => setModal(null)} onDone={modalDone} />}
      {modal?.kind === 'history' && <AuditHistoryModal title={`Lịch sử đơn #${modal.order.orderId}`} load={loadHistory} actionLabels={AUDIT_ACTION_LABEL} onClose={() => setModal(null)} />}
    </div>
  )
}

export default AdminOrdersPage
