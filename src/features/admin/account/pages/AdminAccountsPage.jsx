import { useState, useEffect, useCallback } from 'react'
import { Users, RefreshCw } from 'lucide-react'
import {
  getAdminAccountsApi,
  lockAccountApi,
  unlockAccountApi,
} from '../services/adminAccountService'
import AccountFilterBar from '../components/AccountFilterBar'
import AccountTable from '../components/AccountTable'
import ToggleLockAccountModal from '../components/ToggleLockAccountModal'
import Pagination from '../../../../components/ui/Pagination'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'

export const AdminAccountsPage = () => {
  const [accounts, setAccounts] = useState([])
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
    lastPage: 1,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState(null)

  // Modal lock/unlock
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [isLocking, setIsLocking] = useState(false)

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 3000)
  }

  const fetchAccounts = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError(null)
      try {
        const params = {
          page,
          perPage: 10,
        }
        if (keyword.trim()) params.keyword = keyword.trim()
        if (statusFilter !== 'ALL') params.status = statusFilter
        if (roleFilter !== 'ALL') params.role = roleFilter

        const res = await getAdminAccountsApi(params)
        const items = res.data?.items || res.data || []
        
        // Client-side fallback filter if BE doesn't support role param
        let filteredItems = Array.isArray(items) ? items : []
        if (roleFilter !== 'ALL') {
          filteredItems = filteredItems.filter((acc) => {
            const role = acc.role || (acc.ma_vai_tro === 1 ? 'ADMIN' : 'CUSTOMER')
            return role === roleFilter
          })
        }

        setAccounts(filteredItems)

        if (res.data?.pagination) {
          setPagination(res.data.pagination)
        } else {
          setPagination({
            currentPage: page,
            perPage: 10,
            totalItems: filteredItems.length,
            lastPage: Math.ceil(filteredItems.length / 10) || 1,
          })
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách tài khoản.')
      } finally {
        setLoading(false)
      }
    },
    [keyword, statusFilter, roleFilter]
  )

  useEffect(() => {
    fetchAccounts(1)
  }, [fetchAccounts])

  const handleToggleLockConfirm = async (accountId, isCurrentlyLocked) => {
    setIsLocking(true)
    try {
      if (isCurrentlyLocked) {
        await unlockAccountApi(accountId)
        showToast('Mở khóa tài khoản thành công!')
      } else {
        await lockAccountApi(accountId)
        showToast('Đã khóa tài khoản và thu hồi token thành công!')
      }
      setSelectedAccount(null)
      fetchAccounts(pagination.currentPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản.')
    } finally {
      setIsLocking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Quản lý Tài khoản Người dùng</h2>
            <p className="text-xs text-gray-400">
              Kiểm soát quyền truy cập và khóa các tài khoản vi phạm chính sách
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <AccountFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        onRefresh={() => fetchAccounts(pagination.currentPage)}
        loading={loading}
      />

      {successToast && (
        <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          action={
            <Button variant="outline" size="sm" onClick={() => fetchAccounts(1)}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* 4 Trạng thái UI */}
      {loading ? (
        <div className="space-y-3 p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
          <Skeleton className="h-8 w-full bg-gray-800" />
          <Skeleton className="h-14 w-full bg-gray-800" />
          <Skeleton className="h-14 w-full bg-gray-800" />
          <Skeleton className="h-14 w-full bg-gray-800" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-gray-900/40 border border-gray-800 space-y-3">
          <Users className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">Không tìm thấy tài khoản nào</p>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại bộ lọc vai trò / trạng thái.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AccountTable
            accounts={accounts}
            onToggleLock={(acc) => setSelectedAccount(acc)}
          />

          {pagination.lastPage > 1 && (
            <div className="flex justify-end pt-2">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.lastPage}
                onPageChange={(p) => fetchAccounts(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <ToggleLockAccountModal
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        onConfirm={handleToggleLockConfirm}
        account={selectedAccount}
        isLocking={isLocking}
      />
    </div>
  )
}

export default AdminAccountsPage

