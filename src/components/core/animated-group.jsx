import React, { Children } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const defaultContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const defaultItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      bounce: 0.2,
      duration: 0.5,
    },
  },
}

const presetVariants = {
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.4 } },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: defaultItemVariants,
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.2, duration: 0.5 } },
    },
  },
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(8px)', y: 15 },
      visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.45 } },
    },
  },
}

/**
 * AnimatedGroup Component (Motion-Primitives)
 * Tự động tạo hiệu ứng xuất hiện so le (Staggered Animation) cho các phần tử con
 * Chuẩn JavaScript cho React 19 + Motion v14
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Danh sách phần tử con
 * @param {string} [props.className] - Class CSS cho khung lưới/container
 * @param {Object} [props.variants] - Tùy chỉnh variants container và item
 * @param {'fade'|'slide'|'scale'|'blur'} [props.preset='slide'] - Preset hiệu ứng
 * @param {string} [props.as='div'] - Thẻ HTML bao bọc
 * @param {Object} [props.viewport] - Cấu hình viewport kích hoạt ({ once: true, amount: 0.2, margin: '0px 0px -60px 0px' })
 */
export function AnimatedGroup({
  children,
  className,
  variants,
  preset = 'slide',
  as = 'div',
  viewport = { once: true, amount: 0.2, margin: '0px 0px -60px 0px' },
}) {
  const Component = motion[as] || motion.div

  const selectedVariants = variants || presetVariants[preset] || presetVariants.slide
  const containerVariants = selectedVariants.container || defaultContainerVariants
  const itemVariants = selectedVariants.item || defaultItemVariants

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={containerVariants}
      className={cn(className)}
    >
      {Children.map(children, (child, index) => {
        if (!child) return null
        return (
          <motion.div key={child.key || index} variants={itemVariants}>
            {child}
          </motion.div>
        )
      })}
    </Component>
  )
}

export default AnimatedGroup

