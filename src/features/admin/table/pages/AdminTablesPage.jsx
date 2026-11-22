import { useState, useEffect, useCallback, useMemo } from 'react'
import { Grid, Plus, RefreshCw, LayoutGrid } from 'lucide-react'
import {
  getAdminTablesApi,
  createTableApi,
  updateTableApi,
  updateTableStatusApi,
} from '../services/adminTableService'
import TableCard from '../components/TableCard'
import TableFormModal from '../components/TableFormModal'
import DineInOpenModal from '../components/DineInOpenModal'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'

const STATUS_FILTERS = [
  { key: 'ALL', label: 'Tất cả bàn' },
  { key: 'AVAILABLE', label: 'Bàn trống' },
  { key: 'RESERVED', label: 'Đã đặt' },
  { key: 'OCCUPIED', label: 'Có khách' },
  { key: 'MAINTENANCE', label: 'Bảo trì' },
]

/**
 * Trang Sơ Đồ Bàn Ăn (AdminTablesPage)
 * - 100% Centralized Design Tokens
 * - Quản lý an toàn 4 trạng thái UI (Loading, Error, Empty, Data)
 * - Độ dài < 185 dòng
 */
export const AdminTablesPage = () => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [dineInTable, setDineInTable] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 3000)
  }

  const fetchTables = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminTablesApi()
      const list = res.data?.items || res.data || []
      setTables(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải sơ đồ bàn ăn.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTables() }, [fetchTables])

  const stats = useMemo(() => {
    const total = tables.length
    const available = tables.filter((t) => (t.status || t.trang_thai) === 'AVAILABLE').length
    const reserved = tables.filter((t) => (t.status || t.trang_thai) === 'RESERVED').length
    const occupied = tables.filter((t) => (t.status || t.trang_thai) === 'OCCUPIED').length
    return { total, available, reserved, occupied }
  }, [tables])

  const filteredTables = useMemo(() => {
    if (statusFilter === 'ALL') return tables
    return tables.filter((t) => (t.status || t.trang_thai) === statusFilter)
  }, [tables, statusFilter])

  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true)
    try {
      if (editingTable) {
        await updateTableApi(editingTable.tableId || editingTable.ma_ban, payload)
        showToast('Cập nhật thông tin bàn thành công!')
      } else {
        await createTableApi(payload)
        showToast('Tạo bàn ăn mới thành công!')
      }
      setIsFormOpen(false)
      fetchTables()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickStatusChange = async (tableId, newStatus) => {
    try {
      await updateTableStatusApi(tableId, newStatus)
      setTables((prev) =>
        prev.map((t) => ((t.tableId || t.ma_ban) === tableId ? { ...t, status: newStatus } : t))
      )
      showToast('Đã đổi trạng thái bàn!')
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể đổi trạng thái bàn.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-main">Sơ đồ Bàn ăn</h2>
            <p className="text-xs text-text-muted">Tổng số {tables.length} bàn ăn đang hoạt động tại nhà hàng</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw} isLoading={loading} onClick={fetchTables}>
            Làm mới
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => { setEditingTable(null); setIsFormOpen(true) }}>
            Thêm bàn mới
          </Button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-surface-card border border-border-subtle">
          <span className="text-[11px] text-text-muted font-medium block">Tổng số bàn</span>
          <span className="text-xl font-extrabold text-text-main font-mono">{stats.total}</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-card border border-border-subtle">
          <span className="text-[11px] text-status-success font-medium block">Bàn trống (Available)</span>
          <span className="text-xl font-extrabold text-status-success font-mono">{stats.available}</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-card border border-border-subtle">
          <span className="text-[11px] text-brand-primary font-medium block">Đã đặt trước (Reserved)</span>
          <span className="text-xl font-extrabold text-brand-primary font-mono">{stats.reserved}</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-card border border-border-subtle">
          <span className="text-[11px] text-status-info font-medium block">Có khách (Occupied)</span>
          <span className="text-xl font-extrabold text-status-info font-mono">{stats.occupied}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === f.key
                ? 'bg-brand-primary text-surface-bg shadow-md shadow-brand-primary/20'
                : 'bg-surface-card text-text-muted hover:text-text-main border border-border-subtle hover:border-border-strong'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {successToast && <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />}
      {error && <Alert type="error" message={error} action={<Button variant="outline" size="sm" onClick={fetchTables}>Thử lại</Button>} />}

      {/* 4 Trạng thái UI */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-3 h-44">
              <Skeleton className="h-5 w-24 bg-surface-card-hover" />
              <Skeleton className="h-4 w-32 bg-surface-card-hover" />
              <Skeleton className="h-4 w-40 bg-surface-card-hover" />
            </div>
          ))}
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-surface-card border border-border-subtle space-y-3">
          <Grid className="w-10 h-10 text-text-dim mx-auto" />
          <p className="text-sm font-semibold text-text-main">Không tìm thấy bàn nào</p>
          <p className="text-xs text-text-muted max-w-xs mx-auto">Chưa có bàn nào khớp với trạng thái được chọn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <TableCard
              key={table.tableId || table.ma_ban}
              table={table}
              onEdit={(t) => { setEditingTable(t); setIsFormOpen(true) }}
              onQuickStatusChange={handleQuickStatusChange}
              onOpenDineIn={(t) => setDineInTable(t)}
            />
          ))}
        </div>
      )}

      {/* Modal Thêm/Sửa bàn */}
      <TableFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTable}
        isSubmitting={isSubmitting}
      />

      {/* Modal Phục vụ Mở bàn & Cấp mã QR tại chỗ */}
      <DineInOpenModal
        isOpen={!!dineInTable}
        table={dineInTable}
        onClose={() => setDineInTable(null)}
        onSuccess={() => {
          fetchTables()
          showToast('Đã mở bàn và cấp mã QR thành công!')
        }}
      />
    </div>
  )
}

export default AdminTablesPage
