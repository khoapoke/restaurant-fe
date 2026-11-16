import { useState, useEffect, useCallback } from 'react'
import { CreditCard, RefreshCw, CheckCheck } from 'lucide-react'
import {
  getAdminPaymentsApi,
  reconcilePaymentApi,
  refundPaymentApi,
} from '../services/adminOrderService'
import PaymentTable from '../components/PaymentTable'
import RefundModal from '../components/RefundModal'
import Pagination from '../../../../components/ui/Pagination'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'

/**
 * Trang Quản Lý Thanh Toán & Đối Soát (AdminPaymentsPage)
 * - 100% Centralized Design Tokens
 * - Quản lý an toàn 4 trạng thái UI (Loading, Error, Empty, Data)
 * - Độ dài < 170 dòng
 */
export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, perPage: 10, totalItems: 0, lastPage: 1 })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState(null)

  // Modals state
  const [refundingPayment, setRefundingPayment] = useState(null)
  const [isRefunding, setIsRefunding] = useState(false)
  const [isReconciling, setIsReconciling] = useState(false)

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 3000)
  }

  const fetchPayments = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminPaymentsApi({ page, perPage: 10 })
      const items = res.data?.items || res.data || []
      setPayments(Array.isArray(items) ? items : [])

      const pData = res?.data?.pagination || res?.pagination
      if (pData) {
        setPagination({
          currentPage: Number(pData.currentPage || page),
          perPage: Number(pData.perPage || 10),
          totalItems: Number(pData.totalItems || 0),
          lastPage: Number(pData.lastPage || pData.totalPages || 1),
        })
      } else {
        setPagination({ currentPage: page, perPage: 10, totalItems: items.length, lastPage: Math.ceil(items.length / 10) || 1 })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách giao dịch thanh toán.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPayments(1) }, [fetchPayments])

  const handleReconcile = async () => {
    setIsReconciling(true)
    try {
      await reconcilePaymentApi()
      showToast('Đã đối soát số tiền thành công!')
      fetchPayments(pagination.currentPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thực hiện đối soát số tiền.')
    } finally {
      setIsReconciling(false)
    }
  }

  const handleRefundConfirm = async (paymentId, refundReason) => {
    setIsRefunding(true)
    try {
      await refundPaymentApi(paymentId, refundReason)
      showToast(`Đã ghi nhận hoàn tiền cho giao dịch #${paymentId}!`)
      setRefundingPayment(null)
      fetchPayments(pagination.currentPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hoàn tiền cho giao dịch này.')
    } finally {
      setIsRefunding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-main">Giao dịch Thanh toán</h2>
            <p className="text-xs text-text-muted">Tổng số {pagination.totalItems} giao dịch VietQR & Tiền mặt</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            isLoading={loading}
            onClick={() => fetchPayments(pagination.currentPage)}
          >
            Làm mới
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={CheckCheck}
            isLoading={isReconciling}
            onClick={handleReconcile}
            title="Tự động kiểm tra trạng thái ngân hàng và đồng bộ giao dịch"
          >
            Đối soát số tiền
          </Button>
        </div>
      </div>

      {successToast && <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />}
      {error && <Alert type="error" message={error} action={<Button variant="outline" size="sm" onClick={() => fetchPayments(1)}>Thử lại</Button>} />}

      {/* 4 Trạng thái UI */}
      {loading ? (
        <div className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border-subtle">
          <Skeleton className="h-8 w-full bg-surface-card-hover" />
          <Skeleton className="h-14 w-full bg-surface-card-hover" />
          <Skeleton className="h-14 w-full bg-surface-card-hover" />
        </div>
      ) : payments.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-surface-card border border-border-subtle space-y-3">
          <CreditCard className="w-10 h-10 text-text-dim mx-auto" />
          <p className="text-sm font-semibold text-text-main">Chưa có giao dịch thanh toán nào</p>
          <p className="text-xs text-text-muted max-w-xs mx-auto">Các giao dịch phát sinh từ đơn hàng sẽ hiển thị tại đây.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <PaymentTable payments={payments} onOpenRefund={(p) => setRefundingPayment(p)} />
          <Pagination
            currentPage={pagination.currentPage}
            lastPage={pagination.lastPage}
            totalItems={pagination.totalItems}
            itemLabel="giao dịch"
            onPageChange={(p) => fetchPayments(p)}
          />
        </div>
      )}

      {/* Modal Hoàn tiền */}
      <RefundModal
        isOpen={Boolean(refundingPayment)}
        onClose={() => setRefundingPayment(null)}
        onConfirm={handleRefundConfirm}
        payment={refundingPayment}
        isRefunding={isRefunding}
      />
    </div>
  )
}

export default AdminPaymentsPage
