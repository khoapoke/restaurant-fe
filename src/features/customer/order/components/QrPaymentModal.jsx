import { useState, useEffect, useRef, useCallback } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import {
  generateQrApi,
  getPaymentStatusApi,
  retryPaymentApi,
} from '../services/orderService'
import {
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import QrCountdownTimer from './QrCountdownTimer'

/**
 * Modal Thanh Toán Chuyển Khoản VietQR (QrPaymentModal)
 * - Tối ưu hóa render & cô lập bộ đếm thời gian
 * - Đồng bộ Centralized Design Tokens
 * - Độ dài < 170 dòng
 */
export default function QrPaymentModal({
  orderId,
  isOpen,
  onClose,
  onPaymentSuccess,
}) {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isPaid, setIsPaid] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const pollingTimerRef = useRef(null)

  // 1. Sinh mã QR khi mở Modal
  useEffect(() => {
    if (!orderId || !isOpen) {
      setQrData(null)
      setError(null)
      setIsPaid(false)
      clearInterval(pollingTimerRef.current)
      return
    }

    const loadQr = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await generateQrApi(orderId)
        setQrData(response.data?.data || response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tạo mã QR thanh toán.')
      } finally {
        setLoading(false)
      }
    }
    loadQr()
  }, [orderId, isOpen])

  // 2. Auto-polling kiểm tra thanh toán mỗi 3.5 giây
  useEffect(() => {
    if (!isOpen || !orderId || isPaid) return
    pollingTimerRef.current = setInterval(async () => {
      try {
        const res = await getPaymentStatusApi(orderId)
        const paymentData = res.data?.data || res.data
        if (paymentData?.status === 'PAID' || paymentData?.isPaid === true) {
          setIsPaid(true)
          clearInterval(pollingTimerRef.current)
          onPaymentSuccess?.(orderId)
        }
      } catch {}
    }, 3500)

    return () => clearInterval(pollingTimerRef.current)
  }, [isOpen, orderId, isPaid, onPaymentSuccess])

  const handleCopy = useCallback((text, fieldName) => {
    navigator.clipboard.writeText(String(text || ''))
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  const handleRetry = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await retryPaymentApi(orderId)
      setQrData(response.data?.data || response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo lại mã QR.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thanh toán chuyển khoản VietQR" maxWidth="max-w-md">
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-xs text-text-muted">Đang khởi tạo mã QR thanh toán...</p>
        </div>
      ) : isPaid ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-status-success/15 text-status-success border border-status-success/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-bold text-text-main">Thanh toán thành công!</h3>
            <p className="text-xs text-text-muted max-w-xs leading-relaxed">
              Nhà hàng đã nhận được chuyển khoản cho đơn hàng #{orderId}. Bếp đang tiến hành chuẩn bị món ăn cho bạn.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={onClose} className="w-full">
            Hoàn tất & Xem đơn hàng
          </Button>
        </div>
      ) : error ? (
        <div className="py-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-status-error mx-auto" />
          <p className="text-xs text-status-error">{error}</p>
          <Button variant="secondary" size="sm" onClick={handleRetry} icon={RefreshCw}>
            Thử lại
          </Button>
        </div>
      ) : qrData ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-brand-primary/40 shadow-xl shadow-brand-primary/5">
            <img src={qrData.qrImageUrl || qrData.qrCodeUrl} alt="Mã QR VietQR" className="w-56 h-56 object-contain" />
            <div className="mt-2 text-center text-zinc-900 font-semibold text-xs flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-brand-primary" />
              <span>Quét bằng app ngân hàng bất kỳ</span>
            </div>
          </div>

          <QrCountdownTimer initialSeconds={900} onExpire={() => {}} />

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-bg border border-border-subtle">
              <div>
                <span className="text-text-muted block text-[10px]">Số tiền thanh toán</span>
                <span className="font-mono font-bold text-brand-primary text-sm">
                  {Number(qrData.amount || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(qrData.amount, 'amount')}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card transition-colors cursor-pointer"
                title="Sao chép số tiền"
              >
                {copiedField === 'amount' ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-bg border border-border-subtle">
              <div>
                <span className="text-text-muted block text-[10px]">Nội dung chuyển khoản (bắt buộc)</span>
                <span className="font-mono font-bold text-text-main text-xs">{qrData.transferContent}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(qrData.transferContent, 'content')}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card transition-colors cursor-pointer"
                title="Sao chép nội dung"
              >
                {copiedField === 'content' ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-text-muted text-center italic">
            Hệ thống đang tự động lắng nghe kết quả chuyển khoản...
          </p>
          <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
            Đóng cửa sổ (sẽ thanh toán sau)
          </Button>
        </div>
      ) : null}
    </Modal>
  )
}
