import { useState, useEffect } from 'react'
import { QrCode, X, Utensils, Loader2 } from 'lucide-react'
import { openDineInTableApi } from '../services/adminTableService'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import DineInQrResultView from './DineInQrResultView'

/**
 * Modal Phục Vụ Mở Bàn Ăn & Cấp Mã QR Gọi Món (DineInOpenModal)
 * Tuân thủ UC ORD-DINE-01 & Schema 4.2
 * 100% Centralized Design Tokens, dưới 250 dòng
 */
export const DineInOpenModal = ({ isOpen, table, onClose, onSuccess }) => {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const tableId = table?.tableId || table?.ma_ban
  const tableName = table?.tableName || table?.ten_ban || `Bàn #${tableId}`
  const tableStatus = table?.status || table?.trang_thai || 'AVAILABLE'

  // Nạp phiên mở bàn từ activeOrder của Backend (ưu tiên 1), sessionStorage (ưu tiên 2) hoặc tự đồng bộ nếu bàn đang OCCUPIED
  useEffect(() => {
    if (!isOpen || !tableId) return
    setError(null)

    if (table?.activeOrder?.orderId && (table?.activeOrder?.qrToken || table?.activeOrder?.qrCodeToken)) {
      setResult(table.activeOrder)
      sessionStorage.setItem(`T_RESMK_DINE_IN_TABLE_${tableId}`, JSON.stringify(table.activeOrder))
      return
    }

    const saved = sessionStorage.getItem(`T_RESMK_DINE_IN_TABLE_${tableId}`)
    if (saved) {
      try {
        setResult(JSON.parse(saved))
        return
      } catch {
        setResult(null)
      }
    }

    // Nếu bàn đang OCCUPIED (ví dụ khách đặt bàn vừa check-in "Vào bàn"), tự động lấy hoặc khởi tạo phiên QR từ BE
    if (tableStatus === 'OCCUPIED') {
      let isMounted = true
      setLoading(true)
      openDineInTableApi({ tableId: Number(tableId) })
        .then((res) => {
          if (!isMounted) return
          const data = res.data?.data || res.data
          setResult(data)
          sessionStorage.setItem(`T_RESMK_DINE_IN_TABLE_${tableId}`, JSON.stringify(data))
        })
        .catch((err) => {
          if (!isMounted) return
          setError(err.response?.data?.message || 'Không thể tải mã QR của bàn đang phục vụ.')
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
      return () => {
        isMounted = false
      }
    }

    setResult(null)
  }, [isOpen, tableId, tableStatus, table?.activeOrder])

  if (!isOpen || !table) return null

  const handleOpenTable = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        tableId: Number(tableId),
        note: note.trim() || undefined,
      }
      const res = await openDineInTableApi(payload)
      const data = res.data?.data || res.data
      setResult(data)
      sessionStorage.setItem(`T_RESMK_DINE_IN_TABLE_${tableId}`, JSON.stringify(data))
      if (onSuccess) onSuccess(data)
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        (typeof err.response?.data?.errors === 'string' ? err.response?.data?.errors : null) ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : null) ||
        err.message ||
        'Không thể mở bàn ăn tại chỗ. Vui lòng kiểm tra lại.'
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  // Trích xuất an toàn orderId và token để luôn trỏ về Frontend React
  let orderId = result?.orderId || result?.id || result?.ma_don_hang
  let token =
    result?.qrCodeToken ||
    result?.qr_code_token ||
    result?.token ||
    result?.qrToken ||
    result?.ma_truy_cap_ban

  if (!token && result?.qrCodeUrl) {
    try {
      const parsed = new URL(result.qrCodeUrl, window.location.origin)
      token = parsed.searchParams.get('token')
      if (!orderId) orderId = parsed.searchParams.get('orderId')
    } catch {}
  }

  const clientUrl = orderId && token
    ? `${window.location.origin}/dine-in?orderId=${orderId}&token=${token}`
    : (result?.qrCodeUrl || '')

  const qrImageSrc = clientUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(clientUrl)}&margin=10`
    : ''

  const handleCopyLink = () => {
    if (!clientUrl) return
    navigator.clipboard.writeText(clientUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleClose = () => {
    setNote('')
    setError(null)
    setCopied(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-surface-card border border-border-subtle rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-main">
                {result ? 'Mã QR Gọi Món Tại Bàn' : 'Mở Bàn Ăn Tại Chỗ'}
              </h3>
              <p className="text-xs text-text-muted">{tableName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card-hover transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
              className="text-xs"
            />
          )}

          {!result ? (
            <form onSubmit={handleOpenTable} className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-bg border border-border-subtle space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Bàn số:</span>
                  <span className="font-bold text-text-main">#{tableId} - {tableName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Sức chứa:</span>
                  <span className="font-bold text-text-main">{table.capacity || table.suc_chua || 4} khách</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Trạng thái:</span>
                  <span className="font-medium text-text-main">{table.status || table.trang_thai}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Ghi chú mở bàn (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Khách VIP, bàn ghép 6 người..."
                  className="w-full px-3.5 py-2 text-xs bg-surface-bg border border-border-subtle rounded-xl text-text-main placeholder:text-text-dim focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang mở bàn...</span>
                    </>
                  ) : (
                    <>
                      <Utensils className="w-4 h-4" />
                      <span>Xác nhận Mở bàn</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <DineInQrResultView
              tableName={tableName}
              orderId={orderId}
              qrImageSrc={qrImageSrc}
              clientUrl={clientUrl}
              copied={copied}
              onCopyLink={handleCopyLink}
              onClose={handleClose}
              onResetSession={() => {
                sessionStorage.removeItem(`T_RESMK_DINE_IN_TABLE_${tableId}`)
                setResult(null)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default DineInOpenModal
