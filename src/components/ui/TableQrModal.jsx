import { useState } from 'react'
import { Copy, ExternalLink, Printer, RefreshCcw } from 'lucide-react'
import Modal from './Modal'
import QrCode from './QrCode'

/**
 * Mã QR gọi món tại bàn (Live Dining). Dùng chung cho POS và trang quản trị bàn.
 * `onRotate` (chỉ quản trị) tạo mã mới và vô hiệu hoá mã đã in.
 */
export const TableQrModal = ({ isOpen, onClose, tableName, url, issuedAt, onRotate, rotating = false }) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Mã QR gọi món · ${tableName || ''}`} maxWidth="max-w-md">
      <div className="grid gap-5">
        <div className="moc-print-area mx-auto w-full max-w-[300px] border border-[var(--moc-line)] bg-white p-5 text-center">
          <p className="moc-serif text-xl tracking-[0.2em] text-[#211b18]">MỘC</p>
          <p className="mt-1 text-xs tracking-[0.18em] text-[#625a55]">QUÉT ĐỂ GỌI MÓN TẠI BÀN</p>
          <div className="mt-4 flex justify-center">{url ? <QrCode value={url} size={220} label={`Mã QR gọi món ${tableName}`} /> : <div className="h-[220px] w-[220px] animate-pulse bg-[#eee6dc]" />}</div>
          <p className="mt-3 moc-serif text-2xl text-[#211b18]">{tableName}</p>
        </div>

        {url && (
          <div className="grid gap-2">
            <p className="break-all border border-[var(--moc-line)] bg-[#f5f0e7] px-3 py-2 font-mono text-xs text-[#3d2f2a]">{url}</p>
            {issuedAt && <p className="text-xs text-[#625a55]">Mã tạo lúc {new Date(issuedAt).toLocaleString('vi-VN')}</p>}
            {copied && <p className="text-xs font-semibold text-[#14532d]" role="status">Đã sao chép link</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button type="button" onClick={copy} disabled={!url} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--moc-line)] text-sm font-semibold text-[#211b18] hover:border-[#6f1d32]/40 disabled:opacity-50"><Copy className="h-4 w-4" /> Sao chép</button>
          <a href={url || undefined} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--moc-line)] text-sm font-semibold text-[#211b18] hover:border-[#6f1d32]/40"><ExternalLink className="h-4 w-4" /> Mở thử</a>
          <button type="button" onClick={() => window.print()} disabled={!url} className="moc-inverse col-span-2 inline-flex min-h-11 items-center justify-center gap-2 bg-[#6f1d32] text-sm font-semibold text-[#fff8ed] hover:bg-[#49101f] disabled:opacity-50 sm:col-span-1"><Printer className="h-4 w-4" /> In mã</button>
        </div>

        {onRotate && (
          <div className="border-t border-[var(--moc-line)] pt-4">
            <button type="button" onClick={onRotate} disabled={rotating} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#8a1c1c] disabled:opacity-50">
              <RefreshCcw className={`h-4 w-4 ${rotating ? 'animate-spin' : ''}`} /> Tạo mã mới (mã cũ ngừng hoạt động)
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default TableQrModal
