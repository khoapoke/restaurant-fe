import { motion, AnimatePresence, useInView } from 'motion/react'
import React, { useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Các bộ Animation Presets có sẵn
 */
const defaultContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
}

const defaultItemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
  exit: { opacity: 0 },
}

const presetVariants = {
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
  },
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(10px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(10px)' },
    },
  },
}

/**
 * TextEffect Component (Motion-Primitives)
 * Tạo hiệu ứng chữ xuất hiện từng ký tự (char), từng từ (word) hoặc từng dòng (line)
 * Hỗ trợ nhận diện Viewport để chỉ chạy hiệu ứng khi cuộn tới
 * Chuẩn JavaScript cho React 19 + Motion v14
 *
 * @param {Object} props
 * @param {string} props.children - Chuỗi văn bản cần chạy hiệu ứng
 * @param {'char'|'word'|'line'} [props.per='word'] - Phân đoạn hiệu ứng theo chữ hay từ
 * @param {string} [props.as='p'] - Thẻ HTML bọc ngoài (p, h1, h2, span...)
 * @param {'fade'|'slide'|'scale'|'blur'} [props.preset='fade'] - Kiểu hiệu ứng có sẵn
 * @param {Object} [props.variants] - Tùy chỉnh variants nâng cao
 * @param {string} [props.className] - Class CSS cho thẻ bọc
 * @param {number} [props.delay=0] - Độ trễ bắt đầu animation (giây)
 * @param {boolean} [props.trigger=true] - Kích hoạt animation
 * @param {function} [props.onAnimationComplete] - Callback khi hoàn tất
 * @param {string} [props.segmentWrapperClassName] - Class CSS cho từng từ/chữ
 * @param {boolean} [props.inView=false] - Kích hoạt hiệu ứng khi cuộn vào tầm mắt
 * @param {Object} [props.viewOptions] - Cấu hình useInView ({ once: true, margin: '0px 0px -60px 0px' })
 */
export function TextEffect({
  children,
  per = 'word',
  as = 'p',
  variants,
  className,
  preset = 'fade',
  delay = 0,
  trigger = true,
  onAnimationComplete,
  segmentWrapperClassName,
  inView = false,
  viewOptions = { once: true, margin: '0px 0px -60px 0px' },
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, viewOptions)
  const shouldRender = trigger
  const isVisible = inView ? isInView : true

  const Component = motion[as] || motion.p

  const selectedVariants = useMemo(() => {
    if (variants) return variants
    return presetVariants[preset] || presetVariants.fade
  }, [variants, preset])

  const containerVariants = useMemo(() => {
    const base = selectedVariants.container || defaultContainerVariants
    if (delay > 0) {
      return {
        ...base,
        visible: {
          ...base.visible,
          transition: {
            ...base.visible?.transition,
            delayChildren: delay,
          },
        },
      }
    }
    return base
  }, [selectedVariants, delay])

  const itemVariants = selectedVariants.item || defaultItemVariants

  // Phân tách chuỗi theo chế độ (per: 'char' | 'word' | 'line')
  const segments = useMemo(() => {
    if (typeof children !== 'string') return []

    if (per === 'char') {
      return children.split('')
    }
    if (per === 'word') {
      return children.split(' ')
    }
    if (per === 'line') {
      return children.split('\n')
    }
    return [children]
  }, [children, per])

  if (typeof children !== 'string') {
    return <span className={className}>{children}</span>
  }

  return (
    <AnimatePresence mode="popLayout">
      {shouldRender && (
        <Component
          ref={ref}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          exit="exit"
          variants={containerVariants}
          className={cn('inline-block whitespace-normal', className)}
          onAnimationComplete={onAnimationComplete}
        >
          {segments.map((segment, index) => (
            <motion.span
              key={`${segment}-${index}`}
              variants={itemVariants}
              className={cn(
                'inline-block',
                per === 'word' && index < segments.length - 1 && 'mr-[0.25em]',
                segmentWrapperClassName
              )}
            >
              {segment === ' ' ? '\u00A0' : segment}
            </motion.span>
          ))}
        </Component>
      )}
    </AnimatePresence>
  )
}

export default TextEffect

