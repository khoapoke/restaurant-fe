import { User, Phone, MapPin, FileText, Info } from 'lucide-react'
import Input from '../../../../components/ui/Input'
import { FulfillmentType } from '../constants'

/**
 * Form Thông Tin Người Nhận & Giao Hàng (CheckoutRecipientForm)
 * - Tự động điền dữ liệu người dùng
 * - Đồng bộ Centralized Design Tokens
 * - Độ dài < 95 dòng
 */
export default function CheckoutRecipientForm({
  formData,
  onChange,
  errors = {},
  fulfillmentType,
}) {
  const isDelivery = fulfillmentType === FulfillmentType.DELIVERY

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-serif font-bold text-text-main flex items-center gap-2">
          <User className="w-4 h-4 text-brand-primary" />
          <span>Thông tin người nhận & Địa chỉ</span>
        </h3>
        <span className="text-[11px] text-text-muted">Đã điền từ hồ sơ</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Họ tên người nhận"
          name="recipientName"
          value={formData.recipientName}
          onChange={onChange}
          error={errors.recipientName}
          icon={User}
          placeholder="Nhập họ và tên"
          required
        />

        <Input
          label="Số điện thoại liên hệ"
          name="recipientPhone"
          value={formData.recipientPhone}
          onChange={onChange}
          error={errors.recipientPhone}
          icon={Phone}
          placeholder="Số điện thoại di động"
          required
        />

        {isDelivery ? (
          <div className="sm:col-span-2">
            <Input
              label="Địa chỉ giao hàng chi tiết"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={onChange}
              error={errors.shippingAddress}
              icon={MapPin}
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
              required
            />
          </div>
        ) : (
          <div className="sm:col-span-2 p-3 rounded-xl bg-surface-bg border border-border-subtle flex items-start gap-2.5 text-xs text-text-muted">
            <Info className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Bạn chọn <strong className="text-text-main font-semibold">Nhận tại nhà hàng</strong>. Món ăn sẽ được nhà hàng chuẩn bị sẵn sàng phục vụ tại cơ sở chính (T-ResMK Restaurant).
            </p>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-text-main flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-brand-primary" />
            <span>Ghi chú</span>
            <span className="text-text-muted text-[11px] font-normal">(Không bắt buộc)</span>
          </label>
          <textarea
            name="orderNote"
            value={formData.orderNote}
            onChange={onChange}
            rows={2}
            placeholder="Ví dụ: Gọi điện trước khi giao, ít đá, không hành..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-input border border-border-subtle text-xs text-text-main placeholder-text-muted outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  )
}

