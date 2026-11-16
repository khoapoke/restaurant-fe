import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import Button from '../../../../components/ui/Button'

/**
 * Quản lý danh sách thành phần nguyên liệu món ăn (DishIngredientList)
 * - Nhập nguyên liệu bằng Enter hoặc click nút Thêm
 * - 100% Centralized Design Tokens, < 70 dòng
 */
export default function DishIngredientList({ ingredients = [], onAdd, onRemove }) {
  const [inputVal, setInputVal] = useState('')

  const handleAdd = () => {
    const val = inputVal.trim()
    if (!val) return
    onAdd(val)
    setInputVal('')
  }

  return (
    <div className="space-y-2 p-3 rounded-xl bg-surface-bg border border-border-subtle">
      <label className="block text-xs font-semibold text-text-muted">
        Thành phần nguyên liệu
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nhập nguyên liệu rồi bấm Thêm..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          className="flex-1 px-3 py-1.5 text-xs bg-surface-card border border-border-strong rounded-lg text-text-main placeholder-text-dim focus:outline-none focus:border-brand-primary"
        />
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={handleAdd}
          icon={Plus}
        >
          Thêm
        </Button>
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {ingredients.map((ing, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-primary/10 border border-brand-primary/20 text-brand-hover text-[11px]"
            >
              {ing}
              <button
                type="button"
                onClick={() => onRemove(ing)}
                className="hover:text-status-error cursor-pointer"
                title={`Xóa ${ing}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

