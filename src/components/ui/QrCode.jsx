import { useMemo } from 'react'
import { createQrMatrix } from '../../lib/qrCode'

/**
 * Mã QR dạng SVG (sinh tại trình duyệt). Luôn giữ viền trắng 4 ô để máy quét đọc tốt.
 */
export const QrCode = ({ value, size = 220, label = 'Mã QR', className = '' }) => {
  const matrix = useMemo(() => {
    try {
      return value ? createQrMatrix(value) : null
    } catch {
      return null
    }
  }, [value])

  if (!matrix) {
    return <div className={`grid place-items-center bg-white text-sm text-[#625a55] ${className}`} style={{ width: size, height: size }}>Không tạo được mã QR</div>
  }

  const quiet = 4
  const dimension = matrix.size + quiet * 2
  let path = ''
  matrix.modules.forEach((row, y) => {
    row.forEach((isDark, x) => {
      if (isDark) path += `M${x + quiet} ${y + quiet}h1v1h-1z`
    })
  })

  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`0 0 ${dimension} ${dimension}`}
      shapeRendering="crispEdges"
      className={`bg-white ${className}`}
    >
      <rect width={dimension} height={dimension} fill="#ffffff" />
      <path d={path} fill="#211b18" />
    </svg>
  )
}

export default QrCode
