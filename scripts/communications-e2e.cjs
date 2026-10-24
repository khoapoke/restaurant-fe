/* Run only against a disposable database. Email must be disabled on that backend. */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright')
const base = process.env.APP_URL || 'http://127.0.0.1:5182'
const api = process.env.API_BASE_URL || 'http://127.0.0.1:8019/api/v1'
const output = process.env.COMMS_UI_OUTPUT || 'E:/Nam4/restaurant-lavarel/.codex/communications-runtime/ui'
const marker = Date.now().toString()
const customerName = `Khách E2E Mộc ${marker}`
const call = async (method, url, token, body) => {
  const response = await fetch(api + url, { method, headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const json = await response.json()
  assert.ok(response.ok, `${method} ${url}: ${response.status} ${json.message}`)
  return json.data
}
const authorize = (context, auth) => context.addInitScript(({ accessToken, account }) => {
  localStorage.setItem('restaurant_access_token', accessToken)
  localStorage.setItem('restaurant_account', JSON.stringify(account))
}, auth)
const until = async (fn, description, timeout = 40000) => {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) { if (await fn()) return; await new Promise((resolve) => setTimeout(resolve, 500)) }
  throw new Error(`Timed out: ${description}`)
}
// Màu quy đổi qua canvas: Tailwind 4 trả oklab/oklch, đọc số thô từ chuỗi CSS sẽ ra màu sai.
const contrastIssues = (page, selector) => page.locator(selector).evaluate((root) => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const paint = canvas.getContext('2d', { willReadFrequently: true })
  const rgb = (text) => {
    if (!text || text === 'transparent') return null
    paint.clearRect(0, 0, 1, 1)
    paint.fillStyle = '#000'
    paint.fillStyle = text
    paint.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = paint.getImageData(0, 0, 1, 1).data
    return a === 0 ? null : [r, g, b, a / 255]
  }
  const lum = (color) => color.slice(0, 3).map((value) => { const x = value / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)
  return [...root.querySelectorAll('*')].flatMap((element) => {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    if (!rect.width || !rect.height || rect.bottom < 0 || rect.top > innerHeight || style.visibility === 'hidden' || element.disabled || ![...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) return []
    const foreground = rgb(style.color)
    if (!foreground || foreground[3] < 1) return []
    const layers = []
    for (let current = element; current; current = current.parentElement) { const color = rgb(getComputedStyle(current).backgroundColor); if (color) layers.unshift(color) }
    let background = [255, 255, 255]
    for (const layer of layers) background = background.map((value, index) => layer[index] * layer[3] + value * (1 - layer[3]))
    const ratio = (Math.max(lum(foreground), lum(background)) + 0.05) / (Math.min(lum(foreground), lum(background)) + 0.05)
    const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && parseInt(style.fontWeight) >= 700)
    return ratio + 0.01 < (large ? 3 : 4.5) ? [{ text: element.textContent.slice(0, 65), ratio }] : []
  })
})
async function main() {
  fs.mkdirSync(output, { recursive: true })
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  const errors = []
  try {
    const auth = await call('POST', '/auth/register', null, { username: `comms_${marker}`, password: 'CommsTest123!', passwordConfirmation: 'CommsTest123!', email: `comms_${marker}@example.invalid`, fullName: customerName, phoneNumber: '0901234567' })
    const staffAuth = await call('POST', '/auth/login', null, { username: 'staff1', password: '123' })
    const adminAuth = await call('POST', '/auth/login', null, { username: 'admin', password: '123' })
    const settings = await call('GET', '/admin/communications/deliveries', adminAuth.accessToken)
    assert.equal(settings.emailEnabled, false, 'Never run E2E with real email enabled')
    const day = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10)
    const available = await call('GET', `/customer/tables/available?date=${day}&time=19:00&guestCount=2`, auth.accessToken)
    assert.ok(available.items.length, 'Needs one table available six days from today')
    const booking = await call('POST', '/customer/reservations', auth.accessToken, { tableId: available.items[0].tableId, reservationTime: `${day} 19:00:00`, guestCount: 2 })
    const customerContext = await browser.newContext({ viewport: { width: 1440, height: 960 } })
    const staffContext = await browser.newContext({ viewport: { width: 1440, height: 960 } })
    await authorize(customerContext, auth)
    await authorize(staffContext, staffAuth)
    const customer = await customerContext.newPage()
    const staff = await staffContext.newPage()
    for (const page of [customer, staff]) page.on('pageerror', (error) => errors.push(error.message))
    await customer.goto(`${base}/menu`)
    await customer.getByRole('button', { name: 'Mở hỗ trợ Mộc' }).click()
    await customer.getByRole('button', { name: 'Bắt đầu trò chuyện' }).click()
    await customer.getByLabel('Nội dung tin nhắn').fill('Gợi ý giúp mình một món khai vị nhẹ, giá chỉ hiển thị ở thẻ món nhé.')
    await customer.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click()
    let conversation
    await until(async () => {
      conversation = (await call('GET', '/customer/support/current', auth.accessToken)).conversation
      return conversation.messages.some((message) => message.sender === 'AI')
    }, 'actual Gemini response')
    assert.equal(conversation.status, 'AI', `Gemini fell back to staff: ${conversation.messages.at(-1).body}`)
    assert.ok(conversation.messages.at(-1).body.length > 10)
    await customer.getByText(conversation.messages.at(-1).body, { exact: true }).waitFor()
    assert.deepEqual(await contrastIssues(customer, 'section[role="dialog"]'), [], 'Customer chat text contrast')
    await customer.screenshot({ path: path.join(output, 'customer-ai-desktop.png'), fullPage: false })
    await customer.getByRole('button', { name: 'Gặp nhân viên', exact: true }).click()
    await customer.getByText('Đang chờ nhân viên tiếp nhận', { exact: true }).waitFor()
    let lost = false
    const lostText = 'Tin nhắn kiểm thử mất phản hồi, chỉ được lưu một lần.'
    await customer.route('**/customer/support/*/messages', async (route) => {
      if (lost) return route.continue()
      lost = true
      await route.fetch()
      await route.abort('failed')
    })
    await customer.getByLabel('Nội dung tin nhắn').fill(lostText)
    await customer.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click()
    await customer.getByRole('button', { name: 'Thử gửi lại tin nhắn' }).waitFor()
    await customer.reload()
    await customer.getByRole('button', { name: 'Mở hỗ trợ Mộc' }).click()
    await customer.getByText(lostText, { exact: true }).first().waitFor()
    // Tin đã tới server: ô soạn tự bỏ khóa chờ (clientKey có trong hội thoại), không gửi lại.
    await until(async () => !(await customer.getByRole('button', { name: 'Thử gửi lại tin nhắn' }).count()), 'pending cleared')
    conversation = (await call('GET', '/customer/support/current', auth.accessToken)).conversation
    assert.equal(conversation.messages.filter((message) => message.body === lostText).length, 1)
    await staff.goto(`${base}/staff/support`)
    await staff.getByRole('button').filter({ hasText: customerName }).click()
    await staff.getByRole('button', { name: 'Tiếp nhận', exact: true }).click()
    await until(async () => await staff.getByLabel('Nội dung tin nhắn').isEnabled(), 'staff owns conversation')
    await staff.getByLabel('Nội dung tin nhắn').fill('Mộc đã tiếp nhận, mình sẽ hỗ trợ bạn ngay nhé.')
    await staff.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click()
    await customer.getByText('Mộc đã tiếp nhận, mình sẽ hỗ trợ bạn ngay nhé.', { exact: true }).waitFor()
    assert.equal((await call('GET', '/customer/support/current', auth.accessToken)).conversation.pendingAi, false)
    await staff.screenshot({ path: path.join(output, 'staff-support-desktop.png'), fullPage: true })
    assert.deepEqual(await contrastIssues(staff, 'main'), [], 'Staff support text contrast')
    await customer.setViewportSize({ width: 390, height: 844 })
    await customer.screenshot({ path: path.join(output, 'customer-chat-mobile.png'), fullPage: false })
    assert.ok(await customer.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Mobile chat horizontal overflow')
    await customer.getByRole('button', { name: 'Đóng chat', exact: true }).click()
    await customer.goto(`${base}/notifications`)
    await customer.getByText('Mộc đã nhận yêu cầu đặt bàn', { exact: true }).waitFor()
    await customer.screenshot({ path: path.join(output, 'notifications-mobile.png'), fullPage: true })
    assert.deepEqual(await contrastIssues(customer, 'main'), [], 'Notifications text contrast')
    await customer.getByRole('link', { name: 'Xem chi tiết →', exact: true }).first().click()
    await customer.getByRole('region', { name: 'Lượt đặt được chọn từ thông báo' }).waitFor()
    assert.ok(customer.url().includes(`reservationId=${booking.reservationId}`))
    await staff.getByRole('button', { name: 'Kết thúc', exact: true }).click()
    await staff.getByRole('dialog').getByRole('button', { name: 'Kết thúc', exact: true }).click()
    await staff.screenshot({ path: path.join(output, 'staff-final-desktop.png'), fullPage: true })
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await authorize(adminContext, adminAuth)
    const admin = await adminContext.newPage()
    admin.on('pageerror', (error) => errors.push(error.message))
    await admin.goto(`${base}/admin/communications`)
    await admin.getByRole('heading', { name: 'Nhật ký gửi email' }).waitFor()
    await admin.getByText('Chưa bật', { exact: true }).waitFor()
    await admin.screenshot({ path: path.join(output, 'admin-email-desktop.png'), fullPage: true })
    assert.deepEqual(await contrastIssues(admin, 'main'), [], 'Email log text contrast')
    await admin.setViewportSize({ width: 390, height: 844 })
    await admin.screenshot({ path: path.join(output, 'admin-email-mobile.png'), fullPage: true })
    assert.ok(await admin.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Admin mobile horizontal overflow')
    assert.deepEqual(errors, [])
    console.log(JSON.stringify({ passed: true, realGemini: true, bookingNotification: true, handoff: true, staffReply: true, reloadRetryExactlyOnce: true, mobileOverflow: false, screenshotDirectory: output }))
  } finally { await browser.close() }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1 })
