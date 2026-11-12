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

export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
    lastPage: 1,
  })

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

      const paginationData = res?.data?.pagination || res?.pagination
      if (paginationData) {
        setPagination({
          currentPage: Number(paginationData.currentPage || page),
          perPage: Number(paginationData.perPage || 10),
          totalItems: Number(paginationData.totalItems || 0),
          lastPage: Number(paginationData.lastPage || paginationData.totalPages || 1),
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
      setError(err.response?.data?.message || 'Không thể tải danh sách giao dịch thanh toán.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments(1)
  }, [fetchPayments])

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Giao dịch Thanh toán</h2>
            <p className="text-xs text-gray-400">
              Tra cứu lịch sử thu tiền VietQR / Tiền mặt và xử lý hoàn tiền
            </p>
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
          >
            Đối soát số tiền
          </Button>
        </div>
      </div>

      {successToast && (
        <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          action={
            <Button variant="outline" size="sm" onClick={() => fetchPayments(1)}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* 4 Trạng thái UI */}
      {loading ? (
        <div className="space-y-3 p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
          <Skeleton className="h-8 w-full bg-gray-800" />
          <Skeleton className="h-14 w-full bg-gray-800" />
          <Skeleton className="h-14 w-full bg-gray-800" />
          <Skeleton className="h-14 w-full bg-gray-800" />
        </div>
      ) : payments.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-gray-900/40 border border-gray-800 space-y-3">
          <CreditCard className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">Chưa có giao dịch thanh toán nào</p>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Khi khách hàng đặt đơn và thực hiện thanh toán, các bản ghi sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <PaymentTable
            payments={payments}
            onOpenRefund={(p) => setRefundingPayment(p)}
          />

          <Pagination
            currentPage={pagination.currentPage}
            lastPage={pagination.lastPage}
            totalItems={pagination.totalItems}
            itemLabel="giao dịch"
            onPageChange={(p) => fetchPayments(p)}
          />
        </div>
      )}

      {/* Modal Refund */}
      <RefundModal
        isOpen={!!refundingPayment}
        onClose={() => setRefundingPayment(null)}
        onConfirm={handleRefundConfirm}
        payment={refundingPayment}
        isRefunding={isRefunding}
      />
    </div>
  )
}

export default AdminPaymentsPage

