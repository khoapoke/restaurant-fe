import { useState, useEffect, useCallback } from 'react'
import { CalendarCheck, RefreshCw } from 'lucide-react'
import {
  getAdminReservationsApi,
  getAdminTablesApi,
  updateReservationStatusApi,
} from '../services/adminTableService'
import ReservationTable from '../components/ReservationTable'
import ReservationActionModal from '../components/ReservationActionModal'
import Pagination from '../../../../components/ui/Pagination'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'
import { ReservationStatus, RESERVATION_STATUS_CONFIG } from '../constants'

const statusTabs = [
  { key: 'ALL', label: 'Tất cả' },
  { key: ReservationStatus.PENDING, label: RESERVATION_STATUS_CONFIG.PENDING.label },
  { key: ReservationStatus.CONFIRMED, label: RESERVATION_STATUS_CONFIG.CONFIRMED.label },
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

  // Action modal
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [actionType, setActionType] = useState('CONFIRMED')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        CANCELLED: 'Đã hủy lượt đặt bàn và giải phóng bàn!',
        REJECTED: 'Đã từ chối lượt đặt bàn!',
        COMPLETED: 'Đã hoàn tất lượt dùng bữa và giải phóng bàn ăn!',
      }
      const toastMsg = payload.tableStatus === 'OCCUPIED'
        ? 'Khách đã vào bàn! Bàn chuyển sang Đang có khách.'
        : msgMap[payload.targetStatus] || 'Cập nhật đặt bàn thành công!'

      showToast(toastMsg)
      setSelectedReservation(null)
      fetchReservations(pagination.currentPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đặt bàn.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-main">Điều phối Đặt bàn</h2>
            <p className="text-xs text-text-muted">
              Tiếp nhận, gán bàn và quản lý các lượt khách đặt trước
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          isLoading={loading}
          onClick={() => fetchReservations(pagination.currentPage)}
        >
          Làm mới
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.key
                ? 'bg-brand-primary text-text-inverse font-bold shadow-sm shadow-brand-primary/20'
                : 'bg-surface-card text-text-muted hover:text-text-main border border-border-subtle hover:border-border-default'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

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

      {/* Action Modal */}
      <ReservationActionModal
        isOpen={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onConfirm={handleActionConfirm}
        reservation={selectedReservation}
        tables={tables}
        actionType={actionType}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default AdminReservationsPage
