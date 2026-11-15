import { ShoppingBag, CreditCard, CheckCircle2 } from 'lucide-react'

/**
 * Thanh Chỉ Báo Tiến Trình Đặt Hàng (CartOrderFlow)
 * - Hiển thị 3 chặng mua sắm: 1. Giỏ hàng (Đang chọn) -> 2. Thanh toán -> 3. Hoàn tất
 * - Chuẩn Design Tokens, độ dài < 60 dòng
 */
export default function CartOrderFlow({ currentStep = 1 }) {
  const steps = [
    { number: 1, label: 'Giỏ hàng', icon: ShoppingBag },
    { number: 2, label: 'Thanh toán & Giao nhận', icon: CreditCard },
    { number: 3, label: 'Hoàn tất đơn', icon: CheckCircle2 },
  ]

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-2 text-xs">
      {steps.map((step, idx) => {
        const Icon = step.icon
        const isCurrent = currentStep === step.number
        const isCompleted = currentStep > step.number

        return (
          <div key={step.number} className="flex items-center gap-2 sm:gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                isCurrent
                  ? 'bg-surface-card border-brand-primary text-brand-primary font-semibold shadow-sm'
                  : isCompleted
                  ? 'bg-surface-card border-border-subtle text-text-main'
                  : 'bg-surface-bg border-border-subtle text-text-muted opacity-60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.number}</span>
            </div>

            {idx < steps.length - 1 && (
              <span className="text-border-strong text-xs select-none">&rarr;</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

