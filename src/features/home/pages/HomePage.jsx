import { ArrowRight, Leaf, ShoppingBag, Sparkles, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import MocSiteHeader from '../../../components/navigation/MocSiteHeader'
import MocFooter from '../../../components/navigation/MocFooter'

const featuredDishes = [
  {
    name: 'Phở bò tái nạm',
    description: 'Nước dùng xương bò hầm chậm, bò tái, nạm mềm và bánh phở tươi.',
    price: '79.000đ',
    image: '/images/menu/pho-bo.jpg',
    category: 'Món chính',
  },
  {
    name: 'Gỏi ngó sen tôm thịt',
    description: 'Ngó sen giòn, tôm thịt và rau răm trong vị chua ngọt cân bằng.',
    price: '79.000đ',
    image: '/images/menu/goi-ngo-sen.jpg',
    category: 'Khai vị',
  },
  {
    name: 'Bánh flan cà phê',
    description: 'Flan trứng sữa hấp mềm, caramel và một lớp cà phê phin thơm nhẹ.',
    price: '32.000đ',
    image: '/images/menu/banh-flan.jpg',
    category: 'Tráng miệng',
  },
]

export const HomePage = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="moc-page-shell">
      <MocSiteHeader />

      <main>
        <section className="relative overflow-hidden px-6 lg:px-[7vw] py-14 lg:py-20 grid lg:grid-cols-[0.9fr_1.1fr] items-center gap-12 lg:gap-[7vw] min-h-[calc(100vh-114px)]">
          <span className="absolute -left-5 -bottom-16 moc-serif text-[28vw] font-bold leading-none tracking-[-0.08em] text-[#6f1d32]/[0.035] pointer-events-none">MỘC</span>
          <div className="relative z-10">
            <span className="moc-eyebrow">VỊ VIỆT ĐƯƠNG ĐẠI</span>
            <h1 className="mt-6 moc-serif text-[clamp(3.3rem,6.2vw,6.4rem)] leading-[0.94] tracking-[-0.055em] font-medium">
              Thân quen,<br /><em className="text-[#6f1d32] font-normal">theo một cách mới.</em>
            </h1>
            <p className="mt-7 max-w-lg moc-serif text-base leading-7 text-[#766e68]">
              Mộc kể lại hương vị Việt bằng nguyên liệu tử tế, kỹ thuật chỉn chu và những khoảnh khắc đủ chậm để nhớ lâu.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link to="/menu" className="moc-inverse min-h-12 px-6 inline-flex items-center gap-3 bg-[#6f1d32] text-white text-[11px] font-semibold tracking-[0.12em] uppercase hover:bg-[#49101f] transition-colors">
                Khám phá thực đơn <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#story" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f1d32] border-b border-[#6f1d32] pb-1">
                Câu chuyện của Mộc
              </a>
            </div>
            <div className="mt-14 flex items-center gap-4 text-xs text-[#766e68]">
              <span className="w-11 h-11 grid place-items-center rounded-full border border-[#6f1d32]/25 text-[#6f1d32]"><Leaf className="w-5 h-5" /></span>
              <span><strong className="block text-[#211b18]">Nguyên liệu theo mùa</strong>Chọn từ những nhà cung cấp địa phương</span>
            </div>
          </div>

          <div className="relative pr-4 sm:pr-10 pb-8">
            <div className="h-[58vh] min-h-[470px] max-h-[680px] overflow-hidden rounded-[48%_48%_10px_10px] shadow-[var(--moc-shadow)] bg-[#ddd2c5]">
              <img src="/images/menu/goi-ngo-sen.jpg" alt="Gỏi ngó sen tôm thịt của Mộc Dining" className="w-full h-full object-cover hover:scale-[1.035] transition-transform duration-700" />
            </div>
            <div className="absolute top-[12%] right-0 w-24 h-24 sm:w-28 sm:h-28 grid place-items-center text-center rounded-full bg-[#6f1d32] text-[#fff8ed] shadow-xl rotate-6">
              <span className="relative z-10 text-[9px] leading-4 tracking-[0.16em] uppercase">Bếp Việt<br /><strong className="moc-serif text-base tracking-normal normal-case font-medium">mỗi ngày</strong></span>
              <span className="absolute inset-2 rounded-full border border-white/45" />
            </div>
            <div className="absolute left-0 sm:-left-10 bottom-0 min-w-56 p-5 bg-[#fffdf8] shadow-xl">
              <span className="text-[9px] tracking-[0.14em] text-[#6f1d32] uppercase">Món được yêu thích</span>
              <strong className="block mt-1 moc-serif text-lg font-medium">Gỏi ngó sen tôm thịt</strong>
              <small className="text-[#766e68]">Giòn, thanh và tròn vị</small>
            </div>
          </div>
        </section>

        <section id="story" className="px-6 lg:px-[8vw] py-24 lg:py-28 grid lg:grid-cols-[70px_1.15fr_0.85fr] gap-10 lg:gap-14 bg-[#fffdf8] border-t border-[var(--moc-line)] scroll-mt-28">
          <span className="moc-serif italic text-sm text-[#6f1d32]">01 /</span>
          <div>
            <span className="moc-eyebrow">CÂU CHUYỆN CỦA MỘC</span>
            <h2 className="moc-section-title mt-5">Chúng tôi nấu bằng<br />kí ức và sự tử tế.</h2>
          </div>
          <div className="lg:pt-10">
            <p className="moc-serif text-base leading-8 text-[#766e68]">
              Mỗi món ăn bắt đầu từ một ký ức quen thuộc: nồi nước dùng trong bếp nhà, mùi than của hàng quán cũ hay chén nước mắm vừa tay. Mộc giữ phần hồn ấy và hoàn thiện bằng cách làm hiện đại.
            </p>
            <Link to="/menu" className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-[#6f1d32] border-b border-[#6f1d32] pb-1">
              Xem cách Mộc kể chuyện <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        <section className="px-6 lg:px-[7vw] py-24 lg:py-28">
          <div className="grid lg:grid-cols-[1fr_0.65fr] items-end gap-8">
            <div><span className="moc-eyebrow">MÓN ĐƯỢC YÊU THÍCH</span><h2 className="moc-section-title mt-5">Một bàn ăn<br />đủ đầy hương vị.</h2></div>
            <p className="moc-serif text-base leading-7 text-[#766e68]">Món Việt được nấu đúng vị, trình bày tinh gọn và sử dụng hình ảnh đúng với món trong dữ liệu.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDishes.map((dish) => (
              <article key={dish.name} className="group bg-[#fffdf8] border border-[var(--moc-line)] overflow-hidden hover:-translate-y-1 hover:shadow-[var(--moc-shadow)] transition-all duration-300">
                <div className="h-72 overflow-hidden"><img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                <div className="p-6"><span className="text-[9px] tracking-[0.15em] uppercase text-[#6f1d32]">{dish.category}</span><div className="mt-2 flex items-start justify-between gap-4"><h3 className="moc-serif text-xl font-medium">{dish.name}</h3><strong className="moc-serif text-sm text-[#6f1d32]">{dish.price}</strong></div><p className="mt-3 text-xs leading-6 text-[#766e68]">{dish.description}</p></div>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center"><Link to="/menu" className="inline-flex min-h-12 px-7 items-center gap-3 border border-[#6f1d32] text-[#6f1d32] text-[11px] font-semibold tracking-[0.12em] uppercase hover:bg-[#6f1d32] hover:text-[#fff8ed] transition-colors">Xem toàn bộ thực đơn <ArrowRight className="w-4 h-4" /></Link></div>
        </section>

        <section id="experience" className="moc-inverse grid lg:grid-cols-[1.05fr_0.95fr] bg-[#6f1d32] text-white scroll-mt-28">
          <div className="min-h-[520px]"><img src="/images/menu/bun-cha.jpg" alt="Bún chả Hà Nội" className="w-full h-full object-cover saturate-[0.82]" /></div>
          <div className="px-7 lg:px-[7vw] py-20 flex flex-col justify-center">
            <span className="moc-eyebrow !text-[#ead9ca]">TRẢI NGHIỆM TẠI MỘC</span>
            <h2 className="mt-5 moc-serif text-[clamp(3rem,5vw,5rem)] leading-[0.98] tracking-[-0.04em] font-medium">Một buổi tối<br />được chăm chút.</h2>
            <p className="mt-6 moc-serif text-base leading-8 text-[#ead9ca]">Không chỉ là món ăn, Mộc chăm từng điểm chạm từ lúc chọn món đến khi bữa tối khép lại.</p>
            <ul className="my-8 border-t border-white/20">
              {['Thực đơn theo mùa và khẩu vị', 'Ghi chú dị ứng rõ ràng', 'Đặt món và thanh toán thuận tiện'].map((item, index) => <li key={item} className="py-4 flex gap-5 border-b border-white/20 text-sm"><strong className="text-[#d6abb6] text-xs">0{index + 1}</strong>{item}</li>)}
            </ul>
            <Link to={isAuthenticated ? '/menu' : '/login'} className="self-start min-h-12 px-6 inline-flex items-center gap-3 bg-[#f5f0e7] text-[#6f1d32] text-[11px] tracking-[0.12em] uppercase">
              {isAuthenticated ? <ShoppingBag className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {isAuthenticated ? 'Chọn món ngay' : 'Bắt đầu trải nghiệm'}
            </Link>
          </div>
        </section>

        <section id="reservation" className="px-6 py-24 text-center bg-[#fffdf8]">
          <UtensilsCrossed className="w-6 h-6 mx-auto text-[#6f1d32]" />
          <span className="moc-eyebrow mt-5">MỘT CUỘC HẸN ẤM ÁP</span>
          <h2 className="moc-section-title mt-5">Chọn một buổi tối<br />thật vừa ý.</h2>
          <p className="mt-5 moc-serif text-[#766e68]">Tính năng đặt bàn trực tuyến đang được kết nối. Mộc vẫn nhận giữ bàn qua điện thoại.</p>
          <a href="tel:02838221888" className="moc-inverse mt-7 inline-flex min-h-12 px-7 items-center bg-[#6f1d32] text-white text-[11px] font-semibold tracking-[0.12em] uppercase">Gọi 028 3822 1888</a>
        </section>
      </main>

      <MocFooter />
    </div>
  )
}

export default HomePage
