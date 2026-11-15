import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useSpring, useMotionValue } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Spotlight Component (Motion-Primitives)
 * Tạo vệt sáng mờ di chuyển mượt mà theo vị trí con trỏ chuột trong container cha
 * Chuẩn JavaScript cho React 19 + Motion v14
 *
 * @param {Object} props
 * @param {string} [props.className] - Class tùy biến cho vệt sáng
 * @param {number} [props.size=350] - Kích thước bán kính vệt sáng (pixel)
 * @param {Object} [props.springOptions] - Tùy chỉnh độ nảy và độ mượt của con trỏ chuột
 */
export function Spotlight({
  className,
  size = 350,
  springOptions = { bounce: 0, damping: 20, stiffness: 200 },
}) {
  const containerRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [parentElement, setParentElement] = useState(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, springOptions)
  const springY = useSpring(mouseY, springOptions)

  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement
      if (parent) {
        parent.style.position = 'relative'
        parent.style.overflow = 'hidden'
        setParentElement(parent)
      }
    }
  }, [])

  const handleMouseMove = useCallback(
    (event) => {
      if (!parentElement) return
      const { left, top } = parentElement.getBoundingClientRect()
      const x = event.clientX - left
      const y = event.clientY - top
      mouseX.set(x)
      mouseY.set(y)
    },
    [parentElement, mouseX, mouseY]
  )

  useEffect(() => {
    if (!parentElement) return

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => setIsHovered(false)

    parentElement.addEventListener('mousemove', handleMouseMove)
    parentElement.addEventListener('mouseenter', handleMouseEnter)
    parentElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      parentElement.removeEventListener('mousemove', handleMouseMove)
      parentElement.removeEventListener('mouseenter', handleMouseEnter)
      parentElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [parentElement, handleMouseMove])

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute rounded-full bg-[radial-gradient(circle_at_center,var(--spotlight-color,rgba(245,158,11,0.12)),transparent_70%)] blur-2xl transition-opacity duration-300',
        isHovered ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        width: size,
        height: size,
        left: springX,
        top: springY,
        transform: 'translate(-50%, -50%)',
      }}
    />
  )
}

/**
 * SpotlightBeam Component (Nón sáng rọi từ đỉnh góc)
 * Dành cho Header hoặc Hero background tạo chiều sâu không gian Fine Dining
 */
export function SpotlightBeam({ className, fill = 'rgba(245, 158, 11, 0.15)' }) {
  return (
    <svg
      className={cn(
        'pointer-events-none absolute -top-40 left-0 md:left-60 md:-top-20 z-0 h-[170%] w-[140%] lg:w-[84%] opacity-60',
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter-spotlight)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.3"
        />
      </g>
      <defs>
        <filter
          id="filter-spotlight"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="150" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  )
}

export default Spotlight

