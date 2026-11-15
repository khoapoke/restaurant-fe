import { Trash2 } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'

/**
 * Modal Xác Nhận Xóa Món Khỏi Giỏ Hàng
 * Độ dài < 60 dòng, chuẩn Design Tokens
 */
export default function DeleteCartItemModal({
  isOpen,
  item,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  if (!item) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa món"
      maxWidth="max-w-sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-text-muted leading-relaxed">
          Bạn có chắc chắn muốn bỏ món{' '}
          <strong className="text-brand-primary font-semibold">
            &ldquo;{item.dishName}&rdquo;
          </strong>{' '}
          khỏi giỏ hàng không?
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Giữ lại
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={onConfirm}
            loading={isDeleting}
          >
            Xóa món
          </Button>
        </div>
      </div>
    </Modal>
  )
}

