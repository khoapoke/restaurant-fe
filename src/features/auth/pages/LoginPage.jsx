import LoginForm from '../components/LoginForm'
import MocAuthLayout from '../components/MocAuthLayout'

export const LoginPage = () => (
  <MocAuthLayout
    eyebrow="CHÀO MỪNG ĐẾN MỘC"
    title={<>Một bữa ngon<br />bắt đầu từ đây.</>}
    description="Đăng nhập để chọn món, lưu địa chỉ, theo dõi đơn hàng và tiếp tục những trải nghiệm dành riêng cho bạn."
    image="/images/menu/goi-cuon.jpg"
  >
    <div>
      <span className="moc-eyebrow">KHÔNG GIAN CỦA BẠN</span>
      <h2 className="mt-4 moc-serif text-4xl sm:text-5xl leading-none tracking-[-0.035em] font-medium">Chào mừng trở lại.</h2>
      <p className="mt-4 text-sm leading-6 text-[#766e68]">Đăng nhập để tiếp tục trải nghiệm tại Mộc Dining.</p>
    </div>
    <div className="mt-8 p-6 sm:p-8 bg-[#fffdf8] border border-[var(--moc-line)] shadow-[var(--moc-shadow)]">
      <LoginForm />
    </div>
  </MocAuthLayout>
)

export default LoginPage
