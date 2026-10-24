import { STORAGE_KEYS } from '../auth/constants'

/**
 * Tin chat đang chờ xác nhận (ADR-029): mỗi tin một khóa riêng theo clientKey để reload vẫn gửi lại đúng
 * mã cũ và hai tab không ghi đè/xóa tin của nhau. Toàn bộ bị dọn khi đăng xuất, hết phiên hoặc đổi tài khoản.
 */
const PREFIX = 'moc-chat-pending:'
const LEGACY = /^moc-(staff-)?support-\d+-\d+$/

const scopeKey = (scope, accountId, conversationId) => `${PREFIX}${scope}:${accountId}:${conversationId}:`

const storageKeys = () => {
  try { return Object.keys(localStorage) } catch { return [] }
}

export const readPending = (scope, accountId, conversationId) => {
  const prefix = scopeKey(scope, accountId, conversationId)
  return storageKeys().filter((key) => key.startsWith(prefix)).map((key) => {
    try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
  }).filter((item) => item?.clientKey && typeof item.body === 'string').sort((a, b) => a.createdAt - b.createdAt)
}

/** Ném lỗi nếu trình duyệt không cho lưu: khi đó không gửi, vì không còn bảo vệ chống gửi trùng sau reload. */
export const savePending = (scope, accountId, conversationId, { body, clientKey }) => {
  const item = { body, clientKey, createdAt: Date.now() }
  localStorage.setItem(scopeKey(scope, accountId, conversationId) + clientKey, JSON.stringify(item))
  return item
}

export const removePending = (scope, accountId, conversationId, clientKey) => {
  try { localStorage.removeItem(scopeKey(scope, accountId, conversationId) + clientKey) } catch { /* storage bị chặn */ }
}

export const clearAllPending = () => {
  storageKeys().filter((key) => key.startsWith(PREFIX) || LEGACY.test(key)).forEach((key) => {
    try { localStorage.removeItem(key) } catch { /* storage bị chặn */ }
  })
}

/** Tài khoản của phiên đang lưu (tab khác có thể đã đăng xuất hoặc đăng nhập tài khoản khác). */
export const storedAccountId = () => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNT) || sessionStorage.getItem(STORAGE_KEYS.ACCOUNT)
    return token && raw ? JSON.parse(raw)?.accountId ?? null : null
  } catch { return null }
}
