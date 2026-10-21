import { useCallback, useMemo, useState } from 'react'
import { MAX_QUANTITY } from '../constants'

const cartKey = (tableToken) => `moc.dine.cart.${tableToken}`

const readCart = (tableToken) => {
  try {
    const raw = window.sessionStorage.getItem(cartKey(tableToken))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeCart = (tableToken, lines) => {
  try {
    window.sessionStorage.setItem(cartKey(tableToken), JSON.stringify(lines))
  } catch {
    // Bộ nhớ phiên bị chặn: giỏ chỉ tồn tại trong tab hiện tại.
  }
}

const lineKey = (dishId, note) => `${dishId}::${(note || '').trim().toLowerCase()}`

/**
 * Giỏ gọi món tại bàn (chỉ trên thiết bị). Giá chỉ để hiển thị — backend luôn lấy giá
 * hiện tại từ thực đơn khi gửi bếp.
 */
export const useDineCart = (tableToken) => {
  const [lines, setLines] = useState(() => readCart(tableToken))

  const update = useCallback((producer) => {
    setLines((current) => {
      const next = producer(current)
      writeCart(tableToken, next)
      return next
    })
  }, [tableToken])

  const addDish = useCallback((dish, quantity = 1, note = '') => {
    const cleanNote = note.trim()
    const key = lineKey(dish.dishId, cleanNote)
    update((current) => {
      const existing = current.find((line) => line.key === key)
      if (existing) {
        return current.map((line) => (line.key === key ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) } : line))
      }
      return [...current, {
        key,
        dishId: dish.dishId,
        dishName: dish.dishName,
        price: dish.price,
        imageUrl: dish.imageUrl,
        quantity: Math.min(MAX_QUANTITY, quantity),
        note: cleanNote,
      }]
    })
  }, [update])

  const setQuantity = useCallback((key, quantity) => {
    update((current) => (quantity <= 0
      ? current.filter((line) => line.key !== key)
      : current.map((line) => (line.key === key ? { ...line, quantity: Math.min(MAX_QUANTITY, quantity) } : line))))
  }, [update])

  const setNote = useCallback((key, note) => {
    update((current) => current.map((line) => (line.key === key ? { ...line, note } : line)))
  }, [update])

  const removeLines = useCallback((dishIds) => {
    update((current) => current.filter((line) => !dishIds.includes(line.dishId)))
  }, [update])

  const clear = useCallback(() => update(() => []), [update])

  /** Trả các dòng của một lượt bị từ chối về giỏ (gộp với dòng đang có cùng món + ghi chú). */
  const restoreLines = useCallback((restored) => {
    if (!restored?.length) return
    update((current) => restored.reduce((next, line) => {
      const existing = next.find((entry) => entry.key === line.key)
      if (existing) return next.map((entry) => (entry.key === line.key ? { ...entry, quantity: Math.min(MAX_QUANTITY, entry.quantity + line.quantity) } : entry))
      return [...next, line]
    }, current))
  }, [update])

  const totals = useMemo(() => ({
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    amount: lines.reduce((sum, line) => sum + line.quantity * (line.price || 0), 0),
  }), [lines])

  const quantityOf = useCallback((dishId) => lines.filter((line) => line.dishId === dishId).reduce((sum, line) => sum + line.quantity, 0), [lines])

  return { lines, totals, addDish, setQuantity, setNote, removeLines, clear, restoreLines, quantityOf }
}

export default useDineCart
