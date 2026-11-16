import { Edit2, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'

/**
 * Bảng Quản Lý Danh Mục (CategoryTable)
 * - 100% Centralized Design Tokens
 * - Độ dài < 95 dòng
 */
export const CategoryTable = ({
  categories = [],
  onEdit,
  onDelete,
  onToggleVisibility,
  togglingId = null,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface-card shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase tracking-wider bg-surface-bg/50">
            <th className="py-3 px-4 font-semibold w-16">ID</th>
            <th className="py-3 px-4 font-semibold">Tên danh mục</th>
            <th className="py-3 px-4 font-semibold">Mô tả</th>
            <th className="py-3 px-4 font-semibold text-center w-28">Hiển thị</th>
            <th className="py-3 px-4 font-semibold text-right w-28">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/60">
          {categories.map((cat) => {
            const id = cat.categoryId || cat.ma_danh_muc
            const name = cat.categoryName || cat.ten_danh_muc
            const desc = cat.description || cat.mo_ta || '—'
            const isVisible = cat.isVisible !== false
            const isToggling = togglingId === id

            return (
              <tr key={id} className="hover:bg-surface-card-hover/40 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-text-dim">
                  #{id}
                </td>
                <td className="py-3.5 px-4 font-semibold text-text-main">
                  {name}
                </td>
                <td className="py-3.5 px-4 text-text-muted max-w-xs truncate">
                  {desc}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleVisibility(id)}
                    disabled={isToggling}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                      isVisible
                        ? 'bg-status-success/10 text-status-success border border-status-success/20 hover:bg-status-success/20'
                        : 'bg-surface-elevated text-text-dim border border-border-subtle hover:text-text-muted'
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
                      className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface-card-hover transition-colors cursor-pointer"
                      title="Chỉnh sửa danh mục"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(cat)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-surface-card-hover transition-colors cursor-pointer"
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
