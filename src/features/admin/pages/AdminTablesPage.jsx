import { useCallback, useEffect, useState } from 'react'
import { MapPin, Pencil, Plus, Users } from 'lucide-react'
import Button from '../../../components/ui/Button'
import AdminDataState from '../components/AdminDataState'
import TableEditorModal from '../components/TableEditorModal'
import { TABLE_STATUS_LABEL } from '../constants'
import { createTableApi, getAdminTablesApi, updateTableApi } from '../services/adminService'

const STATUS_STYLE = { AVAILABLE: 'bg-emerald-100 text-emerald-800', RESERVED: 'bg-amber-100 text-amber-800', OCCUPIED: 'bg-[#6f1d32] text-white', CLEANING: 'bg-sky-100 text-sky-800', MAINTENANCE: 'bg-red-100 text-red-800' }

export const AdminTablesPage = () => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editor, setEditor] = useState(undefined)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setTables((await getAdminTablesApi()).data.items || []) }
    catch (err) { setError(err.response?.data?.message || 'Không thể tải cấu hình bàn.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => {
    let active = true
    getAdminTablesApi()
      .then((response) => { if (active) setTables(response.data.items || []) })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Không thể tải cấu hình bàn.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const save = async (payload) => {
    setSaving(true)
    try { if (editor) await updateTableApi(editor.tableId, payload); else await createTableApi(payload); setEditor(undefined); setNotice('Đã lưu cấu hình bàn.'); await load() }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5"><div><span className="moc-eyebrow">SƠ ĐỒ NHÀ HÀNG</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Bàn ăn</h1><p className="mt-3 text-sm text-[#625a55]">Quản lý sức chứa, khu vực và trạng thái sẵn sàng của từng bàn.</p></div><Button icon={Plus} onClick={() => setEditor(null)}>Thêm bàn</Button></header>
      {notice && <p className="mt-5 border border-[#6f1d32]/20 bg-[#fffdf8] px-4 py-3 text-sm text-[#6f1d32]">{notice}</p>}
      <div className="mt-7"><AdminDataState loading={loading} error={error} onRetry={load} empty={!tables.length}>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{tables.map((table) => <article key={table.tableId} className="moc-panel p-5"><div className="flex items-start justify-between gap-4"><div><span className={`inline-flex px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[table.status] || 'bg-[#eee6dc]'}`}>{TABLE_STATUS_LABEL[table.status] || table.status}</span><h2 className="mt-4 moc-serif text-2xl">{table.tableName}</h2></div><button type="button" onClick={() => setEditor(table)} className="p-2 text-[#6f1d32] hover:bg-[#6f1d32]/8" aria-label={`Sửa ${table.tableName}`}><Pencil className="h-4 w-4" /></button></div><div className="mt-5 grid gap-2 text-sm text-[#625a55]"><p className="flex items-center gap-2"><Users className="h-4 w-4" /> {table.capacity} khách</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {table.location || 'Chưa phân khu'}</p><p>{table.reservationsCount} lượt đặt sắp tới</p></div></article>)}</div>
      </AdminDataState></div>
      {editor !== undefined && <TableEditorModal key={editor?.tableId || 'new'} table={editor} saving={saving} onClose={() => !saving && setEditor(undefined)} onSave={save} />}
    </div>
  )
}

export default AdminTablesPage
