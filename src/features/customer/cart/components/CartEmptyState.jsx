import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react'
import Button from '../../../../components/ui/Button'

export const CartEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-16 rounded-3xl border border-dashed border-gray-800 bg-gray-900/40 text-center max-w-2xl mx-auto my-8">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/5">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-gray-950 flex items-center justify-center font-bold text-xs">
          0
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Thực đơn phong phú đang chờ đón bạn</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
        Giỏ hàng của bạn đang trống
      </h3>

      <p className="text-sm text-gray-400 max-w-md leading-relaxed mb-8">
        Bạn chưa thêm món ăn nào vào giỏ hàng. Hãy khám phá các món ăn hảo hạng và ưu đãi gợi ý theo thời tiết tại nhà hàng.
      </p>

      <Link to="/menu">
        <Button variant="primary" size="lg" icon={ArrowRight}>
          Khám phá Thực đơn ngay
        </Button>
      </Link>
    </div>
  )
}

export default CartEmptyState
