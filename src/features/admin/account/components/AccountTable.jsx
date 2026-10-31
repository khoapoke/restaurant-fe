import { Lock, Unlock, Shield, User, AlertCircle } from 'lucide-react'
import { ACCOUNT_STATUS_CONFIG, ROLE_CONFIG } from '../constants'
import Button from '../../../../components/ui/Button'
import { useAuth } from '../../../../contexts/AuthContext'

export const AccountTable = ({ accounts = [], onToggleLock }) => {
  const { user: currentUser } = useAuth()

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-[10px] uppercase tracking-wider bg-gray-950/40">
            <th className="py-3 px-4 font-semibold w-16 text-center">ID</th>
            <th className="py-3 px-4 font-semibold">Tên đăng nhập</th>
            <th className="py-3 px-4 font-semibold">Họ tên & Email</th>
            <th className="py-3 px-4 font-semibold w-32">Số điện thoại</th>
            <th className="py-3 px-4 font-semibold text-center w-28">Vai trò</th>
            <th className="py-3 px-4 font-semibold text-center w-32">Trạng thái</th>
            <th className="py-3 px-4 font-semibold text-right w-28">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {accounts.map((acc) => {
            const id = acc.accountId || acc.ma_tai_khoan
            const username = acc.username || acc.ten_dang_nhap
            const fullName = acc.fullName || acc.ho_ten || acc.userProfile?.fullName || '—'
            const email = acc.email || '—'
            const phone = acc.phoneNumber || acc.so_dien_thoai || acc.userProfile?.phoneNumber || '—'
            const status = acc.status || acc.trang_thai || 'ACTIVE'
            const role = acc.role || (acc.ma_vai_tro === 1 ? 'ADMIN' : 'CUSTOMER')

            const isLocked = status === 'LOCKED'
            const isSelf =
              currentUser?.username === username ||
              (currentUser?.accountId && currentUser.accountId === id)

            const statusCfg = ACCOUNT_STATUS_CONFIG[status] || ACCOUNT_STATUS_CONFIG.ACTIVE
            const roleCfg = ROLE_CONFIG[role] || ROLE_CONFIG.CUSTOMER

            return (
              <tr key={id} className="hover:bg-gray-800/30 transition-colors">
                <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-400">
                  #{id}
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{username}</span>
                    {isSelf && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                        Bạn
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-semibold text-gray-200">{fullName}</p>
                  <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{email}</p>
                </td>

                <td className="py-3.5 px-4 font-mono text-gray-300">
                  {phone}
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${roleCfg.color}`}
                  >
                    {role === 'ADMIN' ? (
                      <Shield className="w-3 h-3" />
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
                      className="text-[11px] text-gray-600 italic cursor-not-allowed"
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

