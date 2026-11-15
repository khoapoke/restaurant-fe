import { CheckCircle2, Users, AlertCircle } from 'lucide-react'
import Skeleton from '../../../../components/ui/Skeleton'

/**
 * Sub-component Chọn Bàn Ăn Khả Dụng (BookingTablePicker)
 * - Hiển thị danh sách bàn trống khả dụng theo thời gian thực
 * - Thẻ bàn với thông tin sức chứa, khu vực, trạng thái chọn
 * - Tuyệt đối không dùng icon Sparkles, độ dài < 140 dòng
 */
export default function BookingTablePicker({
  tables = [],
  loading = false,
  error = null,
  selectedTableId = null,
  onSelectTable,
}) {
  return (
    <div className="space-y-3 pt-2 border-t border-border-subtle">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-text-main">
            Lựa chọn vị trí bàn khả dụng
          </h3>
          <p className="text-[11px] text-text-muted">
            Danh sách bàn trống được cập nhật theo thời gian thực (chống trùng giờ 100%)
          </p>
        </div>
        {!loading && tables.length > 0 && (
          <span className="text-[11px] font-semibold text-brand-primary">
            {tables.length} bàn khả dụng
          </span>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3.5 rounded-xl bg-surface-card border border-border-subtle space-y-2.5">
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-3 w-1/3 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="p-3.5 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tables.length === 0 && (
        <div className="p-6 rounded-xl bg-surface-card/60 border border-dashed border-border-subtle text-center space-y-2">
          <Users className="w-8 h-8 text-text-muted mx-auto" />
          <h4 className="text-xs font-semibold text-text-main">
            Không tìm thấy bàn trống phù hợp
          </h4>
          <p className="text-[11px] text-text-muted max-w-sm mx-auto">
            Không còn bàn trống đáp ứng đủ số lượng khách vào khung giờ này. Bạn vui lòng đổi sang giờ khác hoặc gọi hotline để được hỗ trợ.
          </p>
        </div>
      )}

      {/* Data Grid: Danh sách bàn khả dụng */}
      {!loading && !error && tables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {tables.map((table) => {
            const id = table.tableId || table.id
            const name = table.tableName || table.name || `Bàn số ${id}`
            const capacity = table.capacity || table.so_ghe || 4
            const location = table.location || table.vi_tri || (name.toLowerCase().includes('vip') ? 'Phòng VIP' : 'Sảnh tiệc')
            const isSelected = selectedTableId === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTable(id)}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-surface-card border-brand-primary shadow-sm shadow-brand-primary/10 ring-1 ring-brand-primary'
                    : 'bg-surface-card border-border-subtle hover:border-border-strong hover:bg-surface-card-hover'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-brand-primary' : 'text-text-main'}`}>
                      {name}
                    </h4>
                    <span className="text-[10px] text-text-muted">
                      {location}
                    </span>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-border-subtle shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                  <Users className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Sức chứa: {capacity} khách</span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
