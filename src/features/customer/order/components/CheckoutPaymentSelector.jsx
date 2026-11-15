import { QrCode, Banknote, CreditCard, Check } from 'lucide-react'
import { PaymentMethod } from '../constants'

const PAYMENT_OPTIONS = [
  {
    method: PaymentMethod.BANK_TRANSFER_QR,
    label: 'Chuyển khoản VietQR',
    desc: 'Quét mã QR tự động xác nhận đơn tức thì',
    icon: QrCode,
    badge: 'Khuyên dùng',
  },
  {
    method: PaymentMethod.CASH,
    label: 'Tiền mặt khi nhận',
    desc: 'Thanh toán trực tiếp khi nhận món ăn',
    icon: Banknote,
    badge: null,
  },
]

/**
 * Lựa Chọn Phương Thức Thanh Toán (CheckoutPaymentSelector)
 * - Tinh tế Fine-Dining & Design Tokens
 * - Độ dài < 75 dòng
 */
export default function CheckoutPaymentSelector({ selectedMethod, onSelectMethod }) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-serif font-bold text-text-main flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-primary" />
          <span>Phương thức thanh toán</span>
        </h3>
        <span className="text-[11px] text-text-muted">An toàn & bảo mật</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PAYMENT_OPTIONS.map((item) => {
          const Icon = item.icon
          const isSelected = selectedMethod === item.method

          return (
            <button
              key={item.method}
              type="button"
              onClick={() => onSelectMethod(item.method)}
              className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-brand-primary/10 border-brand-primary text-brand-primary ring-1 ring-brand-primary/30 shadow-sm'
                  : 'bg-surface-bg border-border-subtle text-text-muted hover:border-border-strong hover:text-text-main'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-brand-primary/20 text-brand-primary' : 'bg-surface-card border border-border-subtle text-text-muted'}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-text-main truncate">
                    {item.label}
                  </h4>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-tight">
                  {item.desc}
                </p>
              </div>

              {isSelected && (
                <span className="w-4 h-4 rounded-full bg-brand-primary text-surface-bg flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

