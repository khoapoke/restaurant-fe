import { Users, MapPin, Edit2, QrCode } from 'lucide-react'
import { TABLE_STATUS_CONFIG } from '../constants'

/**
 * Thẻ Hiển Thị Bàn Ăn (TableCard)
 * - 100% Centralized Design Tokens
 * - Hỗ trợ thao tác Mở bàn QR tại chỗ
 * - Độ dài < 100 dòng
 */
export const TableCard = ({ table, onEdit, onQuickStatusChange, onOpenDineIn }) => {
  const id = table.tableId || table.ma_ban
  const name = table.tableName || table.ten_ban
  const capacity = table.capacity || table.suc_chua || 4
  const location = table.location || table.vi_tri || 'Sảnh chính'
  const status = table.status || table.trang_thai || 'AVAILABLE'

  const cfg = TABLE_STATUS_CONFIG[status] || TABLE_STATUS_CONFIG.AVAILABLE

  return (
    <div
      className={`p-5 rounded-2xl bg-surface-card border ${cfg.cardBorder} transition-all duration-200 hover:shadow-xl hover:shadow-black/50 flex flex-col justify-between group shadow-sm`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-[10px] font-mono text-text-dim font-bold block">
            BÀN #{id}
          </span>
          <h3 className="text-base font-bold text-text-main group-hover:text-brand-primary transition-colors">
            {name}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          {(status === 'AVAILABLE' || status === 'OCCUPIED') && onOpenDineIn && (
            <button
              type="button"
              onClick={() => onOpenDineIn(table)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-surface-bg transition-colors cursor-pointer"
              title={status === 'AVAILABLE' ? 'Mở bàn gọi món QR tại chỗ' : 'Xem mã QR phục vụ'}
            >
              <QrCode className="w-3 h-3" />
              <span>{status === 'AVAILABLE' ? 'Mở bàn' : 'Mã QR'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(table)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card-hover transition-colors cursor-pointer"
            title="Sửa thông tin bàn"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border-subtle">
        <div className="flex items-center justify-between text-xs text-text-body">
          <span className="flex items-center gap-1.5 text-text-muted">
            <Users className="w-3.5 h-3.5 text-brand-primary" /> Sức chứa:
          </span>
          <span className="font-mono font-bold text-text-main">{capacity} khách</span>
        </div>

        <div className="flex items-center justify-between text-xs text-text-body">
          <span className="flex items-center gap-1.5 text-text-muted">
            <MapPin className="w-3.5 h-3.5 text-brand-primary" /> Vị trí:
          </span>
          <span className="truncate max-w-[130px] font-medium">{location}</span>
        </div>
      </div>

      <div className="pt-3 mt-2 border-t border-border-subtle flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.color}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
          {cfg.label}
        </span>

        {onQuickStatusChange && (
          <select
            value={status}
            onChange={(e) => onQuickStatusChange(id, e.target.value)}
            className="px-2 py-0.5 text-[10px] font-medium bg-surface-bg border border-border-subtle hover:border-border-strong rounded-lg text-text-main focus:outline-none focus:border-brand-primary cursor-pointer"
            title="Đổi nhanh trạng thái bàn"
          >
            <option value="AVAILABLE">Trống</option>
            <option value="RESERVED">Đã đặt</option>
            <option value="OCCUPIED">Có khách</option>
            <option value="MAINTENANCE">Bảo trì</option>
          </select>
        )}
      </div>
    </div>
  )
}

export default TableCard
