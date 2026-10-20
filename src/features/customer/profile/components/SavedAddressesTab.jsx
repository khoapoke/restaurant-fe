import { useState } from 'react'
import { Plus, MapPin, Phone, User, Check, Trash2, Edit3, MapPinOff } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import AddressModal from './AddressModal'

/**
 * Tab 3: Quản lý Sổ địa chỉ giao hàng
 */
export const SavedAddressesTab = ({
  addresses = [],
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefault,
  disabled = false,
}) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Sổ địa chỉ nhận hàng</h3>
          <p className="text-xs text-gray-400 mt-0.5">
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

      {/* Empty State */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-gray-800 bg-gray-900/30 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-800/80 flex items-center justify-center text-gray-500 mb-3">
            <MapPinOff className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-gray-300">Chưa có địa chỉ nào</h4>
          <p className="text-xs text-gray-500 max-w-sm mt-1 mb-5">
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
              className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-150 relative
                ${
                  addr.isDefault
                    ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/5'
                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                }
              `}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-bold text-gray-100">
                      {addr.recipientName}
                    </span>
                  </div>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Check className="w-3 h-3" /> Mặc định
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{addr.recipientPhone}</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-300 pt-1 border-t border-gray-800/80">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
                  <span className="leading-relaxed">{addr.fullAddress}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-gray-800/60 text-xs">
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={() => onSetDefault(addr.addressId)}
                    disabled={disabled}
                    className="text-amber-400 hover:text-amber-300 transition-colors font-medium cursor-pointer"
                  >
                    Đặt làm mặc định
                  </button>
                ) : (
                  <span className="text-gray-500 text-[11px]">Địa chỉ giao chính</span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    disabled={disabled}
                    className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800 cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteAddress(addr.addressId)}
                    disabled={disabled}
                    className="p-1.5 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/10 cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingAddress}
      />
    </div>
  )
}

export default SavedAddressesTab
