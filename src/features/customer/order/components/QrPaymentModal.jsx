import { useState, useEffect, useRef } from 'react'
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
  Clock,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

export const QrPaymentModal = ({
  orderId,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isPaid, setIsPaid] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const [timeLeft, setTimeLeft] = useState(900) // 15 phút (giây)

  const pollingTimerRef = useRef(null)
  const countdownTimerRef = useRef(null)

  // 1. Sinh mã QR khi mở Modal
  useEffect(() => {
    if (!orderId || !isOpen) {
      setQrData(null)
      setError(null)
      setIsPaid(false)
      clearInterval(pollingTimerRef.current)
      clearInterval(countdownTimerRef.current)
      return
    }

    const loadQr = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await generateQrApi(orderId)
        setQrData(response.data)
        setTimeLeft(900)
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tạo mã QR thanh toán.')
      } finally {
        setLoading(false)
      }
    }

    loadQr()
  }, [orderId, isOpen])

  // 2. Countdown timer
  useEffect(() => {
    if (!isOpen || isPaid || !qrData) return

    countdownTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownTimerRef.current)
  }, [isOpen, isPaid, qrData])

  // 3. Auto-polling kiểm tra thanh toán
  useEffect(() => {
    if (!isOpen || !orderId || isPaid || timeLeft <= 0) return

    pollingTimerRef.current = setInterval(async () => {
      try {
        const res = await getPaymentStatusApi(orderId)
        const status = res.data?.status
        if (status === 'PAID') {
          setIsPaid(true)
          clearInterval(pollingTimerRef.current)
          onPaymentSuccess?.(orderId)
        }
      } catch {}
    }, 3500)

    return () => clearInterval(pollingTimerRef.current)
  }, [isOpen, orderId, isPaid, timeLeft, onPaymentSuccess])

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleRetry = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await retryPaymentApi(orderId)
      setQrData(response.data)
      setTimeLeft(900)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo lại mã QR.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thanh toán chuyển khoản VietQR"
      maxWidth="max-w-md"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-gray-400">Đang khởi tạo mã QR thanh toán...</p>
        </div>
      ) : isPaid ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Thanh toán thành công!</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Nhà hàng đã nhận được chuyển khoản cho đơn hàng #{orderId}. Bếp đang tiến hành chuẩn bị món ăn cho bạn.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={onClose} className="w-full">
            Hoàn tất & Xem đơn hàng
          </Button>
        </div>
      ) : error ? (
        <div className="py-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs text-red-400">{error}</p>
          <Button variant="secondary" size="sm" onClick={handleRetry} icon={RefreshCw}>
            Thử lại
          </Button>
        </div>
      ) : qrData ? (
        <div className="space-y-4">
          {/* Ảnh QR */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-700 shadow-xl relative">
            <img
              src={qrData.qrImageUrl}
              alt="Mã QR VietQR"
              className="w-56 h-56 object-contain"
            />
            <div className="mt-2 text-center text-gray-900 font-semibold text-xs flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-600" />
              <span>Quét bằng app ngân hàng bất kỳ</span>
            </div>
          </div>

          {/* Đếm ngược */}
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-gray-950 border border-gray-800">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Thời gian quét mã còn:
            </span>
            <span
              className={`font-mono font-bold ${
                timeLeft < 180 ? 'text-red-400 animate-pulse' : 'text-amber-400'
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Thông tin chuyển khoản */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-950 border border-gray-800">
              <div>
                <span className="text-gray-500 block text-[10px]">Số tiền thanh toán</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {Number(qrData.amount || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(qrData.amount, 'amount')}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                title="Sao chép số tiền"
              >
                {copiedField === 'amount' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-950 border border-gray-800">
              <div>
                <span className="text-gray-500 block text-[10px]">Nội dung chuyển khoản (bắt buộc)</span>
                <span className="font-mono font-bold text-gray-100 text-xs">
                  {qrData.transferContent}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(qrData.transferContent, 'content')}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                title="Sao chép nội dung"
              >
                {copiedField === 'content' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 text-center italic">
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

export default QrPaymentModal
