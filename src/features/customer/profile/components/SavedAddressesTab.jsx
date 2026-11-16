import { useState } from 'react'
import { Plus, MapPin, Phone, User, Check, Trash2, Edit3, MapPinOff } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import AddressModal from './AddressModal'

/**
 * Tab 3: Quản lý Sổ địa chỉ giao hàng (SavedAddressesTab)
 * - Tinh tế Fine-Dining & Đồng bộ Centralized Design Tokens
 * - Độ dài < 155 dòng
 */
export default function SavedAddressesTab({
  addresses = [],
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefault,
  disabled = false,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  const handleOpenAdd = () => {
    setEditingAddress(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr)
    setIsModalOpen(true)
  }

  const handleSaveModal = (addrData) => {
    if (editingAddress) {
      onUpdateAddress(addrData)
    } else {
      onAddAddress(addrData)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h3 className="text-base font-serif font-bold text-text-main flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-primary" />
            <span>Sổ địa chỉ nhận hàng</span>
          </h3>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Lưu sẵn các địa chỉ nhà riêng, công ty để đặt món giao tận nơi nhanh chóng hơn.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={Plus}
          onClick={handleOpenAdd}
          disabled={disabled}
        >
          Thêm địa chỉ mới
        </Button>
      </div>

      {/* Trạng thái trống */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-border-subtle bg-surface-bg/50 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-surface-card border border-border-subtle flex items-center justify-center text-text-muted mb-3">
            <MapPinOff className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-text-main">Chưa có địa chỉ nào</h4>
          <p className="text-xs text-text-muted mt-1 mb-5 leading-relaxed">
            Bạn chưa lưu địa chỉ nhận món nào. Hãy thêm địa chỉ để hệ thống tự động điền khi thanh toán.
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
            Thêm địa chỉ đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.addressId}
              className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-150 relative ${
                addr.isDefault
                  ? 'bg-brand-primary/5 border-brand-primary/50 shadow-sm'
                  : 'bg-surface-bg border-border-subtle hover:border-border-strong'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-sm font-bold text-text-main">
                      {addr.recipientName}
                    </span>
                  </div>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
                      <Check className="w-3 h-3 stroke-[3]" /> Mặc định
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{addr.recipientPhone}</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-text-main pt-2 border-t border-border-subtle">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-primary mt-0.5" />
                  <span className="leading-relaxed">{addr.fullAddress}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-border-subtle text-xs">
                <div>
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => onSetDefault(addr.addressId)}
                      disabled={disabled}
                      className="text-brand-primary hover:underline transition-colors font-medium cursor-pointer"
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    disabled={disabled}
                    className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface-card rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa địa chỉ"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteAddress(addr.addressId)}
                    disabled={disabled}
                    className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-lg transition-colors cursor-pointer"
                    title="Xóa địa chỉ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm / Sửa Địa chỉ */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingAddress}
      />
    </div>
  )
}
