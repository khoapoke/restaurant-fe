import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
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
import { FULFILLMENT_TYPE_LABEL, ORDER_STATUS_LABEL } from '../constants'
import { cancelAdminOrderApi, getAdminOrdersApi, updateFulfillmentStatusApi, updateOrderStatusApi } from '../services/adminService'

const SUCCESS_MESSAGE = {
  CONFIRMED: (id) => `Đã xác nhận đơn #${id}. Bếp có thể bắt đầu chuẩn bị.`,
  PREPARING: (id) => `Đơn #${id} đã chuyển xuống bếp.`,
  READY: (id) => `Đơn #${id} đã sẵn sàng bàn giao.`,
  OUT_FOR_DELIVERY: (id) => `Đơn #${id} đã giao cho tài xế.`,
  DELIVERED: (id) => `Đơn #${id} đã giao thành công và hoàn tất.`,
  COLLECTED: (id) => `Khách đã nhận đơn #${id}. Đơn hoàn tất.`,
}

const selectClass = 'min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm text-[#211b18] outline-none focus:border-[#6f1d32]'

export const AdminOrdersPage = () => {
  const [searchParams] = useSearchParams()
  const [keywordInput, setKeywordInput] = useState(searchParams.get('keyword') || '')
  const [filters, setFilters] = useState({ keyword: searchParams.get('keyword') || '', status: '', fulfillmentType: '', page: 1 })
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

  const advanceStatus = (order, targetStatus) =>
    runAction(order, () => updateOrderStatusApi(order.orderId, targetStatus), SUCCESS_MESSAGE[targetStatus]?.(order.orderId))

  const advanceFulfillment = (order, targetStatus) => {
    const execute = () => runAction(order, () => updateFulfillmentStatusApi(order.orderId, targetStatus), SUCCESS_MESSAGE[targetStatus]?.(order.orderId))
    if (!['DELIVERED', 'COLLECTED'].includes(targetStatus)) return execute()
    const isCash = order.payment?.paymentMethod === 'CASH' && order.payment?.status !== 'PAID'
    setDialog({
      title: targetStatus === 'DELIVERED' ? `Xác nhận đã giao đơn #${order.orderId}` : `Xác nhận khách đã nhận đơn #${order.orderId}`,
      description: 'Đơn sẽ chuyển sang hoàn thành và không thể quay lại bước trước.',
      details: isCash ? 'Đơn thanh toán tiền mặt: hệ thống sẽ ghi nhận đã thu tiền khi xác nhận.' : null,
      confirmLabel: 'Xác nhận hoàn tất',
      onConfirm: async () => {
        await updateFulfillmentStatusApi(order.orderId, targetStatus)
        setFeedback({ tone: 'success', message: SUCCESS_MESSAGE[targetStatus](order.orderId) })
        reload({ quiet: true })
      },
    })
  }

  const cancel = (order) => setDialog({
    title: `Hủy đơn #${order.orderId}`,
    tone: 'danger',
    description: 'Khách sẽ thấy đơn ở trạng thái đã hủy kèm lý do. Món đang chờ trong bếp sẽ được rút khỏi màn hình bếp.',
    details: order.payment?.status === 'PAID' ? 'Khách đã thanh toán: sau khi hủy, hãy ghi nhận hoàn tiền trong mục Thanh toán.' : null,
    confirmLabel: 'Hủy đơn',
    reason: { label: 'Lý do hủy', placeholder: 'Ví dụ: Hết nguyên liệu chính, khách yêu cầu hủy qua điện thoại...', minLength: 5 },
    onConfirm: async (reason) => {
      await cancelAdminOrderApi(order.orderId, reason)
      setFeedback({ tone: 'success', message: `Đã hủy đơn #${order.orderId}.` })
      reload({ quiet: true })
    },
  })

  return (
    <div className="max-w-[1500px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><span className="moc-eyebrow">ĐIỀU PHỐI ĐƠN</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Đơn hàng</h1><p className="mt-3 text-sm text-[#625a55]">Xác nhận, theo dõi bếp và bàn giao đơn giao tận nơi, tự đến lấy và tại bàn.</p></div>
        <Button variant="outline" icon={RefreshCw} isLoading={refreshing && !loading} onClick={() => reload({ quiet: true })}>Làm mới</Button>
      </header>

      <section className="mt-8 moc-panel p-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <Input icon={Search} value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="Mã đơn, tên hoặc SĐT người nhận..." aria-label="Tìm đơn hàng" />
        <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className={selectClass} aria-label="Lọc trạng thái">
          <option value="">Mọi trạng thái</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={filters.fulfillmentType} onChange={(event) => updateFilter('fulfillmentType', event.target.value)} className={selectClass} aria-label="Lọc hình thức">
          <option value="">Mọi hình thức</option>
          {Object.entries(FULFILLMENT_TYPE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </section>

      <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} className="mt-4" />

      <div className="mt-5">
        <AdminDataState loading={loading} error={error} onRetry={() => reload()} empty={!orders.length} emptyMessage="Không có đơn hàng phù hợp với bộ lọc.">
          <div className="grid gap-4">
            {orders.map((order) => (
              <AdminOrderCard key={order.orderId} order={order} busy={pendingId === order.orderId} onAdvanceStatus={advanceStatus} onAdvanceFulfillment={advanceFulfillment} onCancel={cancel} />
            ))}
          </div>
          {pagination && <Pagination currentPage={pagination.currentPage} lastPage={pagination.totalPages} totalItems={pagination.totalItems} itemLabel="đơn" onPageChange={(page) => setFilters((current) => ({ ...current, page }))} disabled={refreshing} className="mt-2" />}
        </AdminDataState>
      </div>

      {dialog && <ConfirmDialog key={dialog.title} isOpen {...dialog} onClose={() => setDialog(null)} />}
    </div>
  )
}

export default AdminOrdersPage
