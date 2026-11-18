import { RefreshCw, Utensils, CheckCircle2, Clock, ChefHat, AlertCircle, Plus } from 'lucide-react'
import { ORDER_ITEM_STATUS_CONFIG, ORDER_STATUS_CONFIG } from '../constants'

/**
 * Component Theo Dõi Tiến Độ Món Ăn Tại Bàn (DineInItemTracker)
 * - Hiển thị trạng thái real-time từng món: Chờ chế biến -> Đang nấu -> Sẵn sàng -> Đã phục vụ
 * - Hỗ trợ Auto-poll 15s và Nút Làm mới thủ công
 * - Độ dài < 250 dòng
 */
export default function DineInItemTracker({
  orderData,
  loading = false,
  error = null,
  onRefresh,
  onSwitchToMenu,
}) {
  const rawItems = orderData?.items || orderData?.chi_tiet_don_hang
  const items = Array.isArray(rawItems) ? rawItems : []
  const tableName = orderData?.tableName || orderData?.ten_ban || 'Bàn ăn'
  const orderId = orderData?.orderId || orderData?.id
  const orderStatus = orderData?.status || orderData?.orderStatus || 'PREPARING'
  const totalAmount = orderData?.totalAmount || 0

  const statusConfig = ORDER_STATUS_CONFIG[orderStatus] || ORDER_STATUS_CONFIG.PREPARING

  const formatVND = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)

  // Đếm món theo trạng thái
  const counts = items.reduce((acc, item) => {
    const st = item.itemStatus || item.trang_thai_mon || 'PENDING'
    acc[st] = (acc[st] || 0) + (item.quantity || 1)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Table Status Summary Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                {tableName}
              </span>
              <span className="text-xs text-text-dim">#{orderId}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-text-main mt-1">
              Tiến độ phục vụ bàn ăn
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-elevated hover:bg-surface-card-hover text-text-muted hover:text-text-main text-xs font-medium transition-colors disabled:opacity-50"
              title="Làm mới tiến độ"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-primary' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Live Counters Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border-subtle">
          <div className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-center">
            <span className="text-xs text-text-muted flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-status-warning" /> Chờ nấu
            </span>
            <span className="text-base font-bold text-status-warning font-mono mt-0.5 block">
              {counts.PENDING || 0}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-center">
            <span className="text-xs text-text-muted flex items-center justify-center gap-1">
              <ChefHat className="w-3 h-3 text-brand-hover" /> Đang nấu
            </span>
            <span className="text-base font-bold text-brand-hover font-mono mt-0.5 block">
              {counts.COOKING || 0}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-center">
            <span className="text-xs text-text-muted flex items-center justify-center gap-1">
              <Utensils className="w-3 h-3 text-status-info" /> Sẵn sàng
            </span>
            <span className="text-base font-bold text-status-info font-mono mt-0.5 block">
              {counts.READY || 0}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-center">
            <span className="text-xs text-text-muted flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-status-success" /> Đã phục vụ
            </span>
            <span className="text-base font-bold text-status-success font-mono mt-0.5 block">
              {counts.SERVED || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Error Notice if any */}
      {error && (
        <div className="p-3.5 rounded-xl bg-status-error/10 border border-status-error/20 flex items-center justify-between text-xs text-status-error">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={onRefresh} className="underline font-bold">
            Thử lại
          </button>
        </div>
      )}

      {/* Dish Items List */}
      <div className="rounded-2xl bg-surface-card border border-border-subtle overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border-subtle bg-surface-elevated flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
            <span>Danh sách món đã gọi</span>
            <span className="px-2 py-0.5 rounded-md text-xs bg-surface-card border border-border-subtle text-text-muted">
              {items.length} món
            </span>
          </h3>
          <span className="text-xs text-text-dim flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            Tự động cập nhật 15s
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted mx-auto">
              <Utensils className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-text-main">Chưa có món nào được gọi</h4>
            <p className="text-xs text-text-muted max-w-xs mx-auto">
              Bàn ăn chưa chọn món. Vui lòng mở thực đơn để chọn món ngon gửi vào bếp.
            </p>
            <button
              type="button"
              onClick={onSwitchToMenu}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-surface-bg text-xs font-bold transition-all shadow-md shadow-brand-primary/20"
            >
              <Plus className="w-4 h-4" />
              Chọn món ngay
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {items.map((item, idx) => {
              const itemStatus = item.itemStatus || item.trang_thai_mon || 'PENDING'
              const itemConfig = ORDER_ITEM_STATUS_CONFIG[itemStatus] || ORDER_ITEM_STATUS_CONFIG.PENDING
              const unitPrice = Number(item.unitPrice || item.don_gia || 0)
              const subtotal = unitPrice * (item.quantity || 1)

              return (
                <div
                  key={`${item.dishId || idx}-${idx}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-elevated/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-surface-elevated border border-border-subtle text-xs font-bold text-brand-primary">
                        {item.quantity}x
                      </span>
                      <h4 className="text-sm font-bold text-text-main truncate">
                        {item.dishName || item.ten_mon_an || `Món #${item.dishId}`}
                      </h4>
                    </div>

                    {item.note && (
                      <p className="mt-1.5 text-xs text-brand-hover bg-brand-primary/10 border border-brand-primary/20 rounded-md px-2 py-0.5 inline-block">
                        Ghi chú: {item.note}
                      </p>
                    )}

                    <div className="mt-1 text-xs text-text-dim flex items-center gap-3">
                      <span>Đơn giá: {formatVND(unitPrice)}</span>
                      <span>•</span>
                      <span className="font-semibold text-text-main">
                        Thành tiền: {formatVND(subtotal)}
                      </span>
                    </div>
                  </div>

                  {/* Item Status Badge */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${itemConfig.bg} ${itemConfig.color} ${itemConfig.border}`}
                    >
                      {itemStatus === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                      {itemStatus === 'COOKING' && <ChefHat className="w-3.5 h-3.5 animate-pulse" />}
                      {itemStatus === 'READY' && <Utensils className="w-3.5 h-3.5" />}
                      {itemStatus === 'SERVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{item.statusLabel || itemConfig.label}</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bill Summary & Add More CTA */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-surface-elevated border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs text-text-muted">Tổng tích lũy bàn ăn:</span>
              <div className="text-xl font-extrabold text-brand-primary font-mono">
                {formatVND(totalAmount)}
              </div>
            </div>
            <button
              type="button"
              onClick={onSwitchToMenu}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-surface-bg text-xs font-bold shadow-md shadow-brand-primary/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Gọi thêm món vào bàn
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
