import { useCallback, useEffect, useState } from 'react'
import { LockKeyhole, Search, ShieldCheck, UnlockKeyhole } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import AdminDataState from '../components/AdminDataState'
import { getAccountsApi, lockAccountApi, unlockAccountApi } from '../services/adminService'

export const AdminAccountsPage = () => {
  const [accounts, setAccounts] = useState([])
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [pendingId, setPendingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setAccounts((await getAccountsApi({ keyword: keyword || undefined, status: status || undefined, perPage: 50 })).data.items || []) }
    catch (err) { setError(err.response?.data?.message || 'Không thể tải danh sách tài khoản.') }
    finally { setLoading(false) }
  }, [keyword, status])

  useEffect(() => {
    let active = true
    getAccountsApi({ keyword: keyword || undefined, status: status || undefined, perPage: 50 })
      .then((response) => { if (active) setAccounts(response.data.items || []) })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Không thể tải danh sách tài khoản.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [keyword, status])

  const toggleStatus = async (account) => {
    const locking = account.status === 'ACTIVE'
    if (locking && !window.confirm(`Khóa tài khoản ${account.username}? Người dùng sẽ bị đăng xuất ngay.`)) return
    setPendingId(account.accountId); setNotice(null)
    try {
      const response = locking ? await lockAccountApi(account.accountId) : await unlockAccountApi(account.accountId)
      setNotice(response.message); await load()
    } catch (err) { setNotice(err.response?.data?.message || 'Không thể cập nhật tài khoản.') }
    finally { setPendingId(null) }
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <header><span className="moc-eyebrow">QUẢN TRỊ TRUY CẬP</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Tài khoản</h1><p className="mt-3 text-sm text-[#625a55]">Tra cứu người dùng, kiểm soát trạng thái và thu hồi phiên đăng nhập khi cần.</p></header>
      <section className="mt-8 moc-panel p-4 sm:p-5 flex flex-col md:flex-row gap-3">
        <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tên, email, số điện thoại..." icon={Search} />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm outline-none focus:border-[#6f1d32]"><option value="">Mọi trạng thái</option><option value="ACTIVE">Đang hoạt động</option><option value="LOCKED">Đã khóa</option></select>
      </section>
      {notice && <p className="mt-4 border border-[#6f1d32]/20 bg-[#6f1d32]/5 px-4 py-3 text-sm text-[#6f1d32]">{notice}</p>}

      <div className="mt-5"><AdminDataState loading={loading} error={error} onRetry={load} empty={!accounts.length}>
        <div className="moc-panel overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#eee6dc]"><tr>{['Tài khoản', 'Họ tên', 'Liên hệ', 'Vai trò', 'Trạng thái', 'Thao tác'].map((label) => <th key={label} className="px-5 py-4 text-xs tracking-[0.08em] uppercase text-[#625a55]">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-[var(--moc-line)]">{accounts.map((account) => <tr key={account.accountId} className="bg-[#fffdf8] hover:bg-white"><td className="px-5 py-4 font-semibold">{account.username}</td><td className="px-5 py-4">{account.fullName || '—'}</td><td className="px-5 py-4"><p>{account.email || '—'}</p><p className="mt-1 text-xs text-[#625a55]">{account.phoneNumber || 'Chưa có SĐT'}</p></td><td className="px-5 py-4">{account.roleName}</td><td className="px-5 py-4"><span className={`inline-flex px-2.5 py-1 text-xs font-bold ${account.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{account.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</span></td><td className="px-5 py-4"><Button size="sm" variant={account.status === 'ACTIVE' ? 'danger' : 'outline'} icon={account.status === 'ACTIVE' ? LockKeyhole : UnlockKeyhole} isLoading={pendingId === account.accountId} onClick={() => toggleStatus(account)}>{account.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}</Button></td></tr>)}</tbody>
          </table>
        </div>
      </AdminDataState></div>
      <p className="mt-5 flex items-center gap-2 text-xs text-[#625a55]"><ShieldCheck className="h-4 w-4 text-[#6f1d32]" /> Mật khẩu không bao giờ được trả về từ API quản trị.</p>
    </div>
  )
}

export default AdminAccountsPage
