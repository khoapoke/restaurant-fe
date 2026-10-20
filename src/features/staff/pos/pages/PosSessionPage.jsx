import { AlertTriangle, ArrowLeft, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Alert from '../../../../components/ui/Alert'
import Button from '../../../../components/ui/Button'
import Skeleton from '../../../../components/ui/Skeleton'
import { useAuth } from '../../../../contexts/AuthContext'
import { Role } from '../../../auth/constants'
import { getCategoriesApi, getDishesApi } from '../../../customer/menu/services/menuService'
import BillingPanel from '../components/BillingPanel'
import DishPicker from '../components/DishPicker'
import PosHeader from '../components/PosHeader'
import PosOrderPanel from '../components/PosOrderPanel'
import {
  addPosOrderItemApi,
  closePosSessionApi,
  createInvoiceApi,
  createPosOrderApi,
  deletePosOrderItemApi,
  getPosSessionApi,
  payInvoiceApi,
  sendOrderToKitchenApi,
  updatePosOrderItemApi,
} from '../services/posService'

const createRequestId = (prefix) =>
  globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || Object.values(error.response?.data?.errors || {})?.flat?.()?.[0] || fallback

export const PosSessionPage = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
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

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
    else if (![Role.STAFF, Role.ADMIN].includes(role)) navigate('/')
  }, [isAuthenticated, role, navigate])

  const loadSession = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true)
    try {
      const response = await getPosSessionApi(sessionId)
      setSession(response.data)
      setError(null)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể tải phiên phục vụ.'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (!isAuthenticated || ![Role.STAFF, Role.ADMIN].includes(role)) return undefined
    let active = true
    Promise.all([getPosSessionApi(sessionId), getCategoriesApi(), getDishesApi({ perPage: 100, isAvailable: true })])
      .then(([sessionResponse, categoryResponse, dishResponse]) => {
        if (!active) return
        setSession(sessionResponse.data)
        setCategories(categoryResponse.data || [])
        setDishes(dishResponse.data?.items || [])
      })
      .catch((requestError) => active && setError(getErrorMessage(requestError, 'Không thể tải dữ liệu POS.')))
      .finally(() => active && setLoading(false))

    const timer = window.setInterval(() => {
      getPosSessionApi(sessionId).then((response) => active && setSession(response.data)).catch(() => {})
    }, 8000)
    return () => { active = false; window.clearInterval(timer) }
  }, [isAuthenticated, role, sessionId])

  const runAction = async (action, successMessage) => {
    setActionBusy(true)
    setError(null)
    try {
      await action()
      await loadSession({ quiet: true })
      setNotice(successMessage)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Thao tác chưa thể hoàn tất.'))
    } finally {
      setActionBusy(false)
    }
  }

  const order = session?.orders?.[0] || null
  const sessionLocked = session?.status !== 'OPEN'

  const handleAddDish = async (dish) => {
    if (!order || sessionLocked) return
    setAddingDishId(dish.dishId)
    setError(null)
    try {
      await addPosOrderItemApi(order.orderId, { dishId: dish.dishId, quantity: 1, note: null, clientRequestId: createRequestId('item') })
      await loadSession({ quiet: true })
      setNotice(`Đã thêm ${dish.dishName}.`)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể thêm món.'))
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
      setError(getErrorMessage(requestError, 'Không thể cập nhật món.'))
    } finally {
      setBusyItemId(null)
    }
  }

  const handlePay = () => runAction(
    () => payInvoiceApi(session.invoice.invoiceId, { method: 'CASH', amount: session.invoice.totalAmount, idempotencyKey: createRequestId('payment') }),
    'Đã ghi nhận thanh toán tiền mặt.'
  )

  const handleClose = async () => {
    setActionBusy(true)
    setError(null)
    try {
      await closePosSessionApi(session.sessionId, session.version)
      navigate('/staff/floor', { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Chưa thể đóng phiên. Kiểm tra trạng thái món tại bếp.'))
      setActionBusy(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#f5f0e7]"><PosHeader /><main className="max-w-[1500px] mx-auto p-6 lg:p-8 space-y-5"><Skeleton className="h-28" /><div className="grid lg:grid-cols-[1.45fr_.85fr] gap-5"><Skeleton className="h-[640px]" /><Skeleton className="h-[640px]" /></div></main></div>

  if (!session) return (
    <div className="min-h-screen bg-[#f5f0e7]"><PosHeader /><main className="max-w-3xl mx-auto p-8 text-center"><AlertTriangle className="w-10 h-10 mx-auto text-red-600" /><h1 className="mt-4 moc-serif text-3xl">Không mở được phiên phục vụ</h1><p className="mt-2 text-sm text-[#766e68]">{error}</p><Button className="mt-6" onClick={() => navigate('/staff/floor')}>VỀ SƠ ĐỒ BÀN</Button></main></div>
  )

  return (
    <div className="min-h-screen bg-[#f5f0e7] text-[#211b18]">
      <PosHeader title={`Phiên #${session.sessionId}`} subtitle={session.tables.map((table) => table.tableName).join(' · ')} syncedAt={new Date().toISOString()} onRefresh={() => loadSession({ quiet: true })} refreshing={refreshing} />
      <main className="max-w-[1500px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate('/staff/floor')} className="w-11 h-11 grid place-items-center border border-[var(--moc-line)] bg-[#fffdf8]" aria-label="Về sơ đồ bàn"><ArrowLeft className="w-5 h-5" /></button>
            <div><span className="moc-eyebrow">PHIÊN ĐANG PHỤC VỤ</span><h1 className="mt-1 moc-serif text-3xl sm:text-4xl">{session.tables.map((table) => table.tableName).join(' + ')}</h1></div>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#766e68]"><UsersRound className="w-5 h-5 text-[#6f1d32]" /><strong className="text-[#211b18]">{session.guestCount} khách</strong><span>·</span><span>{session.staff.fullName || session.staff.username}</span></div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-5 bg-red-50 text-red-800" />}
        {notice && <Alert type="success" message={notice} onClose={() => setNotice(null)} className="mb-5 bg-emerald-50 text-emerald-800" />}
        {sessionLocked && <Alert type="info" message="Phiên đã lập hóa đơn nên thực đơn được khóa. Hãy hoàn tất thanh toán và xử lý món tại màn hình bếp." className="mb-5 bg-sky-50 text-sky-800" />}

        <div className="min-w-0 grid xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,.75fr)] gap-5 items-start">
          <DishPicker dishes={dishes} categories={categories} onAdd={handleAddDish} addingDishId={addingDishId} disabled={!order || sessionLocked} />
          <aside className="min-w-0 space-y-5 xl:sticky xl:top-[106px]">
            <PosOrderPanel order={order} onCreateOrder={() => runAction(() => createPosOrderApi(session.sessionId), 'Đã tạo order cho bàn.')} onChangeQuantity={(item, quantity) => handleItemAction(item, () => updatePosOrderItemApi(item.itemId, { quantity }), 'Đã cập nhật số lượng.')} onRemove={(item) => handleItemAction(item, () => deletePosOrderItemApi(item.itemId), `Đã xóa ${item.dishName}.`)} onSendKitchen={(itemIds) => runAction(() => sendOrderToKitchenApi(order.orderId, itemIds), 'Đã chuyển món xuống bếp.')} busyItemId={busyItemId} actionBusy={actionBusy} sessionLocked={sessionLocked} />
            <BillingPanel session={session} order={order} onCreateInvoice={() => runAction(() => createInvoiceApi(session.sessionId), 'Đã lập hóa đơn cho phiên.')} onPay={handlePay} onClose={handleClose} actionBusy={actionBusy} />
          </aside>
        </div>
      </main>
    </div>
  )
}

export default PosSessionPage
