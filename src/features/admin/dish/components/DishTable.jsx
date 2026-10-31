import { Edit2, Trash2, CheckCircle2, XCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { FALLBACK_DISH_IMG } from '../constants'

export const DishTable = ({
  dishes = [],
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleVisibility,
  togglingId = null,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-[10px] uppercase tracking-wider bg-gray-950/40">
            <th className="py-3 px-4 font-semibold w-12 text-center">ID</th>
            <th className="py-3 px-4 font-semibold">Món ăn</th>
            <th className="py-3 px-4 font-semibold w-28">Danh mục</th>
            <th className="py-3 px-4 font-semibold text-right w-28">Đơn giá</th>
            <th className="py-3 px-4 font-semibold text-center w-28">Còn bán</th>
            <th className="py-3 px-4 font-semibold text-center w-28">Hiển thị</th>
            <th className="py-3 px-4 font-semibold text-right w-24">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {dishes.map((dish) => {
            const id = dish.dishId || dish.ma_mon_an
            const name = dish.dishName || dish.ten_mon_an
            const price = Number(dish.price || dish.gia_tien || 0)
            const catName = dish.categoryName || dish.category?.categoryName || 'Chung'
            const isAvail = dish.isAvailable !== false
            const isVis = dish.isVisible !== false
            const isToggling = togglingId === id

            return (
              <tr key={id} className="hover:bg-gray-800/30 transition-colors">
                <td className="py-3 px-4 text-center font-mono font-bold text-gray-500">
                  #{id}
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={dish.imageUrl || FALLBACK_DISH_IMG}
                      alt={name}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = FALLBACK_DISH_IMG
                      }}
                      className="w-10 h-10 rounded-xl object-cover bg-gray-800 border border-gray-700 shrink-0"
                    />
                    <div className="min-w-0 max-w-xs">
                      <p className="font-bold text-gray-100 truncate">{name}</p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {dish.description || 'Chưa có mô tả'}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 text-gray-300">
                  <span className="px-2 py-0.5 rounded-md bg-gray-800 border border-gray-700 text-[10px] font-medium">
                    {catName}
                  </span>
                </td>

                <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                  {price.toLocaleString('vi-VN')} đ
                </td>

                {/* Switch Còn bán */}
                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleAvailability(id)}
                    disabled={isToggling}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                      isAvail
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    }`}
                    title="Bấm để chuyển trạng thái Còn bán / Hết hàng"
                  >
                    {isToggling ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isAvail ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    <span>{isAvail ? 'Còn bán' : 'Hết món'}</span>
                  </button>
                </td>

                {/* Switch Hiển thị */}
                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleVisibility(id)}
                    disabled={isToggling}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                      isVis
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                    }`}
                    title="Bấm để Bật/Tắt hiển thị với khách"
                  >
                    {isVis ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{isVis ? 'Đang hiện' : 'Đang ẩn'}</span>
                  </button>
                </td>

                {/* Action buttons */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(dish)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-colors"
                      title="Sửa món ăn"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(dish)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
                      title="Xóa mềm món ăn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DishTable

