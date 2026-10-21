import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, RefreshCw, RotateCcw, ShoppingBag, TableProperties, Truck, WalletCards } from 'lucide-react'
import Button from '../../../components/ui/Button'
import { useApiResource } from '../../../lib/useApiResource'
import AdminDataState from '../components/AdminDataState'
import { FULFILLMENT_TYPE_LABEL, PAYMENT_METHOD_LABEL, formatCurrency } from '../constants'
import { getDashboardReportApi } from '../services/adminService'

const PERIODS = [
  { days: 7, label: '7 ngày' },
  { days: 30, label: '30 ngày' },
]

const toDateInput = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

const Metric = ({ label, value, hint, icon: Icon }) => (
  <article className="moc-panel p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4"><span className="text-xs font-bold tracking-[0.12em] text-[#625a55] uppercase">{label}</span><Icon className="h-5 w-5 text-[#6f1d32]" /></div>
    <p className="mt-5 moc-serif text-3xl font-medium tracking-[-0.03em]">{value}</p>
    <p className="mt-2 text-sm text-[#625a55]">{hint}</p>
  </article>
)

const ShareBar = ({ label, value, total, display }) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold">{label}</span><span className="text-[#625a55]">{display ?? value} · {percent}%</span></div>
      <div className="mt-2 h-2 bg-[#eee6dc]" role="presentation"><div className="h-full bg-[#6f1d32]" style={{ width: `${percent}%` }} /></div>
    </div>
  )
}

