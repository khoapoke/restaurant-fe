import RegisterForm from '../components/RegisterForm'
import MocAuthLayout from '../components/MocAuthLayout'

export const RegisterPage = () => (
  <MocAuthLayout
    eyebrow="TRỞ THÀNH KHÁCH QUEN"
    title={<>Mộc nhớ điều<br />bạn yêu thích.</>}
    description="Tạo tài khoản để lưu khẩu vị, ghi chú dị ứng, địa chỉ nhận món và những bữa ăn đáng nhớ."
    image="/images/menu/cha-gio.jpg"
  >
    <div>
      <span className="moc-eyebrow">TẠO TÀI KHOẢN</span>
      <h2 className="mt-4 moc-serif text-4xl sm:text-5xl leading-none tracking-[-0.035em] font-medium">Bắt đầu cùng Mộc.</h2>
      <p className="mt-4 text-sm leading-6 text-[#766e68]">Điền thông tin bên dưới để trải nghiệm dịch vụ trọn vẹn hơn.</p>
    </div>
    <div className="mt-8 p-6 sm:p-8 bg-[#fffdf8] border border-[var(--moc-line)] shadow-[var(--moc-shadow)]">
      <RegisterForm />
    </div>
  </MocAuthLayout>
)

export default RegisterPage
