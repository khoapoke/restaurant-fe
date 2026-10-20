import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, RefreshCw, ShoppingBag, TableProperties, WalletCards } from 'lucide-react'
import Button from '../../../components/ui/Button'
import AdminDataState from '../components/AdminDataState'
import { formatCurrency } from '../constants'
import { getDashboardReportApi } from '../services/adminService'

const Metric = ({ label, value, hint, icon: Icon }) => (
  <article className="moc-panel p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4"><span className="text-xs font-bold tracking-[0.12em] text-[#766e68] uppercase">{label}</span><Icon className="h-5 w-5 text-[#6f1d32]" /></div>
    <p className="mt-5 moc-serif text-3xl font-medium tracking-[-0.03em]">{value}</p>
    <p className="mt-2 text-sm text-[#625a55]">{hint}</p>
  </article>
)

export const AdminDashboard = () => {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setReport((await getDashboardReportApi()).data) }
    catch (err) { setError(err.response?.data?.message || 'Không thể tải báo cáo vận hành.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    let active = true
    getDashboardReportApi()
      .then((response) => { if (active) setReport(response.data) })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Không thể tải báo cáo vận hành.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const maxRevenue = useMemo(() => Math.max(...(report?.revenue?.dailySeries || []).map((item) => Number(item.amount)), 1), [report])

  return (
    <div className="max-w-[1500px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><span className="moc-eyebrow">MỘC OPERATIONS</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl font-medium tracking-[-0.04em]">Tổng quan vận hành</h1><p className="mt-3 text-sm text-[#625a55]">Dữ liệu doanh thu, đơn hàng, đặt chỗ và công suất bàn theo thời gian thực.</p></div>
        <Button variant="outline" icon={RefreshCw} onClick={load}>Làm mới</Button>
      </header>

      <div className="mt-9"><AdminDataState loading={loading} error={error} onRetry={load} empty={!report}>
        {report && <div className="grid gap-6">
          <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Metric label="Doanh thu" value={formatCurrency(report.revenue.totalPaidRevenue)} hint="Giao dịch đã thanh toán" icon={WalletCards} />
            <Metric label="Đơn hàng" value={report.orders.totalCount} hint={`${report.orders.completedCount} đơn hoàn thành`} icon={ShoppingBag} />
            <Metric label="Đặt chỗ" value={report.reservations.totalBookings} hint={`${report.reservations.pendingBookings} lượt chờ duyệt`} icon={CalendarDays} />
            <Metric label="Bàn đang phục vụ" value={report.operations.tables.occupied} hint={`${report.operations.activeSessions} phiên POS đang mở`} icon={TableProperties} />
          </section>

          <section className="grid xl:grid-cols-[1.4fr_1fr] gap-5">
            <article className="moc-panel p-6">
              <div className="flex items-end justify-between gap-4"><div><span className="moc-eyebrow">7 NGÀY</span><h2 className="mt-3 moc-serif text-2xl">Nhịp doanh thu</h2></div><span className="text-xs text-[#625a55]">{report.period.fromDate} — {report.period.toDate}</span></div>
              <div className="mt-8 grid grid-cols-7 items-end gap-2 h-52">
                {report.revenue.dailySeries.map((item) => <div key={item.date} className="h-full flex flex-col justify-end gap-2 text-center"><span className="text-xs text-[#625a55]">{Number(item.amount) > 0 ? `${Math.round(Number(item.amount) / 1000)}k` : '0'}</span><div className="min-h-1 bg-[#6f1d32]" style={{ height: `${Math.max(Number(item.amount) / maxRevenue * 100, 2)}%` }} /><span className="text-xs text-[#766e68]">{item.date.slice(5)}</span></div>)}
              </div>
            </article>
            <article className="moc-panel p-6">
              <span className="moc-eyebrow">BÁN CHẠY</span><h2 className="mt-3 moc-serif text-2xl">Món được yêu thích</h2>
              <div className="mt-6 divide-y divide-[var(--moc-line)]">{report.topSellingDishes.length ? report.topSellingDishes.map((dish, index) => <div key={dish.dishId} className="flex items-center gap-4 py-4"><span className="moc-serif text-2xl text-[#6f1d32]">0{index + 1}</span><div className="min-w-0 flex-1"><p className="font-semibold truncate">{dish.dishName}</p><p className="mt-1 text-xs text-[#625a55]">{dish.totalSold} phần · {formatCurrency(dish.revenue)}</p></div></div>) : <p className="py-10 text-sm text-[#625a55]">Chưa có món hoàn thành trong kỳ.</p>}</div>
            </article>
          </section>
        </div>}
      </AdminDataState></div>
    </div>
  )
}

export default AdminDashboard
