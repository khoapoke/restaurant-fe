import { BellOff, BellRing, ChefHat, RefreshCw, TriangleAlert, UtensilsCrossed } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import Alert from '../../../../components/ui/Alert'
import Button from '../../../../components/ui/Button'
import Skeleton from '../../../../components/ui/Skeleton'
import { apiErrorMessage } from '../../../../lib/apiError'
import useLivePolling from '../../../../lib/useLivePolling'
import useNow from '../../../../lib/useNow'
import { KitchenStatus, kitchenSlaLevel } from '../constants'
import KitchenCard from '../components/KitchenCard'
import PosHeader from '../components/PosHeader'
import { getKitchenItemsApi, updateKitchenItemStatusApi } from '../services/posService'

const COLUMNS = [
  { key: 'NEW', title: 'Món mới', statuses: [KitchenStatus.SENT, KitchenStatus.QUEUED] },
  { key: 'PREPARING', title: 'Đang làm', statuses: [KitchenStatus.PREPARING] },
  { key: 'READY', title: 'Hoàn thành', statuses: [KitchenStatus.READY] },
  { key: 'SERVED', title: 'Đã phục vụ', statuses: [KitchenStatus.SERVED] },
]

const sourceKey = (item) => {
  if (item.fulfillmentType === 'DELIVERY') return 'DELIVERY'
  if (item.fulfillmentType === 'PICKUP') return 'PICKUP'
  return item.source === 'TABLE_QR' ? 'TABLE_QR' : 'POS'
}

const SOURCES = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'POS', label: 'Tại bàn · POS' },
  { value: 'TABLE_QR', label: 'QR tại bàn' },
  { value: 'DELIVERY', label: 'Giao hàng' },
  { value: 'PICKUP', label: 'Tự đến lấy' },
]

const SOUND_KEY = 'moc.kds.sound'

const readSoundPreference = () => {
  try {
    return window.localStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    return true
  }
}

/** Tiếng "ting" ngắn bằng Web Audio, không cần file âm thanh. */
const playChime = (contextRef) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    contextRef.current = contextRef.current || new AudioContextClass()
    const context = contextRef.current
    if (context.state === 'suspended') context.resume()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.12)
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.5)
  } catch {
    // Trình duyệt chặn âm thanh: vẫn còn tín hiệu hình ảnh.
  }
}

