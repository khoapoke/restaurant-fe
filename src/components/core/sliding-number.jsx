import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { cn } from '@/lib/utils'

// 2 chu kỳ số đầy đủ (0..9 và 0..9) để tạo hiệu ứng quay bánh xe cơ học đa vòng
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/**
 * Cột con lăn đơn lẻ cho một chữ số (0 - 9)
 * Hỗ trợ quay lướt qua ít nhất 1 vòng đầy đủ để mọi chữ số (kể cả số 0) đều chuyển động sống động
 */
function SlidingDigit({ digit, transition, active = true, multiCycle = true }) {
  const num = Number(digit)
  // Nếu bật multiCycle, bánh xe sẽ cuộn 1 vòng (10 nấc) rồi mới dừng lại ở chữ số đích
  const targetIndex = multiCycle ? 10 + num : num

  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden align-baseline">
      <motion.span
        className="absolute inset-0 flex flex-col items-center"
        initial={{ y: '0em' }}
        animate={{ y: active ? `-${targetIndex}em` : '0em' }}
        transition={transition}
      >
        {NUMBERS.map((n, idx) => (
          <span
            key={idx}
            className="flex h-[1em] w-full items-center justify-center leading-none select-none"
          >
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

/**
 * SlidingNumber Component (Motion-Primitives)
 * Hiệu ứng con lăn cơ học (Odometer / Ticker Rolling) cho từng chữ số độc lập
 * Tự động nhận diện Viewport và quay bánh xe đa vòng ấn tượng khi cuộn tới
 * Chuyển đổi từ TSX sang JSX chuẩn cho React 19 + Motion v14
 *
 * @param {Object} props
 * @param {number|string} props.value - Giá trị số hoặc chuỗi số kèm ký tự (ví dụ: 15000, "15.000+", "4.9 / 5.0", "100%")
 * @param {string} [props.className] - Class CSS tùy biến
 * @param {Object} [props.transition] - Cấu hình transition (spring, duration, bounce)
 * @param {number} [props.stagger=0.05] - Độ trễ so le giữa các chữ số liên tiếp (giây)
 * @param {boolean} [props.inView=true] - Kích hoạt hiệu ứng khi cuộn vào tầm mắt
 * @param {boolean} [props.multiCycle=true] - Quay trọn 1 vòng bánh xe trước khi đáp số
 * @param {Object} [props.viewOptions] - Cấu hình useInView ({ once: true, margin: '0px 0px -60px 0px' })
 */
export function SlidingNumber({
  value,
  className,
  transition = { type: 'spring', bounce: 0.15, duration: 2.0 },
  stagger = 0.05,
  inView = true,
  multiCycle = true,
  viewOptions = { once: true, margin: '0px 0px -60px 0px' },
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, viewOptions)
  const shouldAnimate = inView ? isInView : true

  const stringValue = String(value ?? '')
  const characters = stringValue.split('')

  return (
    <span
      ref={ref}
      className={cn('inline-flex items-baseline tabular-nums leading-none select-none', className)}
    >
      {characters.map((char, index) => {
        const isDigit = /^[0-9]$/.test(char)

        if (!isDigit) {
          return (
            <span key={index} className="inline-block leading-none">
              {char}
            </span>
          )
        }

        const digitTransition = {
          ...transition,
          delay: (transition?.delay || 0) + index * stagger,
        }

        return (
          <SlidingDigit
            key={index}
            digit={char}
            transition={digitTransition}
            active={shouldAnimate}
            multiCycle={multiCycle}
          />
        )
      })}
    </span>
  )
}

export default SlidingNumber

