import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Bottom sheet cho mobile (trên màn hình lớn hiển thị như hộp thoại giữa màn hình).
 */
export const BottomSheet = ({ open, onClose, title, subtitle, children, footer, labelledBy = 'dine-sheet-title' }) => {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKey)
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Đóng" className="absolute inset-0 bg-[#211b18]/60 backdrop-blur-[2px] moc-fade-in" onClick={onClose} />
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="moc-sheet relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-[28px] bg-[#fffdf8] shadow-[0_-18px_60px_rgba(33,27,24,0.28)] outline-none sm:rounded-[28px]"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#d8cdbf] sm:hidden" aria-hidden="true" />
        <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-4 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <h2 id={labelledBy} className="moc-serif text-2xl font-medium leading-tight text-[#211b18]">{title}</h2>
            {subtitle && <p className="mt-1 text-sm leading-5 text-[#625a55]">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f1e9de] text-[#211b18] hover:bg-[#e8ddcf]">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">{children}</div>
        {footer && <footer className="border-t border-[var(--moc-line)] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">{footer}</footer>}
      </section>
    </div>
  )
}

export default BottomSheet
