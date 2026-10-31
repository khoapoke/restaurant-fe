import { Search, RefreshCw, Filter, Shield, User } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import { AccountStatus, Role } from '../constants'

export const AccountFilterBar = ({
  keyword,
  onKeywordChange,
  statusFilter,
  onStatusChange,
  roleFilter,
  onRoleChange,
  onRefresh,
  loading,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo username, họ tên, email hoặc số điện thoại..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-950 border border-gray-800 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Refresh button */}
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          isLoading={loading}
          onClick={onRefresh}
          title="Làm mới danh sách"
        >
          Làm mới
        </Button>
      </div>

      {/* Filter selectors row */}
      <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-gray-800/60 text-xs">
        <span className="text-gray-500 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-amber-500" />
          <span>Lọc:</span>
        </span>

        {/* Trạng thái selector */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value={AccountStatus.ACTIVE}>Đang hoạt động</option>
          <option value={AccountStatus.LOCKED}>Đã bị khóa</option>
        </select>

        {/* Vai trò selector */}
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          className="bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value={Role.ADMIN}>Quản trị viên (ADMIN)</option>
          <option value={Role.CUSTOMER}>Khách hàng (CUSTOMER)</option>
        </select>
      </div>
    </div>
  )
}

export default AccountFilterBar

