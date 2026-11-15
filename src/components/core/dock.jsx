import { useRef, createContext, useContext } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'

const DockContext = createContext({
  mouseX: null,
  magnification: 60,
  distance: 140,
})

/**
 * Dock Container Component (Motion-Primitives)
 * Thanh dock điều hướng phóng to tương tác kiểu macOS
 * Chuẩn JavaScript cho React 19 + Motion v14
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {number} [props.magnification=64] - Kích thước tối đa khi hover (px)
 * @param {number} [props.distance=140] - Khoảng cách bắt đầu hiệu ứng phóng to (px)
 * @param {'top'|'middle'|'bottom'} [props.direction='bottom'] - Hướng neo của dock
 */
export function Dock({
  children,
  className,
  magnification = 64,
  distance = 140,
  direction = 'bottom',
}) {
  const mouseX = useMotionValue(Infinity)

  return (
    <DockContext.Provider value={{ mouseX, magnification, distance }}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          'flex h-16 items-end gap-3 rounded-2xl bg-surface-card/80 border border-border-subtle p-2 backdrop-blur-md shadow-xl',
          direction === 'top' && 'items-start',
          direction === 'middle' && 'items-center',
          direction === 'bottom' && 'items-end',
          className
        )}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  )
}

/**
 * DockIcon Component (Phần tử con trong Dock)
 * Tự động phóng to theo khoảng cách từ con trỏ chuột
 */
export function DockIcon({
  children,
  className,
  size = 40,
}) {
  const ref = useRef(null)
  const { mouseX, magnification, distance: thresholdDistance } = useContext(DockContext)

  const distanceCalc = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(
    distanceCalc,
    [-thresholdDistance, 0, thresholdDistance],
    [size, magnification, size]
  )

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      className={cn(
        'relative flex items-center justify-center rounded-xl bg-surface-card border border-border-subtle text-text-body hover:text-brand-primary hover:border-brand-primary transition-colors cursor-pointer select-none shadow-sm',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

/**
 * DockLabel Component (Nhãn chú thích khi hover vào icon)
 */
export function DockLabel({ children, className }) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-elevated border border-border-subtle px-2 py-0.5 text-[10px] font-medium text-text-main shadow-md transition-all',
        className
      )}
    >
      {children}
    </span>
  )
}

export default Dock

