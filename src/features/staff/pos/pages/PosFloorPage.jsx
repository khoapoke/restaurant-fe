import { useCallback, useMemo, useState } from 'react'
import { AlertTriangle, Armchair, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import TableQrModal from '../../../../components/ui/TableQrModal'
import useLivePolling from '../../../../lib/useLivePolling'
import useNow from '../../../../lib/useNow'
import { apiErrorMessage } from '../../../../lib/apiError'
import PosHeader from '../components/PosHeader'
import FloorSummary from '../components/FloorSummary'
import TableCard from '../components/TableCard'
import OpenSessionModal from '../components/OpenSessionModal'
import LiveQueuePanel from '../components/LiveQueuePanel'
import { TableStatus, tableSignals } from '../constants'
import {
  acceptCheckInApi,
  acknowledgeServiceRequestApi,
  completeServiceRequestApi,
  completeTableCleaningApi,
  getLiveQueueApi,
  getPosFloorApi,
  getTableQrApi,
  openPosSessionApi,
  rejectCheckInApi,
} from '../services/posService'

const createIdempotencyKey = () =>
  globalThis.crypto?.randomUUID?.() || `pos-${Date.now()}-${Math.random().toString(16).slice(2)}`

const FILTERS = [
  { key: 'ALL', label: 'Tất cả', match: () => true },
  { key: 'ATTENTION', label: 'Cần xử lý', match: (table) => tableSignals(table).needsAttention },
  { key: 'OCCUPIED', label: 'Đang phục vụ', match: (table) => table.status === TableStatus.OCCUPIED },
  { key: 'AVAILABLE', label: 'Còn trống', match: (table) => table.status === TableStatus.AVAILABLE },
  { key: 'RESERVED', label: 'Đặt trước', match: (table) => table.status === TableStatus.RESERVED || !!table.upcomingReservation },
  { key: 'CLEANING', label: 'Chờ vệ sinh', match: (table) => table.status === TableStatus.CLEANING },
]

export const PosFloorPage = () => {
  const navigate = useNavigate()
  const now = useNow(30000)
  const floorFetcher = useCallback(({ signal }) => getPosFloorApi({ signal }).then((response) => response.data), [])
  const queueFetcher = useCallback(({ signal }) => getLiveQueueApi({ signal }).then((response) => response.data), [])
  const floorPoll = useLivePolling(floorFetcher, { interval: 8000, hiddenInterval: 30000 })
  const queuePoll = useLivePolling(queueFetcher, { interval: 3000, hiddenInterval: 15000 })
  const floor = floorPoll.data
  const queue = queuePoll.data
  const { refresh: refreshFloor } = floorPoll
  const { refresh: refreshQueue } = queuePoll

  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [opening, setOpening] = useState(false)
  const [openError, setOpenError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [cleaningTableId, setCleaningTableId] = useState(null)
  const [busyKey, setBusyKey] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [qrModal, setQrModal] = useState(null)

  const refreshAll = useCallback(() => {
    refreshFloor()
    refreshQueue()
  }, [refreshFloor, refreshQueue])

  const tables = useMemo(() => floor?.items || [], [floor])
  const tableById = useMemo(() => new Map(tables.map((table) => [table.tableId, table])), [tables])
  const activeFilter = FILTERS.find((option) => option.key === filter) || FILTERS[0]
  const counts = useMemo(() => Object.fromEntries(FILTERS.map((option) => [option.key, tables.filter(option.match).length])), [tables])

  const groupedTables = useMemo(() => tables.filter(activeFilter.match).reduce((groups, table) => {
    const area = table.location?.split(' - ')[0] || 'Khu vực khác'
    if (!groups[area]) groups[area] = []
    groups[area].push(table)
    return groups
  }, {}), [tables, activeFilter])

  const openModal = (table, mode, extra = {}) => {
    setOpenError(null)
    setSelected({ table, mode, ...extra })
  }

  const handleConfirmOpen = async (guestCount, options = {}) => {
    setOpening(true)
    setOpenError(null)
    try {
      const response = selected.mode === 'checkIn'
        ? await acceptCheckInApi(selected.checkIn.visitId, { guestCount, reservationId: options.reservationId || null })
        : await openPosSessionApi({
          tableIds: [selected.table.tableId],
          guestCount,
          reservationId: selected.mode === 'reservation' ? selected.table.upcomingReservation?.reservationId : null,
          idempotencyKey: createIdempotencyKey(),
        })
      setSelected(null)
      if (selected.mode === 'checkIn') {
        setNotice(`${selected.table.tableName} đã mở. Thực đơn đã hiện trên điện thoại của khách.`)
        refreshAll()
      } else {
        navigate(`/staff/sessions/${response.data.sessionId}`)
      }
    } catch (err) {
      setOpenError(apiErrorMessage(err, 'Không thể mở phiên phục vụ cho bàn này.'))
      refreshAll()
    } finally {
      setOpening(false)
    }
  }

  const acceptFromQueue = (checkIn) => {
    const table = tableById.get(checkIn.tableId) || { tableId: checkIn.tableId, tableName: checkIn.tableName, location: checkIn.location, capacity: 20 }
    openModal(table, 'checkIn', { checkIn })
  }

  const runQueueAction = async (key, action, success) => {
    setBusyKey(key)
    setActionError(null)
    try {
      await action()
      if (success) setNotice(success)
      refreshAll()
    } catch (err) {
      setActionError(apiErrorMessage(err))
      refreshQueue()
    } finally {
      setBusyKey(null)
    }
  }

  const handleCompleteCleaning = async (table) => {
    setCleaningTableId(table.tableId)
    setActionError(null)
    try {
      await completeTableCleaningApi(table.tableId)
      setNotice(`${table.tableName} đã vệ sinh xong và sẵn sàng đón khách.`)
      refreshFloor()
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Không thể hoàn tất vệ sinh bàn này.'))
    } finally {
      setCleaningTableId(null)
    }
  }

  const showQr = async (table) => {
    setQrModal({ tableName: table.tableName, url: null })
    try {
      const response = await getTableQrApi(table.tableId)
      setQrModal({ tableName: response.data.tableName, url: response.data.url, issuedAt: response.data.issuedAt })
    } catch (err) {
      setQrModal(null)
      setActionError(apiErrorMessage(err, 'Không lấy được mã QR của bàn.'))
    }
  }

  const liveCount = (queue?.counts?.checkIns || 0) + (queue?.counts?.newRequests || 0)
  const loading = !floor && floorPoll.status === 'connecting'
  const loadError = !floor && floorPoll.error

  return (
    <div className="min-h-screen bg-[#f5f0e7] text-[#211b18]">
      <PosHeader syncedAt={floor?.syncedAt} onRefresh={refreshAll} refreshing={false} liveCount={liveCount} connection={queuePoll.status} />
      <main className="max-w-[1500px] mx-auto px-4 sm:px-5 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-7">
          <div>
            <span className="moc-eyebrow">LIVE FLOOR</span>
            <h1 className="mt-4 moc-serif text-4xl sm:text-5xl font-medium tracking-[-0.04em]">Chọn bàn để bắt đầu phục vụ.</h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#625a55]">Hàng đợi QR cập nhật mỗi 3 giây, sơ đồ bàn mỗi 8 giây. Bàn nhấp sáng khi có yêu cầu mới; viền đỏ khi có món trễ, viền vàng khi khách xin thanh toán.</p>
        </div>

        {notice && <Alert type="success" message={notice} onClose={() => setNotice(null)} className="mb-6 bg-emerald-50 text-emerald-800" />}
        {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} className="mb-6 bg-red-50 text-red-800" />}

        <div className="mb-8">
          <LiveQueuePanel
            queue={queue}
            now={now}
            busyKey={busyKey}
            onAcceptCheckIn={acceptFromQueue}
            onRejectCheckIn={setRejecting}
            onAcknowledge={(request) => runQueueAction(`r-${request.requestId}`, () => acknowledgeServiceRequestApi(request.requestId), `Đã nhận yêu cầu của ${request.tableName}. Khách thấy “Nhân viên đang đến”.`)}
            onComplete={(request) => runQueueAction(`r-${request.requestId}`, () => completeServiceRequestApi(request.requestId), `Đã hoàn tất: ${request.label} · ${request.tableName}.`)}
            onOpenTable={(request) => navigate(`/staff/sessions/${request.sessionId}`)}
          />
        </div>

        {loading && (
          <div className="space-y-7">
            <Skeleton className="h-28 w-full" />
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-56 w-full" />)}</div>
          </div>
        )}

        {loadError && (
          <div className="min-h-80 border border-red-300/60 bg-red-50/60 flex flex-col items-center justify-center text-center p-8">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <h2 className="mt-4 moc-serif text-2xl">Không thể tải sơ đồ bàn</h2>
            <p className="mt-2 text-sm text-[#625a55]">{apiErrorMessage(floorPoll.error, 'Không thể tải sơ đồ bàn. Vui lòng thử lại.')}</p>
            <Button className="mt-6" icon={RefreshCw} onClick={refreshFloor}>Thử lại</Button>
          </div>
        )}

        {floor && tables.length === 0 && (
          <div className="min-h-80 border border-dashed border-[var(--moc-line)] bg-[#fffdf8] flex flex-col items-center justify-center text-center p-8">
            <Armchair className="w-10 h-10 text-[#6f1d32]" />
            <h2 className="mt-4 moc-serif text-2xl">Chưa có bàn nào</h2>
            <p className="mt-2 text-sm text-[#625a55]">Hãy thêm bàn trong phần quản trị trước khi mở ca phục vụ.</p>
          </div>
        )}

        {floor && tables.length > 0 && (
          <div className="space-y-8">
            <FloorSummary summary={floor.summary} />
            <div className="moc-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Lọc nhanh bàn">
              {FILTERS.map((option) => (
                <button key={option.key} type="button" aria-pressed={filter === option.key} onClick={() => setFilter(option.key)} className={`min-h-11 shrink-0 border px-4 text-sm font-semibold ${filter === option.key ? 'moc-inverse border-[#6f1d32] bg-[#6f1d32] text-[#fff8ed]' : 'border-[var(--moc-line)] bg-[#fffdf8] text-[#211b18] hover:border-[#6f1d32]/40'}`}>
                  {option.label} <span className="ml-1 opacity-80">{counts[option.key]}</span>
                </button>
              ))}
            </div>
            {Object.keys(groupedTables).length === 0 && <p className="border border-dashed border-[var(--moc-line)] bg-[#fffdf8] p-8 text-center text-sm text-[#625a55]">Không có bàn nào trong nhóm “{activeFilter.label}”.</p>}
            {Object.entries(groupedTables).map(([area, areaTables]) => (
              <section key={area}>
                <div className="flex items-center gap-4 mb-4"><h2 className="moc-serif text-2xl font-medium">{area}</h2><span className="h-px flex-1 bg-[var(--moc-line)]" /><span className="text-sm text-[#625a55]">{areaTables.length} bàn</span></div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {areaTables.map((table) => (
                    <TableCard
                      key={table.tableId}
                      table={table}
                      now={now}
                      onOpen={(current) => openModal(current, 'walkIn')}
                      onSeatReservation={(current) => openModal(current, 'reservation')}
                      onAcceptCheckIn={(current) => openModal(current, 'checkIn', { checkIn: current.pendingCheckIn })}
                      onContinue={(current) => navigate(`/staff/sessions/${current.activeSession.sessionId}`)}
                      onCompleteCleaning={handleCompleteCleaning}
                      onShowQr={showQr}
                      cleaning={cleaningTableId === table.tableId}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <OpenSessionModal
        key={`${selected?.table?.tableId || 'closed'}-${selected?.mode || ''}-${selected?.checkIn?.visitId || ''}`}
        table={selected?.table}
        reservation={selected?.mode === 'reservation' ? selected.table.upcomingReservation : null}
        checkIn={selected?.mode === 'checkIn' ? selected.checkIn : null}
        isOpen={!!selected}
        onClose={() => { if (!opening) setSelected(null) }}
        onConfirm={handleConfirmOpen}
        isSubmitting={opening}
        error={openError}
      />
      <ConfirmDialog
        key={rejecting?.visitId || 'none'}
        isOpen={!!rejecting}
        tone="danger"
        title={`Từ chối nhận bàn · ${rejecting?.tableName || ''}`}
        description={`Khách ${rejecting?.guestName || ''} sẽ thấy lý do ngay trên điện thoại.`}
        confirmLabel="Từ chối yêu cầu"
        reason={{ label: 'Lý do', placeholder: 'Ví dụ: Bàn đã được giữ cho đoàn khách 19:00, mời anh/chị sang bàn T02', minLength: 3, maxLength: 255 }}
        onConfirm={async (reason) => {
          await rejectCheckInApi(rejecting.visitId, reason)
          setNotice(`Đã từ chối yêu cầu nhận ${rejecting.tableName}.`)
          refreshAll()
        }}
        onClose={() => setRejecting(null)}
      />
      <TableQrModal isOpen={!!qrModal} onClose={() => setQrModal(null)} tableName={qrModal?.tableName} url={qrModal?.url} issuedAt={qrModal?.issuedAt} />
    </div>
  )
}

export default PosFloorPage
