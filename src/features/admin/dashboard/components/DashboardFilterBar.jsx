import { useState } from 'react'
import { Calendar, RefreshCw, Filter } from 'lucide-react'
import Button from '../../../../components/ui/Button'

export const DashboardFilterBar = ({
  fromDate,
  toDate,
  onDateChange,
  onRefresh,
  loading,
}) => {
  const [activePreset, setActivePreset] = useState('7days')

  const getTodayStr = () => {
    return new Date().toISOString().split('T')[0]
  }

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
    <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 flex flex-wrap items-center justify-between gap-4">
      {/* Preset Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-gray-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-amber-500" />
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
                ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Pickers & Refresh Button */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-1.5 bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-800 text-xs">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => handleCustomDateChange('from', e.target.value)}
            className="bg-transparent text-gray-200 focus:outline-none cursor-pointer"
          />
          <span className="text-gray-500">→</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => handleCustomDateChange('to', e.target.value)}
            className="bg-transparent text-gray-200 focus:outline-none cursor-pointer"
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

