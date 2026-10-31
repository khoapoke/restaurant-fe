import { useState, useEffect, useCallback } from 'react'
import {
  DollarSign,
  ShoppingBag,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { getDashboardReportApi } from '../services/reportService'
import MetricCard from '../components/MetricCard'
import DashboardFilterBar from '../components/DashboardFilterBar'
import RevenueChart from '../components/RevenueChart'
import TopDishesTable from '../components/TopDishesTable'
import Skeleton from '../../../../components/ui/Skeleton'
import Alert from '../../../../components/ui/Alert'
import Button from '../../../../components/ui/Button'

export const AdminDashboardPage = () => {
  const getTodayStr = () => new Date().toISOString().split('T')[0]
  const getNDaysAgoStr = (days) => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString().split('T')[0]
  }

  const [fromDate, setFromDate] = useState(() => getNDaysAgoStr(6))
  const [toDate, setToDate] = useState(() => getTodayStr())
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReport = useCallback(async (from, to) => {
    setLoading(true)
    setError(null)
    try {
      const response = await getDashboardReportApi({ fromDate: from, toDate: to })
      setReportData(response.data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Không thể tải dữ liệu báo cáo thống kê. Vui lòng kiểm tra lại kết nối.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReport(fromDate, toDate)
  }, [fromDate, toDate, fetchReport])

  const handleDateChange = (newFrom, newTo) => {
    setFromDate(newFrom)
    setToDate(newTo)
  }

  const handleRefresh = () => {
    fetchReport(fromDate, toDate)
  }

  const revenue = reportData?.revenue || { totalPaidRevenue: 0, dailySeries: [] }
  const orders = reportData?.orders || {
    totalCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    completionRate: 0,
  }
  const reservations = reportData?.reservations || {
    totalBookings: 0,
    confirmedBookings: 0,
    occupancyRatePercent: 0,
  }
  const topSellingDishes = reportData?.topSellingDishes || []

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <DashboardFilterBar
        fromDate={fromDate}
        toDate={toDate}
        onDateChange={handleDateChange}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Error Alert with Retry */}
      {error && (
        <Alert
          type="error"
          message={error}
          action={
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={handleRefresh}
              className="text-xs"
            >
              Thử lại
            </Button>
          }
        />
      )}

      {/* 4 Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <Skeleton className="h-4 w-24 bg-gray-800" />
              <Skeleton className="h-8 w-32 bg-gray-800" />
              <Skeleton className="h-3 w-40 bg-gray-800" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Doanh thu đã thu"
            value={`${Number(revenue.totalPaidRevenue || 0).toLocaleString('vi-VN')} đ`}
            subValue="Từ các đơn thanh toán thành công"
            icon={DollarSign}
            accentColor="amber"
            badgeText="PAID"
            badgeVariant="warning"
          />

          <MetricCard
            title="Tổng đơn hàng"
            value={orders.totalCount}
            subValue={`Xong: ${orders.completedCount} | Hủy: ${orders.cancelledCount}`}
            icon={ShoppingBag}
            accentColor="emerald"
            badgeText={`${orders.completionRate}% hoàn tất`}
            badgeVariant="success"
          />

          <MetricCard
            title="Lượt đặt bàn"
            value={reservations.totalBookings}
            subValue={`Đã duyệt: ${reservations.confirmedBookings} lượt`}
            icon={CalendarCheck}
            accentColor="blue"
            badgeText={`${reservations.occupancyRatePercent}% lấp đầy`}
            badgeVariant="info"
          />

          <MetricCard
            title="Món ăn tiêu biểu"
            value={topSellingDishes.length}
            subValue={
              topSellingDishes[0]
                ? `Top 1: ${topSellingDishes[0].dishName}`
                : 'Chưa có món bán ra'
            }
            icon={TrendingUp}
            accentColor="purple"
            badgeText="Top Sellers"
            badgeVariant="neutral"
          />
        </div>
      )}

      {/* Main Charts & Rankings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 rounded-2xl bg-gray-900/60 border border-gray-800 h-80 flex flex-col justify-between">
            <Skeleton className="h-6 w-48 bg-gray-800" />
            <Skeleton className="h-48 w-full bg-gray-800" />
          </div>
          <div className="lg:col-span-5 p-6 rounded-2xl bg-gray-900/60 border border-gray-800 h-80 flex flex-col justify-between">
            <Skeleton className="h-6 w-48 bg-gray-800" />
            <Skeleton className="h-48 w-full bg-gray-800" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Biểu đồ doanh thu ngày (7/12) */}
          <div className="lg:col-span-7">
            <RevenueChart
              dailySeries={revenue.dailySeries}
              totalRevenue={revenue.totalPaidRevenue}
            />
          </div>

          {/* Cột phải: Bảng Top món ăn bán chạy (5/12) */}
          <div className="lg:col-span-5">
            <TopDishesTable dishes={topSellingDishes} />
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage

