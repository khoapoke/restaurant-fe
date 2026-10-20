/**
 * Base Skeleton component
 * Phục vụ trạng thái Loading theo chuẩn 4 UI states
 */
export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-800/80 rounded-xl ${className}`}
      {...props}
    />
  )
}

export default Skeleton
