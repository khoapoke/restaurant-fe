import { User, Mail, Phone, Calendar, MapPin, Lock } from 'lucide-react'
import Input from '../../../../components/ui/Input'

/**
 * Tab 1: Thông tin cá nhân & Tài khoản (ProfileInfoTab)
 * - Quản lý họ tên, email, SĐT, ngày sinh và địa chỉ mặc định
 * - Đồng bộ Centralized Design Tokens
 * - Độ dài < 105 dòng
 */
export default function ProfileInfoTab({
  formData = {},
  onChange,
  errors = {},
  disabled = false,
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border-subtle pb-4">
        <h3 className="text-base font-serif font-bold text-text-main flex items-center gap-2">
          <User className="w-4 h-4 text-brand-primary" />
          <span>Thông tin cá nhân & Tài khoản</span>
        </h3>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          Quản lý họ tên, số điện thoại và địa chỉ email liên hệ để nhận hóa đơn và thông báo đặt bàn.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Username - Cố định không cho sửa */}
        <Input
          label="Tên đăng nhập"
          name="username"
          value={formData.username || ''}
          icon={User}
          disabled={true}
          helperText="Tên tài khoản cố định của bạn trong hệ thống"
          rightElement={<Lock className="w-3.5 h-3.5 text-text-muted" />}
        />

        {/* Email */}
        <Input
          label="Địa chỉ Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={onChange}
          icon={Mail}
          error={errors.email}
          required
          disabled={disabled}
          placeholder="example@domain.com"
        />

        {/* Họ và tên */}
        <Input
          label="Họ và tên"
          name="fullName"
          value={formData.fullName || ''}
          onChange={onChange}
          icon={User}
          error={errors.fullName}
          required
          disabled={disabled}
          placeholder="Nguyễn Văn A"
        />

        {/* Số điện thoại */}
        <Input
          label="Số điện thoại"
          name="phoneNumber"
          value={formData.phoneNumber || ''}
          onChange={onChange}
          icon={Phone}
          error={errors.phoneNumber}
          required
          disabled={disabled}
          placeholder="0987654321"
        />

        {/* Ngày sinh */}
        <Input
          label="Ngày sinh"
          name="birthDate"
          type="date"
          value={formData.birthDate || ''}
          onChange={onChange}
          icon={Calendar}
          error={errors.birthDate}
          disabled={disabled}
          helperText="Nhận ưu đãi ẩm thực đặc biệt vào tháng sinh nhật"
        />

        {/* Địa chỉ mặc định */}
        <Input
          label="Địa chỉ giao hàng mặc định"
          name="defaultAddress"
          value={formData.defaultAddress || ''}
          onChange={onChange}
          icon={MapPin}
          error={errors.defaultAddress}
          disabled={disabled}
          placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
        />
      </div>
    </div>
  )
}
