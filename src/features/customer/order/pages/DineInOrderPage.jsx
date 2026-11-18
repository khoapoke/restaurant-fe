import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Utensils, AlertCircle } from 'lucide-react'
import { getCategoriesApi, getDishesApi } from '../../menu/services/menuService'
import { getDineInTrackingApi, addDineInItemsApi } from '../services/dineInService'
import DineInHeader from '../components/DineInHeader'
import DineInMenuSelector from '../components/DineInMenuSelector'
import DineInItemTracker from '../components/DineInItemTracker'
import DineInConfirmModal from '../components/DineInConfirmModal'

const STORAGE_KEYS = {
  ORDER_ID: 'T_RESMK_DINE_IN_ORDER_ID',
  TOKEN: 'T_RESMK_DINE_IN_TOKEN',
}

/**
 * Trang Gọi Món & Theo Dõi Tiến Độ Tại Bàn (DineInOrderPage)
 * - T-ResMK Dine-in QR Experience
 * - Tách bạch 2 Tab: Thực đơn gọi món & Tiến độ món ăn
 */
export default function DineInOrderPage() {
  const [searchParams] = useSearchParams()
  const urlOrderId = searchParams.get('orderId')
  const urlToken = searchParams.get('token')

  const orderId = urlOrderId || sessionStorage.getItem(STORAGE_KEYS.ORDER_ID)
  const token = urlToken || sessionStorage.getItem(STORAGE_KEYS.TOKEN)

  const [activeTab, setActiveTab] = useState('menu')
  const [orderData, setOrderData] = useState(null)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [orderError, setOrderError] = useState(null)

  const [categories, setCategories] = useState([])
  const [dishes, setDishes] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [selectedTray, setSelectedTray] = useState({})

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successToast, setSuccessToast] = useState(null)

  // Lưu phiên vào sessionStorage
  useEffect(() => {
    if (urlOrderId) sessionStorage.setItem(STORAGE_KEYS.ORDER_ID, urlOrderId)
    if (urlToken) sessionStorage.setItem(STORAGE_KEYS.TOKEN, urlToken)
  }, [urlOrderId, urlToken])

  // Lấy dữ liệu tiến độ món ăn tại bàn (ORD-DINE-03)
  const fetchTracking = useCallback(async (isSilent = false) => {
    if (!orderId || !token) {
      setOrderError('Thiếu mã đơn hoặc mã xác thực bàn ăn. Vui lòng quét lại mã QR.')
      setLoadingOrder(false)
      return
    }
    if (!isSilent) setLoadingOrder(true)
    try {
      const res = await getDineInTrackingApi(orderId, token)
      setOrderData(res?.data || res)
      setOrderError(null)
    } catch (err) {
      setOrderError(err?.response?.data?.message || 'Không thể đồng bộ trạng thái bàn ăn.')
    } finally {
      if (!isSilent) setLoadingOrder(false)
    }
  }, [orderId, token])

  // Tải danh mục và thực đơn ban đầu
  useEffect(() => {
    fetchTracking()
    const loadMenu = async () => {
      try {
        const [catRes, dishRes] = await Promise.all([
          getCategoriesApi(),
          getDishesApi({ per_page: 100 }),
        ])
        const catList = catRes?.data?.data || catRes?.data || []
        const rawDishes =
          dishRes?.data?.items ||
          dishRes?.data?.data ||
          (Array.isArray(dishRes?.data) ? dishRes.data : [])
        setCategories(Array.isArray(catList) ? catList : [])
        setDishes(Array.isArray(rawDishes) ? rawDishes : [])
      } catch (err) {
        console.error('Lỗi tải thực đơn:', err)
      }
    }
    loadMenu()
  }, [fetchTracking])

  // Auto-refresh 15s cho tiến độ món
  useEffect(() => {
    if (!orderId || !token) return
    const timer = setInterval(() => fetchTracking(true), 15000)
    return () => clearInterval(timer)
  }, [fetchTracking, orderId, token])

  // Handlers cho khay chọn món
  const handleUpdateQuantity = (dish, delta) => {
    const dishId = dish.dishId || dish.id || dish.ma_mon_an
    setSelectedTray((prev) => {
      const current = prev[dishId] || { dish, quantity: 0, note: '' }
      const newQty = Math.max(0, current.quantity + delta)
      if (newQty === 0) {
        const next = { ...prev }
        delete next[dishId]
        return next
      }
      return { ...prev, [dishId]: { ...current, quantity: newQty } }
    })
  }

  const handleUpdateNote = (dishId, note) => {
    setSelectedTray((prev) =>
      prev[dishId] ? { ...prev, [dishId]: { ...prev[dishId], note } } : prev
    )
  }

  // Gửi đợt gọi món vào bếp (ORD-DINE-02)
  const handleConfirmSubmit = async () => {
    const trayItems = Object.values(selectedTray).filter((i) => i.quantity > 0)
    if (trayItems.length === 0) return
    setSubmitting(true)
    try {
      const payload = {
        token,
        items: trayItems.map((item) => ({
          dishId: item.dish?.dishId || item.dish?.id || item.dish?.ma_mon_an,
          quantity: item.quantity,
          note: item.note ? item.note.trim() : null,
        })),
      }
      await addDineInItemsApi(orderId, payload)
      setSelectedTray({})
      setShowConfirmModal(false)
      setActiveTab('tracking')
      setSuccessToast(`Đã gửi ${trayItems.length} món vào bếp thành công!`)
      setTimeout(() => setSuccessToast(null), 4000)
      await fetchTracking(true)
    } catch (err) {
      alert(err?.response?.data?.message || 'Có lỗi khi gửi món vào bếp. Vui lòng thử lại!')
    } finally {
      setSubmitting(false)
    }
  }

  const orderedItemsCount = (orderData?.items || []).length
  const tableName = orderData?.tableName || orderData?.ten_ban || 'Bàn ăn'

  // Trạng thái Đang kết nối bàn ban đầu (Loading)
  if (loadingOrder && !orderData) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-surface-card border border-border-subtle text-center space-y-4 shadow-xl animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mx-auto animate-pulse">
            <Utensils className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-base font-bold text-text-main">Đang kết nối bàn ăn...</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Hệ thống đang xác thực phiên phục vụ và tải thực đơn nhà hàng T-ResMK.
          </p>
        </div>
      </div>
    )
  }

  // Trạng thái Lỗi xác thực hoặc không có token (Error)
  if (!orderId || !token || (orderError && !orderData)) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-surface-card border border-border-subtle text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-status-error/10 border border-status-error/20 flex items-center justify-center text-status-error mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-text-main">Không tìm thấy thông tin bàn</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            {orderError || 'Mã QR không hợp lệ hoặc phiên bàn ăn đã kết thúc. Vui lòng quét lại mã QR tại bàn.'}
          </p>
          <button
            type="button"
            onClick={() => fetchTracking()}
            className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-surface-bg text-xs font-bold transition-all"
          >
            Thử tải lại
          </button>
        </div>
      </div>
    )
  }

  // Giao diện chính (Data)
  return (
    <div className="min-h-screen bg-surface-bg text-text-main flex flex-col">
      <DineInHeader
        tableName={tableName}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        orderedItemsCount={orderedItemsCount}
        successToast={successToast}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-5">
        {activeTab === 'menu' ? (
          <DineInMenuSelector
            dishes={dishes}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            selectedTray={selectedTray}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateNote={handleUpdateNote}
            onReviewTray={() => setShowConfirmModal(true)}
            onSwitchToTracker={() => setActiveTab('tracking')}
            existingItemsCount={orderedItemsCount}
          />
        ) : (
          <DineInItemTracker
            orderData={orderData}
            loading={loadingOrder}
            error={orderError}
            onRefresh={() => fetchTracking()}
            onSwitchToMenu={() => setActiveTab('menu')}
          />
        )}
      </main>

      <DineInConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        items={Object.values(selectedTray).filter((i) => i.quantity > 0)}
        tableName={tableName}
        onConfirm={handleConfirmSubmit}
        submitting={submitting}
      />
    </div>
  )
}
