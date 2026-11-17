import { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform, useInView } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * AnimatedNumber Component (Motion-Primitives)
 * Đếm số tăng/giảm mượt mà với chuyển động lò xo vật lý (Spring Physics)
 * Tự động nhận diện Viewport để bắt đầu đếm số khi cuộn tới
 * Chuyển đổi từ TSX sang JSX chuẩn cho React 19 + Motion v14
 *
 * @param {Object} props
 * @param {number} props.value - Con số mục tiêu cần hiển thị
 * @param {number} [props.startValue=0] - Giá trị bắt đầu khi component mount
 * @param {string} [props.className] - Class CSS tùy biến
 * @param {Object} [props.springOptions] - Cấu hình lò xo (bounce, duration, damping, stiffness)
 * @param {string} [props.as='span'] - Thẻ HTML wrapper
 * @param {function} [props.format] - Hàm tùy biến định dạng hiển thị số
 * @param {boolean} [props.inView=true] - Kích hoạt hiệu ứng khi cuộn vào tầm mắt
 * @param {Object} [props.viewOptions] - Cấu hình useInView ({ once: true, margin: '0px 0px -60px 0px' })
 */
export function AnimatedNumber({
  value,
  startValue = 0,
  className,
  springOptions = { bounce: 0, duration: 4000 },
  as = 'span',
  format,
  inView = true,
  viewOptions = { once: true, margin: '0px 0px -60px 0px' },
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, viewOptions)
  const shouldAnimate = inView ? isInView : true

  const Component = motion[as] || motion.span
  const spring = useSpring(startValue, springOptions)

  const defaultFormat = (val) => {
    if (format) return format(val)
    if (Number.isInteger(value)) {
      return Math.round(val).toLocaleString('vi-VN')
    }
    return Number(val).toFixed(1)
  }

  const display = useTransform(spring, (current) => defaultFormat(current))

  useEffect(() => {
    if (shouldAnimate) {
      spring.set(value)
    }
  }, [spring, value, shouldAnimate])

  return (
    <Component ref={ref} className={cn('tabular-nums inline-block', className)}>
      {display}
    </Component>
  )
}

export default AnimatedNumber

