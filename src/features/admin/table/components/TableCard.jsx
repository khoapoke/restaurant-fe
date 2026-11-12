import { Users, MapPin, Edit2 } from 'lucide-react'
import { TABLE_STATUS_CONFIG } from '../constants'

export const TableCard = ({ table, onEdit, onQuickStatusChange }) => {
  const id = table.tableId || table.ma_ban
  const name = table.tableName || table.ten_ban
  const capacity = table.capacity || table.suc_chua || 4
  const location = table.location || table.vi_tri || 'Sảnh chính'
  const status = table.status || table.trang_thai || 'AVAILABLE'

  const cfg = TABLE_STATUS_CONFIG[status] || TABLE_STATUS_CONFIG.AVAILABLE

  return (
    <div
      className={`p-5 rounded-2xl bg-gray-900/60 border ${cfg.cardBorder} transition-all duration-200 hover:shadow-xl hover:shadow-black/50 flex flex-col justify-between group`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-[10px] font-mono text-gray-500 font-bold block">
            BÀN #{id}
          </span>
          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
            {name}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => onEdit(table)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          title="Sửa thông tin bàn"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-800/60">
        <div className="flex items-center justify-between text-xs text-gray-300">
          <span className="flex items-center gap-1.5 text-gray-400">
            <Users className="w-3.5 h-3.5 text-amber-500" /> Sức chứa:
          </span>
          <span className="font-mono font-bold text-white">{capacity} khách</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-300">
          <span className="flex items-center gap-1.5 text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-amber-500" /> Vị trí:
          </span>
          <span className="truncate max-w-[130px] font-medium">{location}</span>
        </div>
      </div>

      <div className="pt-3 mt-2 border-t border-gray-800/60 flex items-center justify-between gap-2">
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
            className="px-2 py-0.5 text-[10px] font-medium bg-gray-950 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-amber-500 cursor-pointer"
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

