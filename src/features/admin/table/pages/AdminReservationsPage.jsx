import { useState, useEffect, useCallback } from 'react'
import { CalendarCheck } from 'lucide-react'
import {
  getAdminReservationsApi,
  getAdminTablesApi,
  updateReservationStatusApi,
  confirmDepositApi,
} from '../services/adminTableService'
import AdminReservationHeader from '../components/AdminReservationHeader'
import ReservationTable from '../components/ReservationTable'
import ReservationActionModal from '../components/ReservationActionModal'
import ConfirmDepositModal from '../components/ConfirmDepositModal'
import Pagination from '../../../../components/ui/Pagination'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'
import { ReservationStatus, RESERVATION_STATUS_CONFIG } from '../constants'

const statusTabs = [
  { key: 'ALL', label: 'Tất cả' },
  { key: ReservationStatus.PENDING_DEPOSIT, label: RESERVATION_STATUS_CONFIG.PENDING_DEPOSIT.label },
  { key: ReservationStatus.PENDING, label: RESERVATION_STATUS_CONFIG.PENDING.label },
  { key: ReservationStatus.CONFIRMED, label: RESERVATION_STATUS_CONFIG.CONFIRMED.label },
  { key: ReservationStatus.OCCUPIED, label: RESERVATION_STATUS_CONFIG.OCCUPIED.label },
  { key: ReservationStatus.COMPLETED, label: RESERVATION_STATUS_CONFIG.COMPLETED.label },
  { key: ReservationStatus.CANCELLED, label: RESERVATION_STATUS_CONFIG.CANCELLED.label },
  { key: ReservationStatus.REJECTED, label: RESERVATION_STATUS_CONFIG.REJECTED.label },
]

export const AdminReservationsPage = () => {
  const [reservations, setReservations] = useState([])
  const [tables, setTables] = useState([])
  const [activeTab, setActiveTab] = useState('ALL')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
    lastPage: 1,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState(null)

  // Action modal & Deposit modal
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [actionType, setActionType] = useState('CONFIRMED')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [depositModalItem, setDepositModalItem] = useState(null)
  const [isConfirmingDeposit, setIsConfirmingDeposit] = useState(false)

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 3000)
  }

  useEffect(() => {
    const loadTables = async () => {
      try {
        const res = await getAdminTablesApi()
        const list = res.data?.items || res.data || []
        setTables(Array.isArray(list) ? list : [])
      } catch {}
    }
    loadTables()
  }, [])

  const fetchReservations = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError(null)
      try {
        const params = { page, perPage: 10 }
        if (activeTab !== 'ALL') params.status = activeTab

        const res = await getAdminReservationsApi(params)
        const items = res.data?.items || res.data || []
        setReservations(Array.isArray(items) ? items : [])

        const pData = res?.data?.pagination || res?.pagination
        if (pData) {
          setPagination({
            currentPage: Number(pData.currentPage || page),
            perPage: Number(pData.perPage || 10),
            totalItems: Number(pData.totalItems || 0),
            lastPage: Number(pData.lastPage || pData.totalPages || 1),
          })
        } else {
          setPagination({
            currentPage: page,
            perPage: 10,
            totalItems: items.length,
            lastPage: Math.ceil(items.length / 10) || 1,
          })
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách đặt bàn.')
      } finally {
        setLoading(false)
      }
    },
    [activeTab]
  )

  useEffect(() => {
    fetchReservations(1)
  }, [fetchReservations])

  const handleOpenAction = (reservation, type) => {
    setSelectedReservation(reservation)
    setActionType(type)
  }

  const handleActionConfirm = async (payload) => {
    setIsSubmitting(true)
    try {
      await updateReservationStatusApi(payload.reservationId, {
        targetStatus: payload.targetStatus,
        tableId: payload.tableId,
        tableStatus: payload.tableStatus,
        adminNote: payload.adminNote,
      })

      const msgMap = {
        CONFIRMED: 'Đã duyệt đặt bàn thành công!',
        OCCUPIED: 'Khách đã vào bàn! Đơn đặt và Bàn ăn đã chuyển sang Đang có khách.',
        CANCELLED: 'Đã hủy lượt đặt bàn và giải phóng bàn!',
        REJECTED: 'Đã từ chối lượt đặt bàn!',
        COMPLETED: 'Đã hoàn tất lượt dùng bữa và giải phóng bàn ăn!',
      }
      const toastMsg = msgMap[payload.targetStatus] || (payload.tableStatus === 'OCCUPIED'
        ? 'Khách đã vào bàn! Bàn chuyển sang Đang có khách.'
        : 'Cập nhật đặt bàn thành công!')

      showToast(toastMsg)
      setSelectedReservation(null)
      fetchReservations(pagination.currentPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đặt bàn.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDeposit = async (reservationId) => {
    setIsConfirmingDeposit(true)
    try {
      await confirmDepositApi(reservationId)
      showToast(`Đã nhận cọc đặt bàn #${reservationId}! Bàn đã tự động chuyển sang ĐÃ ĐẶT (RESERVED).`)
      setDepositModalItem(null)
      fetchReservations(pagination.currentPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận tiền cọc.')
    } finally {
      setIsConfirmingDeposit(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminReservationHeader
        statusTabs={statusTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loading={loading}
        onRefresh={() => fetchReservations(pagination.currentPage)}
      />

      {successToast && (
        <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          action={
            <Button variant="outline" size="sm" onClick={() => fetchReservations(1)}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* 4 Trạng thái UI */}
      {loading ? (
        <div className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border-subtle">
          <Skeleton className="h-8 w-full bg-surface-subtle" />
          <Skeleton className="h-14 w-full bg-surface-subtle" />
          <Skeleton className="h-14 w-full bg-surface-subtle" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-surface-card/60 border border-border-subtle space-y-3">
          <CalendarCheck className="w-10 h-10 text-text-muted/40 mx-auto" />
          <p className="text-sm font-semibold text-text-main">Không có lượt đặt bàn nào</p>
          <p className="text-xs text-text-muted max-w-xs mx-auto">
            {activeTab !== 'ALL'
              ? 'Không có lượt đặt nào khớp với trạng thái này.'
              : 'Hiện chưa có khách nào gửi yêu cầu đặt bàn.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <ReservationTable
            reservations={reservations}
            onOpenAction={handleOpenAction}
            onOpenConfirmDeposit={(r) => setDepositModalItem(r)}
          />

          <Pagination
            currentPage={pagination.currentPage}
            lastPage={pagination.lastPage}
            totalItems={pagination.totalItems}
            itemLabel="lượt đặt bàn"
            onPageChange={(p) => fetchReservations(p)}
          />
        </div>
      )}

      {/* Action Modal (Duyệt/Vào bàn/Hoàn tất/Hủy) */}
      <ReservationActionModal
        isOpen={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onConfirm={handleActionConfirm}
        reservation={selectedReservation}
        tables={tables}
        actionType={actionType}
        isSubmitting={isSubmitting}
      />

      {/* Confirm Deposit Modal (Xác nhận cọc BKG-14) */}
      <ConfirmDepositModal
        isOpen={!!depositModalItem}
        onClose={() => setDepositModalItem(null)}
        onConfirm={handleConfirmDeposit}
        reservation={depositModalItem}
        isSubmitting={isConfirmingDeposit}
      />
    </div>
  )
}

export default AdminReservationsPage
