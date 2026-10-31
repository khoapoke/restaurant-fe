import { Award, Utensils } from 'lucide-react'

export const TopDishesTable = ({ dishes = [] }) => {
  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="w-6 h-6 rounded-lg bg-amber-500 text-gray-950 font-bold text-xs flex items-center justify-center shadow-sm shadow-amber-500/30">
          1
        </span>
      )
    }
    if (rank === 2) {
      return (
        <span className="w-6 h-6 rounded-lg bg-slate-300 text-gray-950 font-bold text-xs flex items-center justify-center">
          2
        </span>
      )
    }
    if (rank === 3) {
      return (
        <span className="w-6 h-6 rounded-lg bg-amber-800/80 text-amber-200 font-bold text-xs flex items-center justify-center">
          3
        </span>
      )
    }
    return (
      <span className="w-6 h-6 rounded-lg bg-gray-800 text-gray-400 font-mono text-xs flex items-center justify-center">
        {rank}
      </span>
    )
  }

  return (
    <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4 flex flex-col justify-between">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Món ăn Bán chạy</h3>
            <p className="text-[10px] text-gray-400">Xếp hạng theo số lượng & doanh thu</p>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {dishes.length === 0 ? (
        <div className="py-14 flex flex-col items-center justify-center text-center text-gray-500 space-y-2">
          <Utensils className="w-8 h-8 text-gray-600" />
          <p className="text-xs">Chưa có món ăn nào phát sinh đơn hàng trong kỳ</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-[10px] uppercase tracking-wider">
                <th className="pb-2.5 font-semibold w-12 text-center">Hạng</th>
                <th className="pb-2.5 font-semibold">Tên món</th>
                <th className="pb-2.5 font-semibold text-center w-20">Đã bán</th>
                <th className="pb-2.5 font-semibold text-right w-28">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {dishes.map((dish, idx) => (
                <tr key={dish.dishId || idx} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 flex justify-center">
                    {getRankBadge(idx + 1)}
                  </td>
                  <td className="py-3 font-semibold text-gray-100 pr-2">
                    <span className="block truncate max-w-[180px] sm:max-w-xs">
                      {dish.dishName}
                    </span>
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-amber-400">
                    {dish.totalSold}
                  </td>
                  <td className="py-3 text-right font-mono text-gray-200">
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

