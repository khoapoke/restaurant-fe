import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { Lock, Unlock } from 'lucide-react'

export const ToggleLockAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
  account,
  isLocking,
}) => {
  if (!account) return null

  const id = account.accountId || account.ma_tai_khoan
  const username = account.username || account.ten_dang_nhap
  const isCurrentlyLocked = (account.status || account.trang_thai) === 'LOCKED'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCurrentlyLocked ? 'Mở khóa tài khoản' : 'Xác nhận khóa tài khoản'}
      maxWidth="max-w-sm"
    >
      <div className="space-y-4 text-center py-2">
        <div
          className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto ${
            isCurrentlyLocked
              ? 'bg-status-success/10 border-status-success/20 text-status-success'
              : 'bg-status-error/10 border-status-error/20 text-status-error'
          }`}
        >
          {isCurrentlyLocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>

        <div>
          <h4 className="text-sm font-bold text-text-main mb-1">
            {isCurrentlyLocked
              ? `Mở khóa tài khoản "${username}"?`
              : `Khóa tài khoản "${username}"?`}
          </h4>
          <p className="text-xs text-text-muted leading-relaxed">
            {isCurrentlyLocked
              ? 'Người dùng này sẽ có thể đăng nhập và tiếp tục sử dụng các dịch vụ của nhà hàng.'
              : 'Toàn bộ phiên đăng nhập hiện tại của người dùng này sẽ bị hủy ngay lập tức và tài khoản sẽ không thể đăng nhập.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-3 border-t border-border-subtle">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLocking}>
            Hủy
          </Button>
          <Button
            variant={isCurrentlyLocked ? 'primary' : 'danger'}
            size="sm"
            onClick={() => onConfirm(id, isCurrentlyLocked)}
            isLoading={isLocking}
            icon={isCurrentlyLocked ? Unlock : Lock}
          >
            {isCurrentlyLocked ? 'Mở khóa ngay' : 'Đồng ý Khóa'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ToggleLockAccountModal
