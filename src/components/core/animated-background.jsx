import { Children, cloneElement, useEffect, useState, useId } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * AnimatedBackground Component (Motion-Primitives)
 * Tạo hiệu ứng nền trượt mượt mà giữa các phần tử khi hover hoặc click
 * Chuẩn JavaScript cho React 19 + Motion v14
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Các phần tử con (cần có prop `data-id`)
 * @param {string} [props.defaultValue] - Giá trị active ban đầu
 * @param {function} [props.onValueChange] - Callback khi active id thay đổi
 * @param {string} [props.className] - Class tùy biến cho nền animated
 * @param {Object} [props.transition] - Cấu hình transition animation
 * @param {boolean} [props.enableHover=false] - Bật chế độ trượt theo con trỏ chuột hover
 */
export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}) {
  const [activeId, setActiveId] = useState(null)
  const uniqueId = useId()

  const handleSetActiveId = (id) => {
    setActiveId(id)
    if (onValueChange) {
      onValueChange(id)
    }
  }

  useEffect(() => {
    if (defaultValue !== undefined) {
      setActiveId(defaultValue)
    }
  }, [defaultValue])

  return Children.map(children, (child, index) => {
    if (!child) return null

    const id = child.props['data-id']

    const interactionProps = enableHover
      ? {
          onMouseEnter: () => handleSetActiveId(id),
          onMouseLeave: () => handleSetActiveId(null),
        }
      : {
          onClick: () => handleSetActiveId(id),
        }

    return cloneElement(
      child,
      {
        key: index,
        className: cn('relative inline-flex items-center justify-center', child.props.className),
        'aria-selected': activeId === id,
        'data-checked': activeId === id ? 'true' : 'false',
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn('absolute inset-0 z-0', className)}
              transition={
                transition || {
                  type: 'spring',
                  bounce: 0.15,
                  duration: 0.35,
                }
              }
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{
                opacity: 1,
                transition: {
                  type: 'spring',
                  bounce: 0.15,
                  duration: 0.35,
                },
              }}
              exit={{
                opacity: 0,
                transition: {
                  type: 'spring',
                  bounce: 0.15,
                  duration: 0.25,
                },
              }}
            />
          )}
        </AnimatePresence>
        <span className="relative z-10">{child.props.children}</span>
      </>
    )
  })
}

export default AnimatedBackground

