import { ArrowLeft, Leaf, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import MocBrand from '../../../components/brand/MocBrand'

export const MocAuthLayout = ({ eyebrow, title, description, image, children }) => (
  <div className="min-h-screen grid lg:grid-cols-[0.92fr_1.08fr] bg-[#f5f0e7]">
    <section className="moc-inverse hidden lg:flex min-h-screen relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-[#6f1d32] text-white">
      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity" />
      <span className="absolute inset-0 bg-gradient-to-b from-[#49101f]/40 via-[#6f1d32]/75 to-[#351018]" />
      <div className="relative z-10"><MocBrand light /></div>
      <div className="relative z-10 max-w-xl">
        <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[#ead9ca]"><Leaf className="w-4 h-4" /> {eyebrow}</span>
        <h1 className="mt-5 moc-serif text-[clamp(3.2rem,5vw,5.6rem)] leading-[0.98] tracking-[-0.045em] font-medium">{title}</h1>
        <p className="mt-6 max-w-lg moc-serif text-base leading-8 text-[#ead9ca]">{description}</p>
        <div className="mt-9 pt-6 border-t border-white/20 flex items-center gap-3 text-xs text-[#ead9ca]"><ShieldCheck className="w-5 h-5" /> Xác thực an toàn qua Laravel Sanctum</div>
      </div>
      <small className="relative z-10 text-[#c8b4ac]">© {new Date().getFullYear()} Mộc Dining</small>
    </section>

    <section className="min-h-screen p-6 sm:p-10 lg:p-14 flex items-center justify-center relative">
      <Link to="/" className="absolute top-6 left-6 sm:top-9 sm:left-10 inline-flex items-center gap-2 text-xs text-[#766e68] hover:text-[#6f1d32]"><ArrowLeft className="w-4 h-4" /> Trang chủ</Link>
      <div className="w-full max-w-xl py-14">
        <div className="lg:hidden mb-9"><MocBrand /></div>
        {children}
      </div>
    </section>
  </div>
)

export default MocAuthLayout
