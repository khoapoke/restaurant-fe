/**
 * Thẻ Thống Kê Chỉ Số Dashboard (MetricCard)
 * - Đồng bộ 100% Centralized Design Tokens
 * - Phản hồi trạng thái màu sắc ngữ nghĩa (status-*)
 * - Độ dài < 80 dòng
 */
export const MetricCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  badgeText,
  badgeVariant = 'neutral',
  accentColor = 'brand',
}) => {
  const accentBorderMap = {
    brand: 'border-brand-primary/20 hover:border-brand-primary/40',
    emerald: 'border-status-success/20 hover:border-status-success/40',
    blue: 'border-status-info/20 hover:border-status-info/40',
    purple: 'border-border-strong hover:border-brand-primary/40',
  }

  const iconBgMap = {
    brand: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    emerald: 'bg-status-success/10 text-status-success border-status-success/20',
    blue: 'bg-status-info/10 text-status-info border-status-info/20',
    purple: 'bg-brand-subtle text-brand-primary border-brand-primary/20',
  }

  const badgeVariantMap = {
    neutral: 'bg-surface-elevated text-text-muted border border-border-strong',
    success: 'bg-status-success/15 text-status-success border border-status-success/30',
    warning: 'bg-status-warning/15 text-status-warning border border-status-warning/30',
    info: 'bg-status-info/15 text-status-info border border-status-info/30',
  }

  return (
    <div
      className={`p-5 rounded-2xl bg-surface-card border ${
        accentBorderMap[accentColor] || accentBorderMap.brand
      } transition-all duration-200 hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
              iconBgMap[accentColor] || iconBgMap.brand
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-extrabold text-text-main tracking-tight font-mono">
          {value}
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="text-text-muted truncate mr-2">{subValue}</span>
          {badgeText && (
            <span
              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold shrink-0 ${
                badgeVariantMap[badgeVariant] || badgeVariantMap.neutral
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MetricCard
