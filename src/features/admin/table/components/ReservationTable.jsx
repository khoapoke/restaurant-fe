import { CheckCircle2, XCircle, Check, Utensils, DollarSign } from 'lucide-react'
import { RESERVATION_STATUS_CONFIG } from '../constants'
import Button from '../../../../components/ui/Button'

/**
 * Bảng Danh Sách Đặt Bàn (ReservationTable)
 * - 100% Centralized Design Tokens
 * - Hiển thị tiền cọc và điều phối nhanh các hành động xác nhận cọc/duyệt/hủy/vào bàn
 * - Độ dài < 175 dòng
 */
export const ReservationTable = ({
  reservations = [],
  onOpenAction,
  onOpenConfirmDeposit,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface-card shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase tracking-wider bg-surface-bg/50">
            <th className="py-3 px-4 font-semibold w-16 text-center">Mã</th>
            <th className="py-3 px-4 font-semibold">Khách hàng</th>
            <th className="py-3 px-4 font-semibold w-36">Thời gian đến</th>
            <th className="py-3 px-4 font-semibold text-center w-20">Số khách</th>
            <th className="py-3 px-4 font-semibold w-28">Bàn ăn</th>
            <th className="py-3 px-4 font-semibold text-right w-28">Tiền cọc</th>
            <th className="py-3 px-4 font-semibold text-center w-28">Trạng thái</th>
            <th className="py-3 px-4 font-semibold text-right w-52">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/60">
          {reservations.map((r) => {
            const id = r.reservationId || r.ma_dat_ban
            const name = r.recipientName || r.customerName || r.account?.username || 'Khách'
            const phone = r.recipientPhone || r.phoneNumber || '—'
            const time = r.reservationTime || r.thoi_gian
            const guests = r.guestCount || r.so_luong_khach || 1
            const tableName = r.tableName || r.table?.tableName || (r.tableId ? `Bàn #${r.tableId}` : 'Chưa gán')
            const rawStatus = r.status || r.trang_thai || 'PENDING'
            const isTableOccupied = r.table?.status === 'OCCUPIED' || r.table?.trang_thai === 'Đang phục vụ'
            const status = (rawStatus === 'CONFIRMED' && isTableOccupied) ? 'OCCUPIED' : rawStatus
            const deposit = Number(r.depositAmount || r.tien_coc || (status === 'PENDING_DEPOSIT' ? guests * 50000 : 0))

            const statusCfg = RESERVATION_STATUS_CONFIG[status] || RESERVATION_STATUS_CONFIG.PENDING
            const isPendingDeposit = status === 'PENDING_DEPOSIT'
            const isPending = status === 'PENDING'
            const isConfirmed = status === 'CONFIRMED'
            const isOccupied = status === 'OCCUPIED'

            return (
              <tr key={id} className="hover:bg-surface-card-hover/40 transition-colors">
                <td className="py-3.5 px-4 text-center font-mono font-bold text-text-dim">
                  #{id}
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-bold text-text-main truncate max-w-[130px]">{name}</p>
                  <p className="text-[10px] text-text-muted font-mono">{phone}</p>
                </td>

                <td className="py-3.5 px-4 text-text-muted font-mono text-[11px] whitespace-nowrap">
                  {time
                    ? new Date(time).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : '—'}
                </td>

                <td className="py-3.5 px-4 text-center font-mono font-bold text-brand-primary">
                  {guests}
                </td>

                <td className="py-3.5 px-4 font-medium text-text-body">
                  <span className="px-2 py-0.5 rounded bg-surface-bg border border-border-subtle text-[11px]">
                    {tableName}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right font-mono text-[11px]">
                  {deposit > 0 ? (
                    <span className={isPendingDeposit ? 'text-status-warning font-bold' : 'text-status-success font-semibold'}>
                      {deposit.toLocaleString('vi-VN')}đ
                    </span>
                  ) : (
                    <span className="text-text-dim">—</span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color}`}
                  >
                    {statusCfg.label}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    {/* Chờ cọc: Nút Xác nhận cọc */}
                    {isPendingDeposit && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onOpenConfirmDeposit?.(r)}
                          className="text-[11px] py-1 px-2.5 font-bold"
                          icon={DollarSign}
                        >
                          Xác nhận cọc
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onOpenAction(r, 'CANCELLED')}
                          className="text-[11px] py-1 px-2"
                          icon={XCircle}
                          title="Hủy lượt đặt cọc"
                        />
                      </>
                    )}

                    {/* Chờ duyệt (miễn cọc) */}
                    {isPending && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onOpenAction(r, 'CONFIRMED')}
                          className="text-[11px] py-1 px-2.5"
                          icon={CheckCircle2}
                        >
                          Duyệt
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onOpenAction(r, 'REJECTED')}
                          className="text-[11px] py-1 px-2"
                          icon={XCircle}
                          title="Từ chối đặt bàn"
                        />
                      </>
                    )}

                    {/* Đã xác nhận: Vào bàn, Hoàn tất hoặc Hủy */}
                    {isConfirmed && (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenAction(r, 'OCCUPIED')}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-brand-primary/15 hover:bg-brand-primary/25 text-brand-hover border border-brand-primary/30 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Khách đã đến nhận bàn"
                        >
                          <Utensils className="w-3 h-3" />
                          Vào bàn
                        </button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onOpenAction(r, 'COMPLETED')}
                          className="text-[11px] py-1 px-2"
                          icon={Check}
                          title="Hoàn tất lượt dùng bữa"
                        >
                          Hoàn tất
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenAction(r, 'CANCELLED')}
                          className="text-[11px] py-1 px-1.5 text-status-error hover:bg-status-error/10"
                          icon={XCircle}
                          title="Hủy lượt đặt bàn này"
                        />
                      </>
                    )}

                    {/* Đang có khách: Chỉ hiển thị Hoàn tất & Hủy */}
                    {isOccupied && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onOpenAction(r, 'COMPLETED')}
                          className="text-[11px] py-1 px-2.5 font-bold"
                          icon={Check}
                          title="Hoàn tất lượt dùng bữa và giải phóng bàn"
                        >
                          Hoàn tất
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenAction(r, 'CANCELLED')}
                          className="text-[11px] py-1 px-1.5 text-status-error hover:bg-status-error/10"
                          icon={XCircle}
                          title="Hủy lượt dùng bữa này"
                        />
                      </>
                    )}
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

export default ReservationTable
