import { useState } from 'react'
import { Copy, UserPlus } from 'lucide-react'
import BottomSheet from './BottomSheet'
import QrCode from '../../../components/ui/QrCode'

/**
 * Mời bạn cùng bàn: mã bàn của phiên hiện tại và mã QR chứa sẵn mã đó (#code=…).
 * Chỉ thiết bị đã ở trong phiên mới nhận được mã từ backend.
 */
export const InviteSheet = ({ open, onClose, tableToken, joinCode, tableName }) => {
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${window.location.origin}/dine/${tableToken}#code=${joinCode}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Mời bạn cùng bàn" subtitle={`Người cùng ${tableName} quét mã dưới đây hoặc nhập mã bàn để gọi món chung.`} labelledBy="dine-invite-title">
      <div className="text-center">
        <p className="text-sm font-semibold text-[#625a55]">Mã bàn của bữa ăn này</p>
        <p className="mt-1 font-mono text-5xl font-bold tracking-[0.3em] text-[#6f1d32]" aria-label={`Mã bàn ${joinCode.split('').join(' ')}`}>{joinCode}</p>
        <div className="mt-5 flex justify-center rounded-[24px] border border-[var(--moc-line)] bg-white p-4">
          <QrCode value={inviteUrl} size={208} label="Mã QR mời bạn cùng bàn" />
        </div>
        <button type="button" onClick={copy} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#6f1d32]/35 text-[15px] font-semibold text-[#6f1d32]">
          <Copy className="h-4 w-4" /> {copied ? 'Đã sao chép link mời' : 'Sao chép link mời'}
        </button>
        <p className="mt-3 text-xs leading-5 text-[#625a55]">Mã đổi sau mỗi bữa ăn. Chỉ chia sẻ với người ngồi cùng bàn.</p>
      </div>
    </BottomSheet>
  )
}

export const InviteButton = ({ joinCode, onClick }) => (
  <button type="button" onClick={onClick} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#fff8ed]/15 px-4 text-sm font-semibold text-[#fff8ed] hover:bg-[#fff8ed]/25">
    <UserPlus className="h-4 w-4" /> Mời bạn cùng bàn · mã {joinCode}
  </button>
)

export default InviteSheet
