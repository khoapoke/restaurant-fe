import { Award, Utensils } from 'lucide-react'

/**
 * Bảng Món Ăn Bán Chạy Nhất (TopDishesTable)
 * - 100% Centralized Design Tokens
 * - Phân hạng huy hiệu vàng, bạc, đồng cho Top 3
 * - Độ dài < 95 dòng
 */
export const TopDishesTable = ({ dishes = [] }) => {
  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="w-6 h-6 rounded-lg bg-brand-primary text-surface-bg font-bold text-xs flex items-center justify-center shadow-md shadow-brand-primary/30">
          1
        </span>
      )
    }
    if (rank === 2) {
      return (
        <span className="w-6 h-6 rounded-lg bg-text-body text-surface-bg font-bold text-xs flex items-center justify-center">
          2
        </span>
      )
    }
    if (rank === 3) {
      return (
        <span className="w-6 h-6 rounded-lg bg-brand-active text-text-main font-bold text-xs flex items-center justify-center">
          3
        </span>
      )
    }
    return (
      <span className="w-6 h-6 rounded-lg bg-surface-elevated text-text-dim border border-border-subtle font-mono text-xs flex items-center justify-center">
        {rank}
      </span>
    )
  }

  return (
    <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-4 flex flex-col justify-between shadow-xl">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-main">Món ăn Bán chạy</h3>
            <p className="text-[10px] text-text-muted">Xếp hạng theo số lượng & doanh thu</p>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {dishes.length === 0 ? (
        <div className="py-14 flex flex-col items-center justify-center text-center text-text-muted space-y-2">
          <Utensils className="w-8 h-8 text-text-dim" />
          <p className="text-xs">Chưa có món ăn nào phát sinh đơn hàng trong kỳ</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase tracking-wider">
                <th className="pb-2.5 font-semibold w-12 text-center">Hạng</th>
                <th className="pb-2.5 font-semibold">Tên món</th>
                <th className="pb-2.5 font-semibold text-center w-20">Đã bán</th>
                <th className="pb-2.5 font-semibold text-right w-28">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {dishes.map((dish, idx) => (
                <tr key={dish.dishId || idx} className="hover:bg-surface-card-hover/40 transition-colors">
                  <td className="py-3 flex justify-center">{getRankBadge(idx + 1)}</td>
                  <td className="py-3 font-semibold text-text-main pr-2">
                    <span className="block truncate max-w-[180px] sm:max-w-xs">{dish.dishName}</span>
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-brand-primary">
                    {dish.totalSold}
                  </td>
                  <td className="py-3 text-right font-mono text-text-body">
                    {Number(dish.revenue || 0).toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TopDishesTable
