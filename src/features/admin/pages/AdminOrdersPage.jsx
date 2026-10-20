import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Ban, Search, ShoppingBag, Truck } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import AdminDataState from '../components/AdminDataState'
import {
  FULFILLMENT_STATUS_LABEL,
  FULFILLMENT_TYPE_LABEL,
  NEXT_FULFILLMENT_STATUS,
  NEXT_ORDER_STATUS,
  ORDER_STATUS_LABEL,
  formatCurrency,
  formatDateTime,
} from '../constants'
import {
  cancelAdminOrderApi,
  getAdminOrdersApi,
  updateFulfillmentStatusApi,
  updateOrderStatusApi,
} from '../services/adminService'

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [filters, setFilters] = useState({ keyword: '', status: '', fulfillmentType: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [pendingId, setPendingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setOrders((await getAdminOrdersApi({ ...filters, keyword: filters.keyword || undefined, status: filters.status || undefined, perPage: 50 })).data.items || []) }
    catch (err) { setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.') }
    finally { setLoading(false) }
  }, [filters])
  useEffect(() => {
    let active = true
    getAdminOrdersApi({ ...filters, keyword: filters.keyword || undefined, status: filters.status || undefined, perPage: 50 })
      .then((response) => { if (active) setOrders(response.data.items || []) })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [filters])

  const updateStatus = async (order, targetStatus) => {
    setPendingId(order.orderId); setNotice(null)
    try { const response = await updateOrderStatusApi(order.orderId, targetStatus); setNotice(response.message); await load() }
    catch (err) { setNotice(err.response?.data?.message || 'Không thể chuyển trạng thái đơn.') }
    finally { setPendingId(null) }
  }
  const updateFulfillment = async (order, targetStatus) => {
    setPendingId(order.orderId); setNotice(null)
    try { const response = await updateFulfillmentStatusApi(order.orderId, targetStatus); setNotice(response.message); await load() }
    catch (err) { setNotice(err.response?.data?.message || 'Không thể cập nhật trạng thái giao nhận.') }
    finally { setPendingId(null) }
  }
  const cancel = async (order) => {
    const reason = window.prompt('Nhập lý do hủy đơn (tối thiểu 5 ký tự):')
    if (!reason) return
    setPendingId(order.orderId)
    try { const response = await cancelAdminOrderApi(order.orderId, reason); setNotice(response.message); await load() }
    catch (err) { setNotice(err.response?.data?.message || 'Không thể hủy đơn.') }
    finally { setPendingId(null) }
  }

  return (
    <div className="max-w-[1500px] mx-auto">
      <header><span className="moc-eyebrow">ĐIỀU PHỐI ONLINE</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Đơn hàng</h1><p className="mt-3 text-sm text-[#625a55]">Theo dõi toàn bộ vòng đời đơn, từ tiếp nhận đến hoàn thành.</p></header>
      <section className="mt-8 moc-panel p-4 grid gap-3 md:grid-cols-[1fr_auto_auto]"><Input icon={Search} value={filters.keyword} onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))} placeholder="Mã đơn hoặc tên khách..." /><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm"><option value="">Mọi trạng thái</option>{Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={filters.fulfillmentType} onChange={(event) => setFilters((current) => ({ ...current, fulfillmentType: event.target.value }))} className="min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm"><option value="">Mọi hình thức</option>{Object.entries(FULFILLMENT_TYPE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></section>
      {notice && <p className="mt-4 border border-[#6f1d32]/20 bg-[#fffdf8] px-4 py-3 text-sm text-[#6f1d32]">{notice}</p>}

      <div className="mt-5"><AdminDataState loading={loading} error={error} onRetry={load} empty={!orders.length}>
        <div className="grid gap-4">{orders.map((order) => {
          const next = NEXT_ORDER_STATUS[order.status]
          const nextFulfillment = NEXT_FULFILLMENT_STATUS[order.fulfillmentStatus]
          const canCancel = order.fulfillmentType !== 'DINE_IN' && !['COMPLETED', 'CANCELLED'].includes(order.status)
          const fulfillmentActionLabel = { OUT_FOR_DELIVERY: 'Bắt đầu giao', DELIVERED: 'Xác nhận đã giao', COLLECTED: 'Khách đã nhận món' }[nextFulfillment]
          const handoffSummary = order.fulfillmentType === 'DELIVERY'
            ? `${order.recipientName || 'Khách hàng'} · ${order.recipientPhone || 'Chưa có SĐT'} · ${order.shippingAddress || 'Chưa có địa chỉ'}`
            : order.fulfillmentType === 'PICKUP'
              ? `${order.recipientName || 'Khách hàng'} · ${order.recipientPhone || 'Chưa có SĐT'}${order.scheduledAt ? ` · Hẹn ${formatDateTime(order.scheduledAt)}` : ' · Lấy sớm nhất'}`
              : 'Phiên phục vụ tại bàn được xử lý trong POS'
          return <article key={order.orderId} className="moc-panel p-5 sm:p-6"><div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><span className="moc-serif text-2xl">Đơn #{order.orderId}</span><span className="bg-[#6f1d32]/8 px-2.5 py-1 text-xs font-bold text-[#6f1d32]">{ORDER_STATUS_LABEL[order.status] || order.status}</span><span className="bg-[#eee6dc] px-2.5 py-1 text-xs font-semibold">{FULFILLMENT_TYPE_LABEL[order.fulfillmentType] || order.fulfillmentType}</span><span className="border border-[#6f1d32]/15 px-2.5 py-1 text-xs text-[#6f1d32]">{FULFILLMENT_STATUS_LABEL[order.fulfillmentStatus] || order.fulfillmentStatus}</span></div><p className="mt-2 text-sm text-[#625a55]">{formatDateTime(order.orderDate)} · {order.customer?.fullName || order.customer?.username || 'Khách tại quầy'}</p><p className="mt-3 max-w-4xl text-sm leading-6">{handoffSummary}</p>{order.note && <p className="mt-1 text-xs italic text-[#766e68]">Ghi chú: {order.note}</p>}</div><div className="lg:text-right"><p className="moc-serif text-2xl text-[#6f1d32]">{formatCurrency(order.totalAmount)}</p><p className="mt-1 text-xs text-[#625a55]">{order.payment?.status || 'Chưa có thanh toán'}</p></div></div>
            <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-4 gap-2">{(order.items || []).map((item) => <div key={item.itemId || `${item.dishId}-${item.dishName}`} className="border border-[var(--moc-line)] bg-white px-3 py-2 text-sm"><strong>{item.quantity}×</strong> {item.dishName}</div>)}</div>
            <div className="mt-5 flex flex-wrap gap-3">{next && <Button size="sm" icon={ArrowRight} isLoading={pendingId === order.orderId} onClick={() => updateStatus(order, next)}>Chuyển: {ORDER_STATUS_LABEL[next]}</Button>}{nextFulfillment && <Button size="sm" icon={Truck} isLoading={pendingId === order.orderId} onClick={() => updateFulfillment(order, nextFulfillment)}>{fulfillmentActionLabel}</Button>}{canCancel && <Button size="sm" variant="danger" icon={Ban} disabled={pendingId === order.orderId} onClick={() => cancel(order)}>Hủy đơn</Button>}</div>
          </article>
        })}</div>
      </AdminDataState></div>
      {!loading && !orders.length && <ShoppingBag className="sr-only" />}
    </div>
  )
}

export default AdminOrdersPage
