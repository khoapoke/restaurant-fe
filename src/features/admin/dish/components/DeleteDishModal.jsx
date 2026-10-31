import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { AlertTriangle, Trash2 } from 'lucide-react'

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
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h4 className="text-sm font-bold text-white mb-1">
            Xóa món "{dishName}"?
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Hệ thống sẽ thực hiện xóa mềm (ẩn món khỏi thực đơn). Dữ liệu trong các đơn hàng đã đặt trước đây vẫn được lưu trữ nguyên vẹn.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-800">
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

