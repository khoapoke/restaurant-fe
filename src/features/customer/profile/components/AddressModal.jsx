import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import { User, Phone, MapPin } from 'lucide-react'

export const AddressModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    fullAddress: '',
    isDefault: false,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        recipientName: initialData.recipientName || '',
        recipientPhone: initialData.recipientPhone || '',
        fullAddress: initialData.fullAddress || '',
        isDefault: !!initialData.isDefault,
      })
    } else {
      setFormData({
        recipientName: '',
        recipientPhone: '',
        fullAddress: '',
        isDefault: false,
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!formData.recipientName.trim()) {
      errs.recipientName = 'Vui lòng nhập tên người nhận'
    }
    if (!formData.recipientPhone.trim()) {
      errs.recipientPhone = 'Vui lòng nhập số điện thoại người nhận'
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.recipientPhone.trim())) {
      errs.recipientPhone = 'Số điện thoại không đúng định dạng (10 số)'
    }
    if (!formData.fullAddress.trim()) {
      errs.fullAddress = 'Vui lòng nhập địa chỉ chi tiết'
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    onSave({
      addressId: initialData?.addressId || `addr_${Date.now()}`,
      recipientName: formData.recipientName.trim(),
      recipientPhone: formData.recipientPhone.trim(),
      fullAddress: formData.fullAddress.trim(),
      isDefault: formData.isDefault,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ giao hàng mới'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên người nhận"
          name="recipientName"
          value={formData.recipientName}
          onChange={handleChange}
          placeholder="Ví dụ: Nguyễn Văn A"
          icon={User}
          error={errors.recipientName}
          required
        />

        <Input
          label="Số điện thoại"
          name="recipientPhone"
          value={formData.recipientPhone}
          onChange={handleChange}
          placeholder="0987654321"
          icon={Phone}
          error={errors.recipientPhone}
          required
        />

        <Input
          label="Địa chỉ chi tiết"
          name="fullAddress"
          value={formData.fullAddress}
          onChange={handleChange}
          placeholder="Số nhà, ngõ/ngách, tên đường, phường/xã, quận/huyện..."
          icon={MapPin}
          error={errors.fullAddress}
          required
        />

        <div className="pt-2">
          <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-amber-500 focus:ring-amber-500/30 accent-amber-500 cursor-pointer"
            />
            <span>Đặt làm địa chỉ giao hàng mặc định</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
          <Button variant="ghost" size="md" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="md">
            Lưu địa chỉ
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddressModal
