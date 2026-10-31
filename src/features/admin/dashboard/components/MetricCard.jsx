export const MetricCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  badgeText,
  badgeVariant = 'neutral',
  accentColor = 'amber',
}) => {
  const accentBorderMap = {
    amber: 'border-amber-500/20 hover:border-amber-500/40',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40',
    blue: 'border-blue-500/20 hover:border-blue-500/40',
    purple: 'border-purple-500/20 hover:border-purple-500/40',
  }

  const iconBgMap = {
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }

  const badgeVariantMap = {
    neutral: 'bg-gray-800 text-gray-300',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    info: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  }

  return (
    <div
      className={`p-5 rounded-2xl bg-gray-900/60 border ${
        accentBorderMap[accentColor] || accentBorderMap.amber
      } transition-all duration-200 hover:shadow-lg hover:shadow-black/40 flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
              iconBgMap[accentColor] || iconBgMap.amber
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="text-gray-400">{subValue}</span>
          {badgeText && (
            <span
              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
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

