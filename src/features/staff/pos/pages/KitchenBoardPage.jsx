import { ChefHat, RefreshCw, UtensilsCrossed } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '../../../../components/ui/Alert'
import Button from '../../../../components/ui/Button'
import Skeleton from '../../../../components/ui/Skeleton'
import { apiErrorMessage } from '../../../../lib/apiError'
import { KitchenStatus } from '../constants'
import KitchenCard from '../components/KitchenCard'
import PosHeader from '../components/PosHeader'
import { getKitchenItemsApi, updateKitchenItemStatusApi } from '../services/posService'

const COLUMNS = [
  { key: 'NEW', title: 'Món mới', statuses: [KitchenStatus.SENT, KitchenStatus.QUEUED] },
  { key: 'PREPARING', title: 'Đang làm', statuses: [KitchenStatus.PREPARING] },
  { key: 'READY', title: 'Hoàn thành', statuses: [KitchenStatus.READY] },
  { key: 'SERVED', title: 'Đã phục vụ', statuses: [KitchenStatus.SERVED] },
]

const SOURCES = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'DINE_IN', label: 'Tại bàn' },
  { value: 'ONLINE', label: 'Giao & tự lấy' },
]

export const KitchenBoardPage = () => {
  const [board, setBoard] = useState({ items: [], syncedAt: null })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyItemId, setBusyItemId] = useState(null)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('ALL')

  const loadBoard = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true)
    try {
      const response = await getKitchenItemsApi()
      setBoard(response.data)
      setError(null)
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Không thể tải bảng bếp.'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    getKitchenItemsApi()
      .then((response) => active && setBoard(response.data))
      .catch((requestError) => active && setError(apiErrorMessage(requestError, 'Không thể tải bảng bếp.')))
      .finally(() => active && setLoading(false))
    const timer = window.setInterval(() => {
      getKitchenItemsApi().then((response) => active && setBoard(response.data)).catch(() => {})
    }, 6000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])

  const visibleItems = useMemo(() => board.items.filter((item) => {
    if (source === 'ALL') return true
    const isDineIn = !item.fulfillmentType || item.fulfillmentType === 'DINE_IN'
    return source === 'DINE_IN' ? isDineIn : !isDineIn
  }), [board.items, source])

  const handleAdvance = async (item, status) => {
    setBusyItemId(item.itemId)
    setError(null)
    try {
      await updateKitchenItemStatusApi(item.itemId, status)
      await loadBoard({ quiet: true })
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Không thể cập nhật trạng thái món.'))
      loadBoard({ quiet: true })
    } finally {
      setBusyItemId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e7] text-[#211b18]">
      <PosHeader title="Bảng điều phối bếp" subtitle="KDS · Tự đồng bộ mỗi 6 giây" syncedAt={board.syncedAt} onRefresh={() => loadBoard({ quiet: true })} refreshing={refreshing} />
      <main className="max-w-[1800px] mx-auto px-4 lg:px-8 py-7 lg:py-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7">
          <div><span className="moc-eyebrow">KITCHEN DISPLAY SYSTEM</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl tracking-[-0.03em]">Nhịp bếp trong một màn hình.</h1></div>
          <div className="flex border border-[var(--moc-line)] bg-[#fffdf8] p-1" role="group" aria-label="Lọc nguồn đơn">
            {SOURCES.map((option) => (
              <button key={option.value} type="button" aria-pressed={source === option.value} onClick={() => setSource(option.value)} className={`min-h-10 px-4 text-sm font-semibold ${source === option.value ? 'moc-inverse bg-[#6f1d32] text-white' : 'text-[#211b18] hover:text-[#6f1d32]'}`}>{option.label}</button>
            ))}
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-5" />}
        {loading && <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">{COLUMNS.map((column) => <Skeleton key={column.key} className="h-[520px]" />)}</div>}

        {!loading && visibleItems.length === 0 && (
          <section className="min-h-96 border border-dashed border-[var(--moc-line)] bg-[#fffdf8] grid place-items-center text-center p-8">
            <div><UtensilsCrossed className="w-11 h-11 mx-auto text-[#6f1d32]" /><h2 className="mt-4 moc-serif text-3xl">Bếp đang thông thoáng</h2><p className="mt-2 text-sm text-[#625a55]">Món mới từ POS và đơn online đã xác nhận sẽ xuất hiện tự động tại đây.</p><Button variant="outline" icon={RefreshCw} className="mt-6" onClick={() => loadBoard({ quiet: true })}>KIỂM TRA LẠI</Button></div>
          </section>
        )}

        {!loading && visibleItems.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {COLUMNS.map((column) => {
              const items = visibleItems.filter((item) => column.statuses.includes(item.status))
              return (
                <section key={column.key} className="bg-[#eee7dc] border border-[var(--moc-line)] min-h-[460px]" aria-label={column.title}>
                  <header className="p-4 bg-[#251b19] text-white moc-inverse flex items-center justify-between gap-3"><div className="flex items-center gap-2"><ChefHat className="w-4 h-4 text-[#e0b774]" /><h2 className="text-sm font-bold tracking-[0.08em] uppercase">{column.title}</h2></div><span className="min-w-7 h-7 px-1 grid place-items-center bg-white/15 text-sm font-bold">{items.length}</span></header>
                  <div className="p-3 space-y-3">{items.length ? items.map((item) => <KitchenCard key={item.itemId} item={item} onAdvance={handleAdvance} busy={busyItemId === item.itemId} />) : <p className="py-12 text-center text-sm text-[#625a55]">Chưa có món</p>}</div>
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
