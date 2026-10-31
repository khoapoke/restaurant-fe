import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { AlertTriangle, Trash2 } from 'lucide-react'

export const DeleteCategoryModal = ({
  isOpen,
  onClose,
  onConfirm,
  category,
  isDeleting,
}) => {
  if (!category) return null

  const categoryName = category.categoryName || category.ten_danh_muc || 'này'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa danh mục"
      maxWidth="max-w-sm"
    >
      <div className="space-y-4 text-center py-2">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h4 className="text-sm font-bold text-white mb-1">
            Xóa danh mục "{categoryName}"?
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Hệ thống sẽ thực hiện xóa mềm danh mục này. Các món ăn thuộc danh mục sẽ không bị mất dữ liệu.
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

export default DeleteCategoryModal

