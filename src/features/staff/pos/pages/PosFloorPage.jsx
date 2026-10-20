import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Armchair, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../contexts/AuthContext'
import { Role } from '../../../auth/constants'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'
import PosHeader from '../components/PosHeader'
import FloorSummary from '../components/FloorSummary'
import TableCard from '../components/TableCard'
import OpenSessionModal from '../components/OpenSessionModal'
import { completeTableCleaningApi, getPosFloorApi, openPosSessionApi } from '../services/posService'

const createIdempotencyKey = () =>
  globalThis.crypto?.randomUUID?.() || `pos-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const PosFloorPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const [floor, setFloor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [opening, setOpening] = useState(false)
  const [openError, setOpenError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [cleaningTableId, setCleaningTableId] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
    else if (![Role.STAFF, Role.ADMIN].includes(role)) navigate('/')
  }, [isAuthenticated, role, navigate])

  const fetchFloor = useCallback(async ({ quiet = false } = {}) => {
    quiet ? setRefreshing(true) : setLoading(true)
    setError(null)
    try {
      const response = await getPosFloorApi()
      setFloor(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải sơ đồ bàn. Vui lòng thử lại.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || ![Role.STAFF, Role.ADMIN].includes(role)) return undefined

    let active = true
    getPosFloorApi()
      .then((response) => {
        if (active) setFloor(response.data)
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Không thể tải sơ đồ bàn. Vui lòng thử lại.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isAuthenticated, role])

  const groupedTables = useMemo(() => {
    return (floor?.items || []).reduce((groups, table) => {
      const area = table.location?.split(' - ')[0] || 'Khu vực khác'
      if (!groups[area]) groups[area] = []
      groups[area].push(table)
      return groups
    }, {})
  }, [floor])

  const handleOpenSession = async (guestCount) => {
    setOpening(true)
    setOpenError(null)
    try {
      const response = await openPosSessionApi({
        tableIds: [selectedTable.tableId],
        guestCount,
        idempotencyKey: createIdempotencyKey(),
      })
      setSelectedTable(null)
      navigate(`/staff/sessions/${response.data.sessionId}`)
    } catch (err) {
      setOpenError(err.response?.data?.message || 'Không thể mở phiên phục vụ cho bàn này.')
    } finally {
      setOpening(false)
    }
  }

  const handleCompleteCleaning = async (table) => {
    setCleaningTableId(table.tableId)
    setActionError(null)
    try {
      await completeTableCleaningApi(table.tableId)
      setNotice(`${table.tableName} đã vệ sinh xong và sẵn sàng đón khách.`)
      await fetchFloor({ quiet: true })
    } catch (err) {
      setActionError(err.response?.data?.message || 'Không thể hoàn tất vệ sinh bàn này.')
    } finally {
      setCleaningTableId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e7] text-[#211b18]">
      <PosHeader syncedAt={floor?.syncedAt} onRefresh={() => fetchFloor({ quiet: true })} refreshing={refreshing} />
      <main className="max-w-[1500px] mx-auto px-5 lg:px-8 py-9 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <span className="moc-eyebrow">SƠ ĐỒ VẬN HÀNH</span>
            <h1 className="mt-4 moc-serif text-4xl sm:text-5xl font-medium tracking-[-0.04em]">Chọn bàn để bắt đầu phục vụ.</h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#766e68]">Trạng thái bàn được đồng bộ từ dữ liệu thật. Chỉ bàn sẵn sàng mới có thể mở phiên mới.</p>
        </div>

        {notice && <Alert type="success" message={notice} onClose={() => setNotice(null)} className="mb-6 bg-emerald-50 text-emerald-800" />}
        {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} className="mb-6 bg-red-50 text-red-800" />}

        {loading && (
          <div className="space-y-7">
            <Skeleton className="h-28 w-full" />
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-56 w-full" />)}</div>
          </div>
        )}

        {!loading && error && (
          <div className="min-h-80 border border-red-300/60 bg-red-50/60 flex flex-col items-center justify-center text-center p-8">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <h2 className="mt-4 moc-serif text-2xl">Không thể tải sơ đồ bàn</h2>
            <p className="mt-2 text-sm text-[#766e68]">{error}</p>
            <Button className="mt-6" icon={RefreshCw} onClick={() => fetchFloor()}>Thử lại</Button>
          </div>
        )}

        {!loading && !error && floor?.items?.length === 0 && (
          <div className="min-h-80 border border-dashed border-[var(--moc-line)] bg-[#fffdf8] flex flex-col items-center justify-center text-center p-8">
            <Armchair className="w-10 h-10 text-[#6f1d32]" />
            <h2 className="mt-4 moc-serif text-2xl">Chưa có bàn nào</h2>
            <p className="mt-2 text-sm text-[#766e68]">Hãy thêm bàn trong phần quản trị trước khi mở ca phục vụ.</p>
          </div>
        )}

        {!loading && !error && floor?.items?.length > 0 && (
          <div className="space-y-10">
            <FloorSummary summary={floor.summary} />
            {Object.entries(groupedTables).map(([area, tables]) => (
              <section key={area}>
                <div className="flex items-center gap-4 mb-4"><h2 className="moc-serif text-2xl font-medium">{area}</h2><span className="h-px flex-1 bg-[var(--moc-line)]" /><span className="text-sm text-[#766e68]">{tables.length} bàn</span></div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{tables.map((table) => <TableCard key={table.tableId} table={table} onOpen={setSelectedTable} onContinue={(currentTable) => navigate(`/staff/sessions/${currentTable.activeSession.sessionId}`)} onCompleteCleaning={handleCompleteCleaning} cleaning={cleaningTableId === table.tableId} />)}</div>
              </section>
            ))}
          </div>
        )}
      </main>

      <OpenSessionModal key={selectedTable?.tableId || 'closed'} table={selectedTable} isOpen={!!selectedTable} onClose={() => !opening && setSelectedTable(null)} onConfirm={handleOpenSession} isSubmitting={opening} error={openError} />
    </div>
  )
}

export default PosFloorPage
