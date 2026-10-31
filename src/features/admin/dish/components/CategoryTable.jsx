import { Edit2, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'

export const CategoryTable = ({
  categories = [],
  onEdit,
  onDelete,
  onToggleVisibility,
  togglingId = null,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-[10px] uppercase tracking-wider bg-gray-950/40">
            <th className="py-3 px-4 font-semibold w-16">ID</th>
            <th className="py-3 px-4 font-semibold">Tên danh mục</th>
            <th className="py-3 px-4 font-semibold">Mô tả</th>
            <th className="py-3 px-4 font-semibold text-center w-28">Hiển thị</th>
            <th className="py-3 px-4 font-semibold text-right w-28">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {categories.map((cat) => {
            const id = cat.categoryId || cat.ma_danh_muc
            const name = cat.categoryName || cat.ten_danh_muc
            const desc = cat.description || cat.mo_ta || '—'
            const isVisible = cat.isVisible !== false
            const isToggling = togglingId === id

            return (
              <tr key={id} className="hover:bg-gray-800/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-gray-400">
                  #{id}
                </td>
                <td className="py-3.5 px-4 font-semibold text-white">
                  {name}
                </td>
                <td className="py-3.5 px-4 text-gray-400 max-w-xs truncate">
                  {desc}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleVisibility(id)}
                    disabled={isToggling}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                      isVisible
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                    }`}
                    title="Bấm để Bật/Tắt hiển thị"
                  >
                    {isToggling ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isVisible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                    <span>{isVisible ? 'Đang hiện' : 'Đang ẩn'}</span>
                  </button>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(cat)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-colors"
                      title="Chỉnh sửa danh mục"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(cat)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
                      title="Xóa danh mục"
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

export default CategoryTable

