import { Edit2, Trash2, CheckCircle2, XCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'

/**
 * Bảng Danh Sách Món Ăn (DishTable)
 * - 100% Centralized Design Tokens
 * - Tương tác bật/tắt Còn bán & Hiển thị real-time
 * - Độ dài < 140 dòng
 */
export const DishTable = ({
  dishes = [],
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleVisibility,
  togglingId = null,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface-card shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase tracking-wider bg-surface-bg/50">
            <th className="py-3 px-4 font-semibold w-12 text-center">ID</th>
            <th className="py-3 px-4 font-semibold">Món ăn</th>
            <th className="py-3 px-4 font-semibold w-28">Danh mục</th>
            <th className="py-3 px-4 font-semibold text-right w-28">Đơn giá</th>
            <th className="py-3 px-4 font-semibold text-center w-28">Còn bán</th>
            <th className="py-3 px-4 font-semibold text-center w-28">Hiển thị</th>
            <th className="py-3 px-4 font-semibold text-right w-24">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/60">
          {dishes.map((dish) => {
            const id = dish.dishId || dish.ma_mon_an
            const name = dish.dishName || dish.ten_mon_an
            const price = Number(dish.price || dish.gia_tien || 0)
            const catName = dish.categoryName || dish.category?.categoryName || 'Chung'
            const isAvail = dish.isAvailable !== false
            const isVis = dish.isVisible !== false
            const isToggling = togglingId === id

            return (
              <tr key={id} className="hover:bg-surface-card-hover/40 transition-colors">
                <td className="py-3 px-4 text-center font-mono font-bold text-text-dim">
                  #{id}
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveDishImage(dish.imageUrl, dish)}
                      alt={name}
                      onError={(e) => handleImageError(e, resolveDishImage(null, dish))}
                      className="w-10 h-10 rounded-xl object-cover bg-surface-bg border border-border-subtle shrink-0"
                    />
                    <div className="min-w-0 max-w-xs">
                      <p className="font-bold text-text-main truncate">{name}</p>
                      <p className="text-[11px] text-text-muted truncate">
                        {dish.description || 'Chưa có mô tả'}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 text-text-muted">
                  <span className="px-2 py-0.5 rounded-md bg-surface-bg border border-border-subtle text-[10px] font-medium text-text-body">
                    {catName}
                  </span>
                </td>

                <td className="py-3 px-4 text-right font-mono font-bold text-brand-primary">
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
                        ? 'bg-status-success/10 text-status-success border border-status-success/20 hover:bg-status-success/20'
                        : 'bg-status-error/10 text-status-error border border-status-error/20 hover:bg-status-error/20'
                    }`}
                    title="Bấm để chuyển trạng thái Còn bán / Hết món"
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
                        ? 'bg-status-info/10 text-status-info border border-status-info/20 hover:bg-status-info/20'
                        : 'bg-surface-elevated text-text-dim border border-border-subtle hover:text-text-muted'
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
                      className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface-card-hover transition-colors cursor-pointer"
                      title="Sửa món ăn"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(dish)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-surface-card-hover transition-colors cursor-pointer"
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
