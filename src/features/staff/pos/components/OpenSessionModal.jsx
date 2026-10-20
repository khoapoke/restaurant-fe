import { useState } from 'react'
import { Minus, Plus, UsersRound } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'

export const OpenSessionModal = ({ table, isOpen, onClose, onConfirm, isSubmitting, error }) => {
  const [guestCount, setGuestCount] = useState(() => Math.min(2, table?.capacity || 1))

  if (!table) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Mở phiên · ${table.tableName}`} maxWidth="max-w-md">
      <div className="space-y-6">
        {error && <Alert type="error" message={error} />}
        <div className="p-4 bg-[#f5f0e7] border border-[var(--moc-line)]">
          <p className="text-sm font-semibold">{table.location}</p>
          <p className="mt-1 text-xs text-[#766e68]">Sức chứa tối đa {table.capacity} khách</p>
        </div>

        <div>
          <label className="text-xs font-bold tracking-[0.08em] uppercase text-[#766e68]">Số khách thực tế</label>
          <div className="mt-3 flex items-center justify-between border border-[var(--moc-line)] bg-white p-2">
            <button type="button" onClick={() => setGuestCount((value) => Math.max(1, value - 1))} disabled={guestCount <= 1} className="w-11 h-11 grid place-items-center hover:bg-[#f5f0e7] disabled:opacity-30">
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <UsersRound className="w-5 h-5 text-[#6f1d32]" />
              <strong className="moc-serif text-3xl font-medium">{guestCount}</strong>
            </div>
            <button type="button" onClick={() => setGuestCount((value) => Math.min(table.capacity, value + 1))} disabled={guestCount >= table.capacity} className="w-11 h-11 grid place-items-center hover:bg-[#f5f0e7] disabled:opacity-30">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Để sau</Button>
          <Button variant="primary" onClick={() => onConfirm(guestCount)} isLoading={isSubmitting}>Xác nhận mở bàn</Button>
        </div>
      </div>
    </Modal>
  )
}

export default OpenSessionModal
