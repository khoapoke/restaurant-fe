import { Clock, ChefHat, Flame, Check, CheckCircle2, ArrowRight, AlertTriangle, MessageSquare } from 'lucide-react'
import { ORDER_ITEM_STATUS_CONFIG } from '../../order/constants'

/**
 * Thẻ Đơn Hàng Màn Hình Bếp (KitchenOrderCard)
 * - Hiển thị chi tiết từng món cần nấu theo bàn
 * - Nút chuyển trạng thái 1-chạm (COOKING -> READY -> SERVED)
 * - Cảnh báo thời gian chờ trực quan (xanh / vàng / đỏ nhấp nháy)
 * - 100% Centralized Design Tokens, dưới 220 dòng
 */
export const KitchenOrderCard = ({
  order,
  onUpdateDishStatus,
  onUpdateOrderStatus,
  loadingDishId,
  loadingOrderId,
}) => {
  const orderId = order.orderId || order.ma_don_hang
  const tableId = order.tableId || order.ma_ban
  const tableName = order.tableName || order.ten_ban || `Bàn #${tableId || 'Mang đi'}`
  const waitingMinutes = Number(order.waitingMinutes || order.thoi_gian_cho || 0)
  const items = order.items || order.chi_tiet || []

  // Đếm tiến độ món
  const readyOrServedCount = items.filter(
    (it) => it.itemStatus === 'READY' || it.itemStatus === 'SERVED'
  ).length

  // Màu sắc thời gian chờ
  let waitColor = 'text-text-muted bg-surface-bg border-border-subtle'
  let isUrgent = false
  if (waitingMinutes >= 30) {
    waitColor = 'text-status-error bg-status-error/15 border-status-error/40 animate-pulse font-bold'
    isUrgent = true
  } else if (waitingMinutes >= 15) {
    waitColor = 'text-status-warning bg-status-warning/10 border-status-warning/30 font-semibold'
  }

  return (
    <div className={`rounded-2xl bg-surface-card border transition-all duration-200 flex flex-col justify-between shadow-md ${
      isUrgent ? 'border-status-error/50 shadow-status-error/10' : 'border-border-subtle hover:border-border-strong'
    }`}>
      
      {/* Header Thẻ Bếp */}
      <div className="p-4 border-b border-border-subtle bg-surface-card-hover/40 rounded-t-2xl flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-brand-primary">#{orderId}</span>
            <span className="text-sm font-extrabold text-text-main truncate">{tableName}</span>
          </div>
          <p className="text-[10px] text-text-dim mt-0.5">
            Tiến độ: <span className="font-bold text-text-main">{readyOrServedCount}/{items.length} món</span>
          </p>
        </div>

        {/* Badge thời gian chờ */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${waitColor}`}>
          {isUrgent ? <AlertTriangle className="w-3.5 h-3.5 text-status-error" /> : <Clock className="w-3.5 h-3.5" />}
          <span>{waitingMinutes} phút</span>
        </div>
      </div>

      {/* Danh sách món ăn cần chế biến */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[340px]">
        {items.map((item, idx) => {
          const dishId = item.dishId || item.ma_mon_an
          const status = item.itemStatus || item.trang_thai_mon || 'PENDING'
          const cfg = ORDER_ITEM_STATUS_CONFIG[status] || ORDER_ITEM_STATUS_CONFIG.PENDING
          const isDishLoading = loadingDishId === `${orderId}-${dishId}`

          return (
            <div
              key={`${dishId}-${idx}`}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                status === 'SERVED'
                  ? 'bg-surface-bg/50 border-border-subtle opacity-60'
                  : status === 'READY'
                  ? 'bg-status-info/5 border-status-info/30'
                  : status === 'COOKING'
                  ? 'bg-brand-primary/5 border-brand-primary/30'
                  : 'bg-surface-bg border-border-subtle'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="shrink-0 w-6 h-6 rounded-md bg-brand-primary/15 text-brand-primary font-mono text-xs font-bold flex items-center justify-center">
                    {item.quantity}x
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-text-main leading-tight">
                      {item.dishName || item.ten_mon}
                    </h4>
                    {item.note && (
                      <p className="text-[11px] text-brand-hover italic flex items-center gap-1 mt-0.5">
                        <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                        <span>{item.note}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Badge trạng thái món */}
                <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor || 'bg-current'}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Nút hành động cho món */}
              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border-subtle/50">
                {status === 'PENDING' && (
                  <button
                    type="button"
                    disabled={isDishLoading}
                    onClick={() => onUpdateDishStatus(orderId, dishId, 'COOKING')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-primary text-surface-bg hover:bg-brand-hover transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Flame className="w-3 h-3" />
                    <span>Nấu món</span>
                  </button>
                )}

                {status === 'COOKING' && (
                  <button
                    type="button"
                    disabled={isDishLoading}
                    onClick={() => onUpdateDishStatus(orderId, dishId, 'READY')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-status-info text-white hover:bg-status-info/90 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" />
                    <span>Nấu xong</span>
                  </button>
                )}

                {status === 'READY' && (
                  <button
                    type="button"
                    disabled={isDishLoading}
                    onClick={() => onUpdateDishStatus(orderId, dishId, 'SERVED')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-status-success text-white hover:bg-status-success/90 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>Bưng ra bàn</span>
                  </button>
                )}

                {status === 'SERVED' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-status-success">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã phục vụ</span>
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Hành Động Toàn Đơn */}
      <div className="p-3 border-t border-border-subtle bg-surface-bg rounded-b-2xl flex items-center justify-between gap-2">
        <span className="text-[11px] text-text-muted">
          Tổng: <span className="font-bold text-text-main">{items.length} món</span>
        </span>

        {/* Nút báo sẵn sàng cả đơn nếu có món READY */}
        {order.orderStatus !== 'READY' && readyOrServedCount === items.length && items.length > 0 && (
          <button
            type="button"
            disabled={loadingOrderId === orderId}
            onClick={() => onUpdateOrderStatus(orderId, 'READY')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-status-success text-white hover:bg-status-success/90 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Sẵn sàng cả đơn</span>
          </button>
        )}
      </div>

    </div>
  )
}

export default KitchenOrderCard

