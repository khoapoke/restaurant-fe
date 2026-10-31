import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Grid, CheckCircle2, Clock, Users } from 'lucide-react'
import {
  getAdminTablesApi,
  createTableApi,
  updateTableApi,
} from '../services/adminTableService'
import TableCard from '../components/TableCard'
import TableFormModal from '../components/TableFormModal'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'

export const AdminTablesPage = () => {
  const [tables, setTables] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState(null)

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
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

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  const handleOpenCreate = () => {
    setEditingTable(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (table) => {
    setEditingTable(table)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true)
    try {
      if (editingTable) {
        const id = editingTable.tableId || editingTable.ma_ban
        await updateTableApi(id, payload)
        showToast('Cập nhật thông tin bàn ăn thành công!')
      } else {
        await createTableApi(payload)
        showToast('Thêm bàn ăn mới thành công!')
      }
      setIsFormOpen(false)
      fetchTables()
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableCount = tables.filter(
    (t) => (t.status || t.trang_thai) === 'AVAILABLE'
  ).length
  const reservedCount = tables.filter(
    (t) => (t.status || t.trang_thai) === 'RESERVED'
  ).length
  const occupiedCount = tables.filter(
    (t) => (t.status || t.trang_thai) === 'OCCUPIED'
  ).length

  const filteredTables = tables.filter((t) => {
    const st = t.status || t.trang_thai || 'AVAILABLE'
    if (statusFilter !== 'ALL' && st !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Sơ đồ Bàn ăn Nhà hàng</h2>
            <p className="text-xs text-gray-400">
              Tổng số {tables.length} bàn ăn phục vụ khách hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            isLoading={loading}
            onClick={fetchTables}
          >
            Làm mới
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Thêm bàn mới
          </Button>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
          <span className="text-[11px] text-gray-400 font-medium block">Tổng số bàn</span>
          <span className="text-xl font-bold font-mono text-white mt-0.5 block">
            {tables.length} bàn
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <span className="text-[11px] text-emerald-400 font-medium block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Bàn trống
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
            {availableCount} bàn
          </span>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <span className="text-[11px] text-amber-400 font-medium block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Đã đặt trước
          </span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">
            {reservedCount} bàn
          </span>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
          <span className="text-[11px] text-purple-400 font-medium block flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Đang có khách
          </span>
          <span className="text-xl font-bold font-mono text-purple-400 mt-0.5 block">
            {occupiedCount} bàn
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: `Tất cả (${tables.length})` },
          { key: 'AVAILABLE', label: `Bàn trống (${availableCount})` },
          { key: 'RESERVED', label: `Đã đặt (${reservedCount})` },
          { key: 'OCCUPIED', label: `Đang dùng bữa (${occupiedCount})` },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setStatusFilter(item.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === item.key
                ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                : 'bg-gray-900/60 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {successToast && (
        <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          action={
            <Button variant="outline" size="sm" onClick={fetchTables}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* 4 Trạng thái UI */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3 h-44">
              <Skeleton className="h-5 w-24 bg-gray-800" />
              <Skeleton className="h-4 w-32 bg-gray-800" />
              <Skeleton className="h-4 w-40 bg-gray-800" />
            </div>
          ))}
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-gray-900/40 border border-gray-800 space-y-3">
          <Grid className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">Không tìm thấy bàn nào</p>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Không có bàn nào khớp với trạng thái bạn vừa chọn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <TableCard
              key={table.tableId || table.ma_ban}
              table={table}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      <TableFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTable}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default AdminTablesPage

