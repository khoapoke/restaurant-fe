import { User, ShieldAlert, MapPin, Award } from 'lucide-react'

const TABS = [
  { key: 'info', label: 'Thông tin cá nhân', icon: User },
  { key: 'allergies', label: 'Dị ứng & Dinh dưỡng', icon: ShieldAlert },
  { key: 'addresses', label: 'Sổ địa chỉ nhận hàng', icon: MapPin },
]

/**
 * Thẻ Tổng Quan Hồ Sơ Khách Hàng (ProfileOverviewCard)
 * - Sidebar bên trái hiển thị avatar monogram, thông tin & điều hướng tab
 * - Đồng bộ Centralized Design Tokens
 * - Độ dài < 110 dòng
 */
export default function ProfileOverviewCard({
  formData = {},
  activeTab = 'info',
  onSelectTab,
  allergiesCount = 0,
  addressesCount = 0,
}) {
  const displayName = formData.fullName || formData.username || 'Khách hàng'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U'

  return (
    <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-6 shadow-sm">
      {/* Monogram Avatar & Thông tin cơ bản */}
      <div className="flex flex-col items-center text-center space-y-3 pb-5 border-b border-border-subtle">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-brand-primary/10 border-2 border-brand-primary/40 flex items-center justify-center text-brand-primary font-serif font-bold text-2xl shadow-lg shadow-brand-primary/10">
            {initial}
          </div>
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-status-success border-2 border-surface-card" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-serif font-bold text-text-main truncate max-w-[200px]">
            {displayName}
          </h2>
          <p className="text-xs text-brand-primary font-mono">@{formData.username || 'customer'}</p>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <Award className="w-3 h-3" />
            <span>Thành viên Gourmet</span>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-2 gap-2 w-full pt-2">
          <div className="p-2 rounded-xl bg-surface-bg border border-border-subtle text-center">
            <span className="text-[10px] text-text-muted block">Cảnh báo dị ứng</span>
            <span className="text-sm font-bold text-brand-primary font-mono">{allergiesCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-surface-bg border border-border-subtle text-center">
            <span className="text-[10px] text-text-muted block">Địa chỉ đã lưu</span>
            <span className="text-sm font-bold text-text-main font-mono">{addressesCount}</span>
          </div>
        </div>
      </div>

      {/* Menu chuyển Tab dọc */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2 block mb-2">
          Danh mục hồ sơ
        </span>
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isSelected = activeTab === tab.key
          const badgeCount = tab.key === 'allergies' ? allergiesCount : tab.key === 'addresses' ? addressesCount : 0

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectTab(tab.key)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-brand-primary/10 border-brand-primary text-brand-primary ring-1 ring-brand-primary/30 shadow-sm'
                  : 'bg-transparent border-transparent text-text-muted hover:text-text-main hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-primary' : 'text-text-muted'}`} />
                <span>{tab.label}</span>
              </div>
              {badgeCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono leading-tight ${
                    isSelected
                      ? 'bg-brand-primary text-surface-bg font-bold'
                      : 'bg-surface-bg text-text-muted border border-border-subtle'
                  }`}
                >
                  {badgeCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

