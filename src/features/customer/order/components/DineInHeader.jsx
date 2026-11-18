import { Utensils, ClipboardList, CheckCircle2 } from 'lucide-react'

/**
 * Header & Thanh điều hướng cho trang Gọi món tại bàn (Dine-in)
 * - Hiển thị Brand T-ResMK & Tên bàn
 * - Tab chuyển đổi Gọi món / Tiến độ kèm badge số lượng
 * - Toast thông báo khi gửi bếp thành công
 */
export default function DineInHeader({
  tableName,
  activeTab,
  onTabChange,
  orderedItemsCount,
  successToast,
}) {
  return (
    <>
      <header className="sticky top-0 z-30 bg-surface-card/95 backdrop-blur-md border-b border-border-subtle px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-surface-bg font-black text-sm">
              T
            </div>
            <div>
              <span className="text-xs font-bold text-text-main tracking-wide">T-ResMK</span>
              <span className="text-xs text-brand-primary font-semibold block">{tableName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-border-subtle">
            <button
              type="button"
              onClick={() => onTabChange('menu')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'menu'
                  ? 'bg-brand-primary text-surface-bg shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Gọi món</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('tracking')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'tracking'
                  ? 'bg-brand-primary text-surface-bg shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Tiến độ</span>
              {orderedItemsCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'tracking'
                      ? 'bg-surface-bg text-brand-primary'
                      : 'bg-brand-primary/20 text-brand-primary'
                  }`}
                >
                  {orderedItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {successToast && (
        <div className="bg-status-success/15 border-b border-status-success/30 px-4 py-2.5 text-center text-xs text-status-success font-semibold flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}
    </>
  )
}

