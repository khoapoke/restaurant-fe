import { useCallback, useMemo, useState } from 'react'
import { MapPin, Pencil, Plus, RefreshCw, Users, Wrench } from 'lucide-react'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import FeedbackBanner from '../../../components/ui/FeedbackBanner'
import { useApiResource } from '../../../lib/useApiResource'
import AdminDataState from '../components/AdminDataState'
import TableEditorModal from '../components/TableEditorModal'
import { TABLE_STATUS_LABEL } from '../constants'
import { createTableApi, getAdminTablesApi, updateTableApi } from '../services/adminService'

const STATUS_STYLE = {
  AVAILABLE: 'bg-emerald-100 text-emerald-900',
  RESERVED: 'bg-[#6f1d32]/10 text-[#6f1d32]',
  OCCUPIED: 'moc-inverse bg-[#6f1d32] text-white',
  CLEANING: 'bg-sky-100 text-sky-900',
  MAINTENANCE: 'bg-stone-300 text-stone-900',
}

export const AdminTablesPage = () => {
  const [editor, setEditor] = useState(undefined)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [dialog, setDialog] = useState(null)

  const loader = useCallback(() => getAdminTablesApi().then((response) => response.data.items || []), [])
  const { data, loading, refreshing, error, reload } = useApiResource(loader, { fallbackError: 'Không thể tải cấu hình bàn.' })
  const tables = useMemo(() => data || [], [data])
  const summary = useMemo(() => tables.reduce((counts, table) => ({ ...counts, [table.status]: (counts[table.status] || 0) + 1 }), {}), [tables])

  const save = async (payload) => {
    setSaving(true)
    try {
      if (editor) await updateTableApi(editor.tableId, payload)
      else await createTableApi(payload)
      setFeedback({ tone: 'success', message: editor ? `Đã cập nhật ${payload.tableName}.` : `Đã thêm ${payload.tableName}.` })
      setEditor(undefined)
      reload({ quiet: true })
    } finally {
      setSaving(false)
    }
  }

  const toggleMaintenance = (table) => {
    const entering = table.status !== 'MAINTENANCE'
    setDialog({
      title: entering ? `Đưa ${table.tableName} vào bảo trì` : `Mở lại ${table.tableName}`,
      tone: entering ? 'danger' : 'primary',
      description: entering
        ? 'Bàn sẽ không hiển thị cho khách đặt và không thể mở phiên POS cho đến khi kết thúc bảo trì.'
        : 'Bàn sẽ sẵn sàng đón khách và nhận đặt chỗ trở lại.',
      confirmLabel: entering ? 'Bảo trì' : 'Mở lại bàn',
      onConfirm: async () => {
        await updateTableApi(table.tableId, { status: entering ? 'MAINTENANCE' : 'AVAILABLE' })
        setFeedback({ tone: 'success', message: entering ? `${table.tableName} đang bảo trì.` : `${table.tableName} đã sẵn sàng.` })
        reload({ quiet: true })
      },
    })
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><span className="moc-eyebrow">SƠ ĐỒ NHÀ HÀNG</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Bàn ăn</h1><p className="mt-3 text-sm text-[#625a55]">Quản lý sức chứa, khu vực và lịch bảo trì của từng bàn.</p></div>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" icon={RefreshCw} isLoading={refreshing && !loading} onClick={() => reload({ quiet: true })}>Làm mới</Button>
          <Button icon={Plus} onClick={() => setEditor(null)}>Thêm bàn</Button>
        </div>
      </header>

      {tables.length > 0 && (
        <ul className="mt-7 flex flex-wrap gap-2 text-sm">
          {Object.entries(TABLE_STATUS_LABEL).map(([status, label]) => (
            <li key={status} className={`px-3 py-1.5 font-semibold ${STATUS_STYLE[status]}`}>{label}: {summary[status] || 0}</li>
          ))}
        </ul>
      )}

      <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} className="mt-5" />

      <div className="mt-6">
        <AdminDataState loading={loading} error={error} onRetry={() => reload()} empty={!tables.length} emptyMessage="Chưa có bàn nào." emptyAction={<Button icon={Plus} onClick={() => setEditor(null)}>Thêm bàn đầu tiên</Button>}>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {tables.map((table) => {
              const canToggleMaintenance = ['AVAILABLE', 'CLEANING', 'MAINTENANCE'].includes(table.status)
              return (
                <article key={table.tableId} className="moc-panel p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-flex px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[table.status] || 'bg-[#eee6dc]'}`}>{TABLE_STATUS_LABEL[table.status] || table.status}</span>
                      <h2 className="mt-4 moc-serif text-2xl">{table.tableName}</h2>
                    </div>
                    <button type="button" onClick={() => setEditor(table)} className="p-2 text-[#6f1d32] hover:bg-[#6f1d32]/8" aria-label={`Sửa ${table.tableName}`}><Pencil className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-5 grid gap-2 text-sm text-[#625a55]">
                    <p className="flex items-center gap-2"><Users className="h-4 w-4" /> {table.capacity} khách</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {table.location || 'Chưa phân khu'}</p>
                    <p>{table.reservationsCount ? `${table.reservationsCount} lượt đặt sắp tới` : 'Chưa có lượt đặt sắp tới'}</p>
                  </div>
                  {canToggleMaintenance && (
                    <Button size="sm" variant={table.status === 'MAINTENANCE' ? 'primary' : 'ghost'} icon={Wrench} className="mt-5 self-start" onClick={() => toggleMaintenance(table)}>
                      {table.status === 'MAINTENANCE' ? 'Kết thúc bảo trì' : 'Bảo trì'}
                    </Button>
                  )}
                </article>
              )
            })}
          </div>
        </AdminDataState>
      </div>

      {editor !== undefined && <TableEditorModal key={editor?.tableId || 'new'} table={editor} saving={saving} onClose={() => !saving && setEditor(undefined)} onSave={save} />}
      {dialog && <ConfirmDialog key={dialog.title} isOpen {...dialog} onClose={() => setDialog(null)} />}
    </div>
  )
}

export default AdminTablesPage
