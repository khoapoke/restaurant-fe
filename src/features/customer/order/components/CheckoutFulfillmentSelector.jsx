import { Truck, ShoppingBag, Check } from 'lucide-react'
import { FulfillmentType } from '../constants'

const FULFILLMENT_OPTIONS = [
  {
    type: FulfillmentType.DELIVERY,
    label: 'Giao tận nơi',
    subtitle: 'Giao món nóng hổi đến địa chỉ của bạn',
    icon: Truck,
  },
  {
    type: FulfillmentType.PICKUP,
    label: 'Nhận tại nhà hàng',
    subtitle: 'Đến quầy nhận món hoặc dùng bữa tại chỗ',
    icon: ShoppingBag,
  },
]

/**
 * Lựa Chọn Hình Thức Nhận Món (CheckoutFulfillmentSelector)
 * - Tinh tế Fine-Dining & Đồng bộ Enum Backend (DELIVERY / PICKUP)
 * - Độ dài < 65 dòng
 */
export default function CheckoutFulfillmentSelector({ selectedType, onSelectType }) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-serif font-bold text-text-main flex items-center gap-2">
          <Truck className="w-4 h-4 text-brand-primary" />
          <span>Hình thức nhận món</span>
        </h3>
        <span className="text-[11px] text-text-muted">Chọn 1 trong 2 hình thức</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FULFILLMENT_OPTIONS.map((item) => {
          const Icon = item.icon
          const isSelected = selectedType === item.type

          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onSelectType(item.type)}
              className={`relative p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'bg-brand-primary/10 border-brand-primary text-brand-primary ring-1 ring-brand-primary/30 shadow-sm'
                  : 'bg-surface-bg border-border-subtle text-text-muted hover:border-border-strong hover:text-text-main'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-primary' : 'text-text-muted'}`} />
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-brand-primary text-surface-bg flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-text-main">
                  {item.label}
                </p>
                <p className="text-[10px] text-text-muted leading-tight mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
