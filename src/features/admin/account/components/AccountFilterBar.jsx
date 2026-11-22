import { Search, RefreshCw, Filter } from 'lucide-react'
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
    <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle space-y-3 shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo username, họ tên, email hoặc số điện thoại..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-surface-input border border-border-subtle rounded-xl text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors"
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
      <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-border-subtle text-xs">
        <span className="text-text-muted flex items-center gap-1.5 font-medium">
          <Filter className="w-3.5 h-3.5 text-brand-primary" />
          <span>Lọc:</span>
        </span>

        {/* Trạng thái selector */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-surface-input border border-border-subtle rounded-xl px-2.5 py-1.5 text-xs text-text-body focus:outline-none focus:border-brand-primary cursor-pointer"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value={AccountStatus.ACTIVE}>Đang hoạt động</option>
          <option value={AccountStatus.LOCKED}>Đã bị khóa</option>
        </select>

        {/* Vai trò selector */}
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          className="bg-surface-input border border-border-subtle rounded-xl px-2.5 py-1.5 text-xs text-text-body focus:outline-none focus:border-brand-primary cursor-pointer"
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value={Role.ADMIN}>Quản trị viên (ADMIN)</option>
          <option value={Role.STAFF}>Nhân viên (STAFF)</option>
          <option value={Role.CUSTOMER}>Khách hàng (CUSTOMER)</option>
        </select>
      </div>
    </div>
  )
}

export default AccountFilterBar
