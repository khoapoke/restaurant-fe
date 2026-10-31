import { useState } from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'

export const RevenueChart = ({ dailySeries = [], totalRevenue = 0 }) => {
  const [hoveredItem, setHoveredItem] = useState(null)

  const maxAmount = Math.max(...dailySeries.map((d) => Number(d.amount || 0)), 1)

  const formatCurrency = (val) => {
    return `${Number(val || 0).toLocaleString('vi-VN')} đ`
  }

  const formatShortDate = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`
    }
    return dateStr
  }

  return (
    <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Xu hướng Doanh thu</h3>
            <p className="text-[10px] text-gray-400">Theo chuỗi ngày đã thanh toán</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-400 block uppercase">Tổng giai đoạn</span>
          <span className="text-base font-bold text-amber-400 font-mono">
            {formatCurrency(totalRevenue)}
          </span>
        </div>
      </div>

      {/* Chart Area */}
      {dailySeries.length === 0 ? (
        <div className="py-14 flex flex-col items-center justify-center text-center text-gray-500 space-y-2">
          <BarChart3 className="w-8 h-8 text-gray-600" />
          <p className="text-xs">Không có dữ liệu doanh thu trong khoảng thời gian này</p>
        </div>
      ) : (
        <div className="space-y-2 pt-4">
          {/* Tooltip info display */}
          <div className="h-6 flex items-center justify-end text-xs font-mono">
            {hoveredItem ? (
              <span className="text-amber-300 bg-gray-950 px-2.5 py-0.5 rounded-lg border border-gray-800 animate-in fade-in duration-150">
                {hoveredItem.date}: <strong className="text-white">{formatCurrency(hoveredItem.amount)}</strong>
              </span>
            ) : (
              <span className="text-[11px] text-gray-500 italic">Rê chuột vào cột để xem chi tiết</span>
            )}
          </div>

          {/* Bar Columns Container */}
          <div className="h-44 flex items-end gap-2 pt-6 pb-2 border-b border-gray-800 px-2 overflow-x-auto">
            {dailySeries.map((item, idx) => {
              const amount = Number(item.amount || 0)
              const percent = Math.round((amount / maxAmount) * 100)
              const isHovered = hoveredItem?.date === item.date

              return (
                <div
                  key={idx}
                  className="flex-1 min-w-[28px] max-w-[48px] h-full flex flex-col items-center justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Visual Bar */}
                  <div className="w-full flex justify-center items-end h-full">
                    <div
                      style={{ height: `${Math.max(percent, 4)}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isHovered
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-500/30'
                          : amount > 0
                          ? 'bg-amber-500/70 hover:bg-amber-400'
                          : 'bg-gray-800/60'
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* X-axis Labels */}
          <div className="flex items-center gap-2 px-2 overflow-x-hidden">
            {dailySeries.map((item, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[28px] max-w-[48px] text-center text-[10px] font-mono text-gray-400 truncate"
              >
                {formatShortDate(item.date)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RevenueChart

