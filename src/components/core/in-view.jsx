import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * InView Component (Motion-Primitives)
 * Giám sát viewport để kích hoạt animation khi người dùng cuộn tới phần tử đó
 * Chuẩn JavaScript cho React 19 + Motion v14
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Phần tử con cần chạy hiệu ứng
 * @param {Object} [props.variants] - Motion variants (hidden & visible)
 * @param {Object} [props.transition] - Cấu hình transition (duration, ease, spring)
 * @param {Object} [props.viewOptions] - Tùy chọn useInView (once, margin, amount)
 * @param {string} [props.as='div'] - Thẻ HTML bao bọc
 * @param {string} [props.className] - Class CSS
 */
export function InView({
  children,
  variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  transition = { duration: 0.5, ease: 'easeOut' },
  viewOptions = { once: true, amount: 0.2 },
  as = 'div',
  className,
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, viewOptions)
  const Component = motion[as] || motion.div

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </Component>
  )
}

export default InView