export const KitchenBoardPage = () => {
  const now = useNow(15000)
  const [source, setSource] = useState('ALL')
  const [overrides, setOverrides] = useState({})
  const [error, setError] = useState(null)
  const [soundOn, setSoundOn] = useState(readSoundPreference)
  const [newIds, setNewIds] = useState([])
  const audioRef = useRef(null)
  const soundRef = useRef(soundOn)

  const fetcher = useCallback(async ({ signal, previous }) => {
    const response = await getKitchenItemsApi({ signal })
    const board = response.data
    if (previous) {
      const known = new Set(previous.items.map((item) => item.itemId))
      const arrived = board.items.filter((item) => !known.has(item.itemId) && item.status === KitchenStatus.SENT).map((item) => item.itemId)
      if (arrived.length) {
        setNewIds(arrived)
        if (soundRef.current) playChime(audioRef)
      }
    }
    return board
  }, [])

  const polling = useLivePolling(fetcher, { interval: 3000, hiddenInterval: 10000 })
  const { data: board, setData: setBoard, refresh } = polling
  const sla = { warningMinutes: 10, lateMinutes: 20, ...(board?.sla || {}) }

  const items = useMemo(() => (board?.items || []).map((item) => (overrides[item.itemId] ? { ...item, status: overrides[item.itemId] } : item)), [board, overrides])
  const counts = useMemo(() => Object.fromEntries(SOURCES.map((option) => [option.value, option.value === 'ALL' ? items.length : items.filter((item) => sourceKey(item) === option.value).length])), [items])
  const visibleItems = useMemo(() => items.filter((item) => source === 'ALL' || sourceKey(item) === source), [items, source])

  const slaStats = visibleItems.reduce((stats, item) => {
    const startedAt = item.sentAt || item.orderedAt
    const minutes = startedAt ? Math.floor((now - new Date(startedAt).getTime()) / 60000) : 0
    stats[kitchenSlaLevel(item, minutes, sla)] += 1
    return stats
  }, { normal: 0, warning: 0, late: 0 })

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    soundRef.current = next
    try {
      window.localStorage.setItem(SOUND_KEY, next ? 'on' : 'off')
    } catch {
      // Không lưu được tùy chọn: chỉ áp dụng trong tab hiện tại.
    }
    if (next) playChime(audioRef)
  }

  /** Cập nhật lạc quan: đổi cột ngay, hoàn tác nếu API từ chối. */
  const handleAdvance = async (item, status) => {
    setError(null)
    setOverrides((current) => ({ ...current, [item.itemId]: status }))
    try {
      const response = await updateKitchenItemStatusApi(item.itemId, status)
      setBoard((current) => current && ({ ...current, items: current.items.map((entry) => (entry.itemId === item.itemId ? { ...entry, ...response.data } : entry)) }))
    } catch (requestError) {
      setError(`${item.dishName}: ${apiErrorMessage(requestError, 'Không thể cập nhật trạng thái món.')}`)
      refresh()
    } finally {
      setOverrides((current) => {
        const next = { ...current }
        delete next[item.itemId]
        return next
      })
    }
  }

  const loading = !board && !polling.error

  return (
    <div className="min-h-screen bg-[#f5f0e7] text-[#211b18]">
      <PosHeader title="Bảng điều phối bếp" subtitle="KDS · Đồng bộ mỗi 3 giây" syncedAt={board?.syncedAt} onRefresh={refresh} refreshing={false} connection={polling.status} />
      <main className="max-w-[1800px] mx-auto px-4 lg:px-8 py-7 lg:py-10">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 mb-6">
          <div>
            <span className="moc-eyebrow">KITCHEN DISPLAY SYSTEM</span>
            <h1 className="mt-3 moc-serif text-4xl sm:text-5xl tracking-[-0.03em]">Nhịp bếp trong một màn hình.</h1>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#625a55]">
              <span>SLA: bình thường dưới {sla.warningMinutes} phút · sắp trễ từ {sla.warningMinutes} · trễ từ {sla.lateMinutes} phút</span>
              {slaStats.warning > 0 && <span className="bg-[#f3e7d3] px-2 py-0.5 font-semibold text-[#6b4a12]">{slaStats.warning} sắp trễ</span>}
              {slaStats.late > 0 && <span className="inline-flex items-center gap-1 bg-[#fbeaea] px-2 py-0.5 font-semibold text-[#8a1c1c]"><TriangleAlert className="h-3.5 w-3.5" />{slaStats.late} đã trễ</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="moc-scroll-x flex max-w-full overflow-x-auto border border-[var(--moc-line)] bg-[#fffdf8] p-1" role="group" aria-label="Lọc nguồn đơn">
              {SOURCES.map((option) => (
                <button key={option.value} type="button" aria-pressed={source === option.value} onClick={() => setSource(option.value)} className={`min-h-11 shrink-0 px-3 text-sm font-semibold ${source === option.value ? 'moc-inverse bg-[#6f1d32] text-white' : 'text-[#211b18] hover:text-[#6f1d32]'}`}>
                  {option.label} <span className="opacity-75">{counts[option.value]}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={toggleSound} aria-pressed={soundOn} className="inline-flex min-h-12 items-center gap-2 border border-[var(--moc-line)] bg-[#fffdf8] px-4 text-sm font-semibold text-[#211b18] hover:border-[#6f1d32]/40">
              {soundOn ? <BellRing className="h-4 w-4 text-[#6f1d32]" /> : <BellOff className="h-4 w-4" />} Âm báo: {soundOn ? 'Bật' : 'Tắt'}
            </button>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-5" />}
        {!board && polling.error && <Alert type="error" message={apiErrorMessage(polling.error, 'Không thể tải bảng bếp.')} className="mb-5" />}
        {loading && <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">{COLUMNS.map((column) => <Skeleton key={column.key} className="h-[520px]" />)}</div>}

        {board && visibleItems.length === 0 && (
          <section className="min-h-96 border border-dashed border-[var(--moc-line)] bg-[#fffdf8] grid place-items-center text-center p-8">
            <div><UtensilsCrossed className="w-11 h-11 mx-auto text-[#6f1d32]" /><h2 className="mt-4 moc-serif text-3xl">Bếp đang thông thoáng</h2><p className="mt-2 text-sm text-[#625a55]">Món mới từ POS, QR tại bàn và đơn online đã xác nhận sẽ xuất hiện tự động tại đây.</p><Button variant="outline" icon={RefreshCw} className="mt-6" onClick={refresh}>KIỂM TRA LẠI</Button></div>
          </section>
        )}

        {board && visibleItems.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {COLUMNS.map((column) => {
              const columnItems = visibleItems.filter((item) => column.statuses.includes(item.status))
              return (
                <section key={column.key} className="bg-[#eee7dc] border border-[var(--moc-line)] min-h-[460px]" aria-label={column.title}>
                  <header className="p-4 bg-[#251b19] text-white moc-inverse flex items-center justify-between gap-3"><div className="flex items-center gap-2"><ChefHat className="w-4 h-4 text-[#e0b774]" /><h2 className="text-sm font-bold tracking-[0.08em] uppercase">{column.title}</h2></div><span className="min-w-7 h-7 px-1 grid place-items-center bg-white/15 text-sm font-bold">{columnItems.length}</span></header>
                  <div className="p-3 space-y-3">{columnItems.length ? columnItems.map((item) => <KitchenCard key={item.itemId} item={item} now={now} sla={sla} onAdvance={handleAdvance} busy={!!overrides[item.itemId]} isNew={newIds.includes(item.itemId)} />) : <p className="py-12 text-center text-sm text-[#625a55]">Chưa có món</p>}</div>
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
