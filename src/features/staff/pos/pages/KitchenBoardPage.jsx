import { ChefHat, RefreshCw, UtensilsCrossed } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../../../../components/ui/Alert'
import Button from '../../../../components/ui/Button'
import Skeleton from '../../../../components/ui/Skeleton'
import { useAuth } from '../../../../contexts/AuthContext'
import { Role } from '../../../auth/constants'
import { KITCHEN_STATUS_META, KitchenStatus } from '../constants'
import KitchenCard from '../components/KitchenCard'
import PosHeader from '../components/PosHeader'
import { getKitchenItemsApi, updateKitchenItemStatusApi } from '../services/posService'

const COLUMNS = [KitchenStatus.SENT, KitchenStatus.QUEUED, KitchenStatus.PREPARING, KitchenStatus.READY]

export const KitchenBoardPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const [board, setBoard] = useState({ items: [], syncedAt: null })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyItemId, setBusyItemId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
    else if (![Role.STAFF, Role.ADMIN].includes(role)) navigate('/')
  }, [isAuthenticated, role, navigate])

  const loadBoard = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true)
    try {
      const response = await getKitchenItemsApi()
      setBoard(response.data)
      setError(null)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tải bảng bếp.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || ![Role.STAFF, Role.ADMIN].includes(role)) return undefined
    let active = true
    getKitchenItemsApi()
      .then((response) => active && setBoard(response.data))
      .catch((requestError) => active && setError(requestError.response?.data?.message || 'Không thể tải bảng bếp.'))
      .finally(() => active && setLoading(false))
    const timer = window.setInterval(() => {
      getKitchenItemsApi().then((response) => active && setBoard(response.data)).catch(() => {})
    }, 6000)
    return () => { active = false; window.clearInterval(timer) }
  }, [isAuthenticated, role])

  const handleAdvance = async (item, status) => {
    setBusyItemId(item.itemId)
    setError(null)
    try {
      await updateKitchenItemStatusApi(item.itemId, status)
      await loadBoard({ quiet: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể cập nhật trạng thái món.')
    } finally {
      setBusyItemId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e7] text-[#211b18]">
      <PosHeader title="Bảng điều phối bếp" subtitle="KDS · Cập nhật theo thời gian thực" syncedAt={board.syncedAt} onRefresh={() => loadBoard({ quiet: true })} refreshing={refreshing} />
      <main className="max-w-[1800px] mx-auto px-4 lg:px-8 py-7 lg:py-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7">
          <div><span className="moc-eyebrow">KITCHEN DISPLAY SYSTEM</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl tracking-[-0.03em]">Nhịp bếp trong một màn hình.</h1></div>
          <p className="max-w-md text-sm leading-6 text-[#766e68]">Nhận món, chế biến, báo sẵn sàng và xác nhận phục vụ theo đúng thứ tự.</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-5 bg-red-50 text-red-800" />}
        {loading && <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">{COLUMNS.map((status) => <Skeleton key={status} className="h-[520px]" />)}</div>}

        {!loading && board.items.length === 0 && (
          <section className="min-h-96 border border-dashed border-[var(--moc-line)] bg-[#fffdf8] grid place-items-center text-center p-8">
            <div><UtensilsCrossed className="w-11 h-11 mx-auto text-[#6f1d32]" /><h2 className="mt-4 moc-serif text-3xl">Bếp đang thông thoáng</h2><p className="mt-2 text-sm text-[#766e68]">Các món mới từ POS sẽ xuất hiện tự động tại đây.</p><Button variant="outline" icon={RefreshCw} className="mt-6" onClick={() => loadBoard()}>KIỂM TRA LẠI</Button></div>
          </section>
        )}

        {!loading && board.items.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {COLUMNS.map((status) => {
              const items = board.items.filter((item) => item.status === status)
              const meta = KITCHEN_STATUS_META[status]
              return (
                <section key={status} className="bg-[#eee7dc] border border-[var(--moc-line)] min-h-[460px]">
                  <header className="p-4 bg-[#251b19] text-white moc-inverse flex items-center justify-between gap-3"><div className="flex items-center gap-2"><ChefHat className="w-4 h-4 text-[#d7b074]" /><h2 className="text-sm font-bold tracking-[0.08em]">{meta.label.toUpperCase()}</h2></div><span className="w-7 h-7 grid place-items-center bg-white/10 text-sm font-bold">{items.length}</span></header>
                  <div className="p-3 space-y-3">{items.length ? items.map((item) => <KitchenCard key={item.itemId} item={item} onAdvance={handleAdvance} busy={busyItemId === item.itemId} />) : <p className="py-12 text-center text-sm text-[#8b817a]">Chưa có món</p>}</div>
                </section>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default KitchenBoardPage
