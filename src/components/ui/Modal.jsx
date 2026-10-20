import { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * Base Modal component
 * Hỗ trợ đóng mở, bấm phím Escape, click backdrop, và cuộn nội dung mượt mà
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#211b18]/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full ${maxWidth} bg-[#fffdf8] border border-[var(--moc-line)] shadow-[var(--moc-shadow)] overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--moc-line)] bg-[#f5f0e7]/80">
          <h3 className="moc-serif text-xl font-medium text-[#211b18]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#766e68] hover:text-[#6f1d32] transition-colors p-1.5 rounded-full hover:bg-[#6f1d32]/7 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

export default Modal
