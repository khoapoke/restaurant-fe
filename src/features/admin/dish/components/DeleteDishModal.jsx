import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { AlertTriangle, Trash2 } from 'lucide-react'

/**
 * Modal Xác Nhận Xóa Món Ăn (DeleteDishModal)
 * - 100% Centralized Design Tokens
 * - Độ dài < 55 dòng
 */
export const DeleteDishModal = ({
  isOpen,
  onClose,
  onConfirm,
  dish,
  isDeleting,
}) => {
  if (!dish) return null

  const dishName = dish.dishName || dish.ten_mon_an || 'này'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa món ăn"
      maxWidth="max-w-sm"
    >
      <div className="space-y-4 text-center py-2">
        <div className="w-12 h-12 rounded-full bg-status-error/10 border border-status-error/20 text-status-error flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h4 className="text-sm font-bold text-text-main mb-1">
            Xóa món "{dishName}"?
          </h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Hệ thống sẽ thực hiện xóa mềm (ẩn món khỏi thực đơn). Dữ liệu trong các đơn hàng đã đặt trước đây vẫn được lưu trữ nguyên vẹn.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border-subtle">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>
            Hủy
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
            icon={Trash2}
          >
            Đồng ý xóa
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteDishModal
