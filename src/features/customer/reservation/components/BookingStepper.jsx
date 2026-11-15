import { Check } from 'lucide-react'

/**
 * Thanh Tiến Trình Đặt Bàn 4 Giai Đoạn (BookingStepper)
 * - Hiển thị trực quan 4 bước: Ngày & Khách -> Giờ & Bàn -> Xác nhận -> Hoàn tất
 * - Chuẩn Design Tokens, Responsive Desktop/Mobile, độ dài < 75 dòng
 */
export default function BookingStepper({ currentStep = 1 }) {
  const steps = [
    { number: 1, title: 'Ngày & Khách' },
    { number: 2, title: 'Giờ & Chọn bàn' },
    { number: 3, title: 'Xác nhận' },
    { number: 4, title: 'Hoàn tất' },
  ]

  return (
    <div className="w-full pb-6 border-b border-border-subtle">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto px-2">
        {/* Đường nối tiến trình */}
        <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 bg-border-subtle z-0">
          <div
            className="h-full bg-brand-primary transition-all duration-500 ease-out"
            style={{
              width: `${((Math.min(currentStep, 4) - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Các nút mốc tiến trình */}
        {steps.map((step) => {
          const isCompleted = currentStep > step.number
          const isCurrent = currentStep === step.number

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-brand-primary text-surface-bg'
                    : isCurrent
                    ? 'bg-surface-bg border-2 border-brand-primary text-brand-primary ring-4 ring-brand-primary/15'
                    : 'bg-surface-card border border-border-subtle text-text-muted'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>

              <span
                className={`text-[11px] font-medium mt-2 transition-colors text-center hidden sm:block ${
                  isCurrent
                    ? 'text-brand-primary font-semibold'
                    : isCompleted
                    ? 'text-text-main'
                    : 'text-text-muted'
                }`}
              >
                {step.title}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

