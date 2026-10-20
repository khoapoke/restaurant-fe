import { Link } from 'react-router-dom'

export const MocBrand = ({ light = false, compact = false }) => (
  <Link
    to="/"
    className={`inline-flex items-center gap-3 no-underline ${light ? 'text-[#fff8ed]' : 'text-[#211b18]'}`}
    aria-label="Mộc Dining - Trang chủ"
  >
    <span
      className={`grid place-items-center border border-current rounded-[50%_50%_8px_8px] moc-serif ${
        compact ? 'w-8 h-9 text-base' : 'w-9 h-11 text-lg'
      }`}
      aria-hidden="true"
    >
      M
    </span>
    <span>
      <strong className="block moc-serif text-lg leading-none tracking-[0.16em] font-semibold">
        MỘC
      </strong>
      <small className="block mt-1 text-[10px] leading-none tracking-[0.28em] opacity-75">
        DINING
      </small>
    </span>
  </Link>
)

export default MocBrand
