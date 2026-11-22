import { Lock, Unlock, Shield, User, Briefcase } from 'lucide-react'
import { ACCOUNT_STATUS_CONFIG, ROLE_CONFIG, resolveAccountRole } from '../constants'
import Button from '../../../../components/ui/Button'
import { useAuth } from '../../../../contexts/AuthContext'

export const AccountTable = ({ accounts = [], onToggleLock }) => {
  const { user: currentUser } = useAuth()

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface-card shadow-xs">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase tracking-wider bg-surface-elevated/80">
            <th className="py-3 px-4 font-semibold w-16 text-center">ID</th>
            <th className="py-3 px-4 font-semibold">Tên đăng nhập</th>
            <th className="py-3 px-4 font-semibold">Họ tên & Email</th>
            <th className="py-3 px-4 font-semibold w-32">Số điện thoại</th>
            <th className="py-3 px-4 font-semibold text-center w-28">Vai trò</th>
            <th className="py-3 px-4 font-semibold text-center w-32">Trạng thái</th>
            <th className="py-3 px-4 font-semibold text-right w-28">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {accounts.map((acc) => {
            const id = acc.accountId || acc.ma_tai_khoan
            const username = acc.username || acc.ten_dang_nhap
            const fullName = acc.fullName || acc.ho_ten || acc.userProfile?.fullName || '—'
            const email = acc.email || '—'
            const phone = acc.phoneNumber || acc.so_dien_thoai || acc.userProfile?.phoneNumber || '—'
            const status = acc.status || acc.trang_thai || 'ACTIVE'
            const role = resolveAccountRole(acc)

            const isLocked = status === 'LOCKED'
            const isSelf =
              currentUser?.username === username ||
              (currentUser?.accountId && currentUser.accountId === id)

            const statusCfg = ACCOUNT_STATUS_CONFIG[status] || ACCOUNT_STATUS_CONFIG.ACTIVE
            const roleCfg = ROLE_CONFIG[role] || ROLE_CONFIG.CUSTOMER

            return (
              <tr key={id} className="hover:bg-surface-card-hover/40 transition-colors">
                <td className="py-3.5 px-4 text-center font-mono font-bold text-text-muted">
                  #{id}
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-main font-mono">{username}</span>
                    {isSelf && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-brand-primary/10 text-brand-primary font-bold border border-brand-primary/20">
                        Bạn
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-semibold text-text-main">{fullName}</p>
                  <p className="text-[11px] text-text-muted truncate max-w-[180px]">{email}</p>
                </td>

                <td className="py-3.5 px-4 font-mono text-text-body">
                  {phone}
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${roleCfg.color}`}
                  >
                    {role === 'ADMIN' ? (
                      <Shield className="w-3 h-3" />
                    ) : role === 'STAFF' ? (
                      <Briefcase className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    <span>{roleCfg.label}</span>
                  </span>
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                    {statusCfg.label}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  {isSelf ? (
                    <span
                      className="text-[11px] text-text-muted/60 italic cursor-not-allowed"
                      title="Không thể tự khóa tài khoản của chính mình"
                    >
                      Bảo vệ
                    </span>
                  ) : (
                    <Button
                      variant={isLocked ? 'outline' : 'danger'}
                      size="sm"
                      onClick={() => onToggleLock(acc)}
                      className="text-[11px] py-1 px-2.5"
                      icon={isLocked ? Unlock : Lock}
                    >
                      {isLocked ? 'Mở khóa' : 'Khóa'}
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AccountTable
