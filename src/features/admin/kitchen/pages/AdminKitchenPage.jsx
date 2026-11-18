import { useState, useEffect, useCallback, useMemo } from 'react'
import { ChefHat, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react'
import {
  getKitchenOrdersApi,
  updateKitchenDishStatusApi,
  updateKitchenOrderStatusApi,
} from '../services/kitchenService'
import KitchenFilterBar from '../components/KitchenFilterBar'
import KitchenOrderCard from '../components/KitchenOrderCard'
import Alert from '../../../../components/ui/Alert'
import Button from '../../../../components/ui/Button'
import Skeleton from '../../../../components/ui/Skeleton'

/**
 * Màn Hình Bếp KDS (AdminKitchenPage)
 * - Tiếp nhận đơn, cập nhật tiến độ nấu và bưng món theo thời gian thực
 * - Tự động đồng bộ mỗi 15 giây (Auto-refresh)
 * - 4 Trạng thái UI bắt buộc (Loading, Error, Empty, Data)
 * - 100% Centralized Design Tokens, dưới 240 dòng
 */
export const AdminKitchenPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Bộ lọc & Tìm kiếm
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Loading states cho từng nút
  const [loadingDishId, setLoadingDishId] = useState(null)
  const [loadingOrderId, setLoadingOrderId] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Tải danh sách đơn hàng bếp
  const fetchKitchenOrders = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    else setRefreshing(true)
    setError(null)

    try {
      const res = await getKitchenOrdersApi()
      const raw = res.data?.data || res.data || []
      const items = Array.isArray(raw) ? raw : (raw?.items || raw?.data || [])
      setOrders(items)
    } catch (err) {
      if (!isBackground) {
        setError(err.response?.data?.message || 'Không thể tải danh sách bếp.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Khởi chạy lần đầu
  useEffect(() => {
    fetchKitchenOrders(false)
  }, [fetchKitchenOrders])

  // Chu kỳ làm mới tự động 15 giây
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchKitchenOrders(true)
    }, 15000)

    return () => clearInterval(interval)
  }, [autoRefresh, fetchKitchenOrders])

  // Cập nhật trạng thái từng món
  const handleUpdateDishStatus = async (orderId, dishId, status) => {
    const key = `${orderId}-${dishId}`
    setLoadingDishId(key)
    try {
      await updateKitchenDishStatusApi(orderId, dishId, status)
      showToast(`Đã chuyển trạng thái món sang "${status}"!`)
      await fetchKitchenOrders(true)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái món.')
    } finally {
      setLoadingDishId(null)
    }
  }

  // Cập nhật trạng thái cả đơn
  const handleUpdateOrderStatus = async (orderId, targetStatus) => {
    setLoadingOrderId(orderId)
    try {
      await updateKitchenOrderStatusApi(orderId, targetStatus)
      showToast(`Đã đánh dấu đơn #${orderId} là "${targetStatus}"!`)
      await fetchKitchenOrders(true)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn.')
    } finally {
      setLoadingOrderId(null)
    }
  }

  // Thống kê đếm số lượng
  const counts = useMemo(() => {
    let pending = 0, cooking = 0, ready = 0
    orders.forEach((ord) => {
      ;(ord.items || ord.chi_tiet || []).forEach((item) => {
        const st = item.itemStatus || item.trang_thai_mon || 'PENDING'
        if (st === 'PENDING') pending++
        else if (st === 'COOKING') cooking++
        else if (st === 'READY') ready++
      })
    })
    return { total: orders.length, pending, cooking, ready }
  }, [orders])

  // Lọc và tìm kiếm
  const filteredOrders = useMemo(() => {
    let result = orders
    if (activeFilter !== 'ALL') {
      result = result.filter((ord) =>
        (ord.items || ord.chi_tiet || []).some((it) => (it.itemStatus || it.trang_thai_mon || 'PENDING') === activeFilter)
      )
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter((ord) => {
        const table = String(ord.tableName || ord.ten_ban || ord.tableId || '').toLowerCase()
        const orderIdStr = String(ord.orderId || ord.ma_don_hang || '')
        const dishMatch = (ord.items || []).some((it) => String(it.dishName || it.ten_mon || '').toLowerCase().includes(q))
        return table.includes(q) || orderIdStr.includes(q) || dishMatch
      })
    }
    return result
  }, [orders, activeFilter, searchTerm])

  return (
    <div className="space-y-6">
      {/* Toast thông báo */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-4 py-2.5 rounded-xl bg-surface-card border border-brand-primary text-text-main text-xs font-semibold shadow-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary">
              <ChefHat className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main">
              Màn Hình Bếp (KDS)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted">
            Điều phối chế biến, thời gian chờ và tiến độ bưng món theo thời gian thực.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => fetchKitchenOrders(false)}
          disabled={loading || refreshing}
          className="text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-primary' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Bộ lọc & Điều khiển KDS */}
      <KitchenFilterBar
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh((prev) => !prev)}
        onManualRefresh={() => fetchKitchenOrders(false)}
        loading={loading || refreshing}
        counts={counts}
      />

      {/* 4 Trạng thái UI */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-4 h-72">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-24 bg-surface-card-hover" />
                <Skeleton className="h-4 w-16 bg-surface-card-hover" />
              </div>
              <Skeleton className="h-16 w-full rounded-xl bg-surface-card-hover" />
              <Skeleton className="h-16 w-full rounded-xl bg-surface-card-hover" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="error" className="py-8 text-center flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-8 h-8 text-status-error" />
          <p className="text-sm font-semibold">{error}</p>
          <Button variant="outline" onClick={() => fetchKitchenOrders(false)} className="text-xs">
            Thử lại
          </Button>
        </Alert>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-surface-card border border-border-subtle space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto shadow-inner">
            <ChefHat className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-text-main">Hiện tại bếp không có món nào chờ nấu</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Tất cả các đơn đã được chế biến và phục vụ trọn vẹn, hoặc chưa có món mới từ khách.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((ord) => (
            <KitchenOrderCard
              key={ord.orderId || ord.ma_don_hang}
              order={ord}
              onUpdateDishStatus={handleUpdateDishStatus}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              loadingDishId={loadingDishId}
              loadingOrderId={loadingOrderId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminKitchenPage
