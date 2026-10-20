import MocBrand from '../brand/MocBrand'

export const MocFooter = () => (
  <footer className="moc-inverse px-6 lg:px-[7vw] pt-16 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] gap-9 bg-[#251b19] text-[#f5eee7]">
    <div>
      <MocBrand light />
      <p className="mt-5 max-w-xs text-xs leading-6 text-[#aa9e98]">
        Món Việt thân quen được kể lại bằng nguyên liệu tử tế và một cách phục vụ chỉn chu.
      </p>
    </div>
    <div>
      <strong className="moc-serif font-medium">Ghé Mộc</strong>
      <p className="mt-3 text-xs leading-6 text-[#aa9e98]">82 Nguyễn Du, Quận 1, TP.HCM<br />10:00 — 22:30, mỗi ngày</p>
    </div>
    <div>
      <strong className="moc-serif font-medium">Liên hệ</strong>
      <p className="mt-3 text-xs leading-6 text-[#aa9e98]">028 3822 1888<br />hello@mocdining.vn</p>
    </div>
    <div>
      <strong className="moc-serif font-medium">Theo dõi</strong>
      <p className="mt-3 text-xs leading-6 text-[#aa9e98]">Instagram<br />Facebook</p>
    </div>
    <small className="sm:col-span-2 lg:col-span-4 pt-7 border-t border-white/15 text-xs text-[#b8aaa3]">
      © {new Date().getFullYear()} Mộc Dining. Vị Việt, cách kể mới.
    </small>
  </footer>
)

export default MocFooter