export const AdminDashboard = () => {
  const [days, setDays] = useState(7)
  const loader = useCallback(() => {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - (days - 1))
    return getDashboardReportApi({ fromDate: toDateInput(from), toDate: toDateInput(to) }).then((response) => response.data)
  }, [days])
  const { data: report, loading, refreshing, error, reload } = useApiResource(loader, { fallbackError: 'Không thể tải báo cáo vận hành.' })

  const maxRevenue = useMemo(() => Math.max(...(report?.revenue?.dailySeries || []).map((item) => Number(item.amount)), 1), [report])
  const attention = report?.attention || {}
  const attentionItems = [
    { key: 'pendingOrders', label: 'Đơn chờ xác nhận', to: '/admin/orders', icon: ShoppingBag },
    { key: 'readyForHandoff', label: 'Đơn chờ bàn giao', to: '/admin/orders', icon: Truck },
    { key: 'reservationsToConfirm', label: 'Lượt đặt chờ duyệt', to: '/admin/reservations', icon: CalendarDays },
    { key: 'refundsPending', label: 'Đơn hủy cần hoàn tiền', to: '/admin/payments?status=PAID', icon: RotateCcw },
  ]
  const fulfillmentTotal = Object.values(report?.orders?.byFulfillmentType || {}).reduce((sum, value) => sum + value, 0)

  return (
    <div className="max-w-[1500px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><span className="moc-eyebrow">MỘC OPERATIONS</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl font-medium tracking-[-0.04em]">Tổng quan vận hành</h1><p className="mt-3 text-sm text-[#625a55]">Doanh thu đã thu, đơn hàng, đặt chỗ và công suất bàn từ dữ liệu thật.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex border border-[var(--moc-line)] bg-[#fffdf8] p-1" role="group" aria-label="Kỳ báo cáo">
            {PERIODS.map((period) => (
              <button key={period.days} type="button" aria-pressed={days === period.days} onClick={() => setDays(period.days)} className={`min-h-9 px-4 text-sm font-semibold ${days === period.days ? 'moc-inverse bg-[#6f1d32] text-white' : 'text-[#211b18] hover:text-[#6f1d32]'}`}>{period.label}</button>
            ))}
          </div>
          <Button variant="outline" icon={RefreshCw} isLoading={refreshing && !loading} onClick={() => reload({ quiet: true })}>Làm mới</Button>
        </div>
      </header>

      <div className="mt-9"><AdminDataState loading={loading} error={error} onRetry={() => reload()} empty={!report}>
        {report && <div className="grid gap-6">
          <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3" aria-label="Việc cần xử lý">
            {attentionItems.map(({ key, label, to, icon: Icon }) => {
              const count = attention[key] || 0
              return (
                <Link key={key} to={to} className={`group flex items-center gap-4 border p-4 transition-colors ${count ? 'border-[#6f1d32]/35 bg-[#6f1d32]/5 hover:bg-[#6f1d32]/10' : 'border-[var(--moc-line)] bg-[#fffdf8] hover:border-[#6f1d32]/30'}`}>
                  <Icon className="h-5 w-5 shrink-0 text-[#6f1d32]" />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-[#211b18]">{label}</span>
                  <strong className={`moc-serif text-2xl ${count ? 'text-[#6f1d32]' : 'text-[#625a55]'}`}>{count}</strong>
                  <ArrowRight className="h-4 w-4 text-[#625a55] group-hover:text-[#6f1d32]" />
                </Link>
              )
            })}
          </section>

          <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Metric label="Doanh thu đã thu" value={formatCurrency(report.revenue.totalPaidRevenue)} hint={`Trung bình ${formatCurrency(report.revenue.averageOrderValue)}/giao dịch${report.revenue.refundedAmount ? ` · hoàn ${formatCurrency(report.revenue.refundedAmount)}` : ''}`} icon={WalletCards} />
            <Metric label="Đơn hàng" value={report.orders.totalCount} hint={`${report.orders.completedCount} hoàn thành · ${report.orders.cancelledCount} đã hủy (${report.orders.completionRate}%)`} icon={ShoppingBag} />
            <Metric label="Đặt chỗ" value={report.reservations.totalBookings} hint={`${report.reservations.confirmedBookings} đã xác nhận · ${report.reservations.pendingBookings} chờ duyệt`} icon={CalendarDays} />
            <Metric label="Bàn đang phục vụ" value={`${report.operations.tables.occupied}/${report.operations.tables.total}`} hint={`${report.operations.activeSessions} phiên POS · ${report.operations.tables.cleaning} bàn chờ vệ sinh`} icon={TableProperties} />
          </section>

          <section className="grid xl:grid-cols-[1.4fr_1fr] gap-5">
            <article className="moc-panel p-6 min-w-0">
              <div className="flex flex-wrap items-end justify-between gap-4"><div><span className="moc-eyebrow">{days} NGÀY</span><h2 className="mt-3 moc-serif text-2xl">Nhịp doanh thu</h2></div><span className="text-sm text-[#625a55]">{report.period.fromDate} — {report.period.toDate}</span></div>
              <div className="mt-8 overflow-x-auto">
                <div className="flex h-52 items-end gap-2" style={{ minWidth: `${report.revenue.dailySeries.length * 36}px` }}>
                  {report.revenue.dailySeries.map((item) => (
                    <div key={item.date} className="flex h-full min-w-7 flex-1 flex-col justify-end gap-2 text-center" title={`${item.date}: ${formatCurrency(item.amount)}`}>
                      {days <= 7 && <span className="text-xs text-[#625a55]">{Number(item.amount) > 0 ? `${Math.round(Number(item.amount) / 1000)}k` : '0'}</span>}
                      <div className="min-h-1 bg-[#6f1d32]" style={{ height: `${Math.max(Number(item.amount) / maxRevenue * 100, 2)}%` }} />
                      <span className="text-xs text-[#625a55]">{item.date.slice(8)}/{item.date.slice(5, 7)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
            <article className="moc-panel p-6">
              <span className="moc-eyebrow">BÁN CHẠY</span><h2 className="mt-3 moc-serif text-2xl">Món được yêu thích</h2>
              <div className="mt-6 divide-y divide-[var(--moc-line)]">{report.topSellingDishes.length ? report.topSellingDishes.map((dish, index) => <div key={dish.dishId} className="flex items-center gap-4 py-4"><span className="moc-serif text-2xl text-[#6f1d32]">0{index + 1}</span><div className="min-w-0 flex-1"><p className="font-semibold truncate">{dish.dishName}</p><p className="mt-1 text-sm text-[#625a55]">{dish.totalSold} phần · {formatCurrency(dish.revenue)}</p></div></div>) : <p className="py-10 text-sm text-[#625a55]">Chưa có đơn hoàn thành trong kỳ.</p>}</div>
            </article>
          </section>

          <section className="grid lg:grid-cols-2 gap-5">
            <article className="moc-panel p-6">
              <span className="moc-eyebrow">DÒNG TIỀN</span><h2 className="mt-3 moc-serif text-2xl">Theo phương thức</h2>
              <div className="mt-6 grid gap-5">
                {Object.entries(report.revenue.byMethod || {}).map(([method, amount]) => <ShareBar key={method} label={PAYMENT_METHOD_LABEL[method]} value={amount} total={report.revenue.totalPaidRevenue} display={formatCurrency(amount)} />)}
              </div>
            </article>
            <article className="moc-panel p-6">
              <span className="moc-eyebrow">HÌNH THỨC</span><h2 className="mt-3 moc-serif text-2xl">Đơn theo cách phục vụ</h2>
              <div className="mt-6 grid gap-5">
                {Object.entries(report.orders.byFulfillmentType || {}).map(([type, count]) => <ShareBar key={type} label={FULFILLMENT_TYPE_LABEL[type]} value={count} total={fulfillmentTotal} display={`${count} đơn`} />)}
              </div>
            </article>
          </section>
        </div>}
      </AdminDataState></div>
    </div>
  )
}

export default AdminDashboard
