import { CheckCircle2, XCircle, Check, Users, Clock, Utensils } from 'lucide-react'
import { RESERVATION_STATUS_CONFIG } from '../constants'
import Button from '../../../../components/ui/Button'

export const ReservationTable = ({
  reservations = [],
  onOpenAction,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-[10px] uppercase tracking-wider bg-gray-950/40">
            <th className="py-3 px-4 font-semibold w-16 text-center">Mã</th>
            <th className="py-3 px-4 font-semibold">Khách hàng</th>
            <th className="py-3 px-4 font-semibold w-36">Thời gian đến</th>
            <th className="py-3 px-4 font-semibold text-center w-20">Số khách</th>
            <th className="py-3 px-4 font-semibold w-32">Bàn ăn</th>
            <th className="py-3 px-4 font-semibold">Ghi chú</th>
            <th className="py-3 px-4 font-semibold text-center w-28">Trạng thái</th>
            <th className="py-3 px-4 font-semibold text-right w-52">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {reservations.map((r) => {
            const id = r.reservationId || r.ma_dat_ban
            const name = r.recipientName || r.customerName || r.account?.username || 'Khách'
            const phone = r.recipientPhone || r.phoneNumber || '—'
            const time = r.reservationTime || r.thoi_gian
            const guests = r.guestCount || r.so_luong_khach || 1
            const tableName = r.tableName || r.table?.tableName || (r.tableId ? `Bàn #${r.tableId}` : 'Chưa gán')
            const status = r.status || r.trang_thai || 'PENDING'

            const statusCfg = RESERVATION_STATUS_CONFIG[status] || RESERVATION_STATUS_CONFIG.PENDING
            const isPending = status === 'PENDING'
            const isConfirmed = status === 'CONFIRMED'

            return (
              <tr key={id} className="hover:bg-gray-800/30 transition-colors">
                <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-400">
                  #{id}
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-bold text-white truncate max-w-[130px]">{name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{phone}</p>
                </td>

                <td className="py-3.5 px-4 text-gray-300 font-mono text-[11px] whitespace-nowrap">
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

                <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                  {guests}
                </td>

                <td className="py-3.5 px-4 font-medium text-gray-200">
                  <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-[11px]">
                    {tableName}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-gray-400 max-w-xs truncate text-[11px]">
                  {r.note || r.ghi_chu || r.adminNote || '—'}
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

                    {isConfirmed && (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenAction(r, 'SEATED')}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-purple-500/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 flex items-center gap-1 transition-colors cursor-pointer"
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
                          className="text-[11px] py-1 px-1.5 text-red-400 hover:bg-red-500/10"
                          icon={XCircle}
                          title="Hủy lượt đặt bàn này"
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

