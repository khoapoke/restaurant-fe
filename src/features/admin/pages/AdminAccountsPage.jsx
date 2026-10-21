import { useCallback, useEffect, useState } from 'react'
import { LockKeyhole, Search, ShieldCheck, UnlockKeyhole } from 'lucide-react'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import FeedbackBanner from '../../../components/ui/FeedbackBanner'
import Input from '../../../components/ui/Input'
import Pagination from '../../../components/ui/Pagination'
import { useAuth } from '../../../contexts/AuthContext'
import { useApiResource } from '../../../lib/useApiResource'
import AdminDataState from '../components/AdminDataState'
import { getAccountsApi, lockAccountApi, unlockAccountApi } from '../services/adminService'

const ROLE_FILTERS = [
  { value: '', label: 'Mọi vai trò' },
  { value: '1', label: 'Quản trị viên' },
  { value: '2', label: 'Nhân viên' },
  { value: '3', label: 'Khách hàng' },
]

const selectClass = 'min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm text-[#211b18] outline-none focus:border-[#6f1d32]'

export const AdminAccountsPage = () => {
  const { user } = useAuth()
  const [keywordInput, setKeywordInput] = useState('')
  const [filters, setFilters] = useState({ keyword: '', status: '', roleId: '', page: 1 })
  const [feedback, setFeedback] = useState(null)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) => (current.keyword === keywordInput.trim() ? current : { ...current, keyword: keywordInput.trim(), page: 1 }))
    }, 350)
    return () => window.clearTimeout(timer)
  }, [keywordInput])

  const loader = useCallback(() => getAccountsApi({
    keyword: filters.keyword || undefined,
    status: filters.status || undefined,
    roleId: filters.roleId || undefined,
    page: filters.page,
    perPage: 15,
  }).then((response) => response.data), [filters])
  const { data, loading, refreshing, error, reload } = useApiResource(loader, { fallbackError: 'Không thể tải danh sách tài khoản.' })
  const accounts = data?.items || []
  const pagination = data?.pagination
  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value, page: 1 }))

  const toggleStatus = (account) => {
    const locking = account.status === 'ACTIVE'
    setDialog({
      title: locking ? `Khóa tài khoản ${account.username}` : `Mở khóa ${account.username}`,
      tone: locking ? 'danger' : 'primary',
      description: locking
        ? 'Người dùng sẽ bị đăng xuất khỏi mọi thiết bị ngay lập tức và không thể đăng nhập cho đến khi được mở khóa.'
        : 'Người dùng có thể đăng nhập và sử dụng hệ thống trở lại.',
      confirmLabel: locking ? 'Khóa tài khoản' : 'Mở khóa',
      onConfirm: async () => {
        if (locking) await lockAccountApi(account.accountId)
        else await unlockAccountApi(account.accountId)
        setFeedback({ tone: 'success', message: locking ? `Đã khóa ${account.username} và thu hồi phiên đăng nhập.` : `Đã mở khóa ${account.username}.` })
        reload({ quiet: true })
      },
    })
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <header><span className="moc-eyebrow">QUẢN TRỊ TRUY CẬP</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Tài khoản</h1><p className="mt-3 text-sm text-[#625a55]">Tra cứu người dùng, kiểm soát trạng thái và thu hồi phiên đăng nhập khi cần.</p></header>
      <section className="mt-8 moc-panel p-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <Input value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="Tên, email, số điện thoại..." icon={Search} aria-label="Tìm tài khoản" />
        <select value={filters.roleId} onChange={(event) => updateFilter('roleId', event.target.value)} className={selectClass} aria-label="Lọc vai trò">
          {ROLE_FILTERS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className={selectClass} aria-label="Lọc trạng thái"><option value="">Mọi trạng thái</option><option value="ACTIVE">Đang hoạt động</option><option value="LOCKED">Đã khóa</option></select>
      </section>
      <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} className="mt-4" />

      <div className="mt-5">
        <AdminDataState loading={loading} error={error} onRetry={() => reload()} empty={!accounts.length} emptyMessage="Không tìm thấy tài khoản phù hợp.">
          <div className="moc-panel overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#eee6dc]"><tr>{['Tài khoản', 'Họ tên', 'Liên hệ', 'Vai trò', 'Trạng thái', 'Thao tác'].map((label) => <th key={label} scope="col" className="px-5 py-4 text-xs font-bold tracking-[0.08em] uppercase text-[#625a55]">{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-[var(--moc-line)]">
                {accounts.map((account) => {
                  const isSelf = Number(account.accountId) === Number(user?.accountId)
                  return (
                    <tr key={account.accountId} className="bg-[#fffdf8] hover:bg-white">
                      <td className="px-5 py-4 font-semibold">{account.username}{isSelf && <span className="ml-2 text-xs font-normal text-[#625a55]">(bạn)</span>}</td>
                      <td className="px-5 py-4">{account.fullName || '—'}</td>
                      <td className="px-5 py-4"><p>{account.email || '—'}</p><p className="mt-1 text-xs text-[#625a55]">{account.phoneNumber || 'Chưa có SĐT'}</p></td>
                      <td className="px-5 py-4">{account.roleName}</td>
                      <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-1 text-xs font-bold ${account.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-800'}`}>{account.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</span></td>
                      <td className="px-5 py-4">
                        {isSelf
                          ? <span className="text-xs text-[#625a55]">Tài khoản đang đăng nhập</span>
                          : <Button size="sm" variant={account.status === 'ACTIVE' ? 'outline' : 'primary'} icon={account.status === 'ACTIVE' ? LockKeyhole : UnlockKeyhole} onClick={() => toggleStatus(account)}>{account.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}</Button>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {pagination && <Pagination currentPage={pagination.currentPage} lastPage={pagination.totalPages} totalItems={pagination.totalItems} itemLabel="tài khoản" onPageChange={(page) => setFilters((current) => ({ ...current, page }))} disabled={refreshing} className="mt-2" />}
        </AdminDataState>
      </div>
      <p className="mt-5 flex items-center gap-2 text-sm text-[#625a55]"><ShieldCheck className="h-4 w-4 text-[#6f1d32]" /> Mật khẩu không bao giờ được trả về từ API quản trị.</p>

      {dialog && <ConfirmDialog key={dialog.title} isOpen {...dialog} onClose={() => setDialog(null)} />}
    </div>
  )
}

export default AdminAccountsPage
