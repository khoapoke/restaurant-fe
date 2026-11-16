import { useState } from 'react'
import { Calendar, RefreshCw, Filter } from 'lucide-react'
import Button from '../../../../components/ui/Button'

/**
 * Thanh Bộ Lọc Thời Gian Dashboard (DashboardFilterBar)
 * - 100% Centralized Design Tokens
 * - Hỗ trợ presets: Hôm nay, 7 ngày qua, Tháng này, Tùy chỉnh
 * - Độ dài < 110 dòng
 */
export const DashboardFilterBar = ({
  fromDate,
  toDate,
  onDateChange,
  onRefresh,
  loading,
}) => {
  const [activePreset, setActivePreset] = useState('7days')

  const getTodayStr = () => new Date().toISOString().split('T')[0]

  const getDateNDaysAgoStr = (days) => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString().split('T')[0]
  }

  const getFirstDayOfMonthStr = () => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  }

  const applyPreset = (presetKey) => {
    setActivePreset(presetKey)
    const today = getTodayStr()
    if (presetKey === 'today') {
      onDateChange(today, today)
    } else if (presetKey === '7days') {
      onDateChange(getDateNDaysAgoStr(6), today)
    } else if (presetKey === 'month') {
      onDateChange(getFirstDayOfMonthStr(), today)
    }
  }

  const handleCustomDateChange = (field, value) => {
    setActivePreset('custom')
    if (field === 'from') {
      onDateChange(value, toDate)
    } else {
      onDateChange(fromDate, value)
    }
  }

  return (
    <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle flex flex-wrap items-center justify-between gap-4">
      {/* Preset Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-text-muted mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-brand-primary" />
          <span className="hidden sm:inline">Khoảng thời gian:</span>
        </span>
        {[
          { key: 'today', label: 'Hôm nay' },
          { key: '7days', label: '7 ngày qua' },
          { key: 'month', label: 'Tháng này' },
        ].map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => applyPreset(p.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activePreset === p.key
                ? 'bg-brand-primary text-surface-bg shadow-md shadow-brand-primary/20'
                : 'bg-surface-bg text-text-muted hover:text-text-main border border-border-subtle hover:border-border-strong'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Pickers & Refresh Button */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-1.5 bg-surface-bg px-3 py-1.5 rounded-xl border border-border-subtle text-xs">
          <Calendar className="w-3.5 h-3.5 text-text-muted" />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => handleCustomDateChange('from', e.target.value)}
            className="bg-transparent text-text-main focus:outline-none cursor-pointer"
          />
          <span className="text-text-dim">→</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => handleCustomDateChange('to', e.target.value)}
            className="bg-transparent text-text-main focus:outline-none cursor-pointer"
          />
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          isLoading={loading}
          onClick={onRefresh}
          title="Tải lại dữ liệu"
        >
          <span className="hidden sm:inline">Làm mới</span>
        </Button>
      </div>
    </div>
  )
}

export default DashboardFilterBar
