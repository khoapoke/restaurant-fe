/**
 * Hồi quy trình duyệt cho các phát hiện review (G, D, N):
 *  G. Checkout chuyển khoản: tạo đơn xong vẫn ở bước thanh toán (modal VietQR), đóng modal → Đơn hàng.
 *  D. Thu tiền mặt một phần, máy chủ đã ghi nhưng mất phản hồi → "Gửi lại khoản thu" dùng đúng khóa cũ,
 *     chỉ ghi 10.000 ₫ một lần; một lần thu mới thật sự vẫn được ghi.
 *  R. Một khoản chuyển trả chung hai đơn, cả hai bị hủy, quản lý ghi hoàn toàn bộ trên Sổ giao dịch →
 *     mỗi đơn được ghi hoàn đúng phần của mình (không dồn cả khoản vào một đơn), gửi lại không ghi thêm.
 *  N. Tương phản chữ (WCAG AA) trên các màn khách/POS/quản trị ở 1440px và 390px.
 *
 * Chạy trên DB riêng (không phải DB dev đang dùng): Laravel API_BASE_URL + Vite APP_URL trỏ vào bản sao.
 *   APP_URL=http://127.0.0.1:5180 API_BASE_URL=http://127.0.0.1:8019/api/v1 node scripts/review-regression-e2e.cjs
 * Dữ liệu tạo ra mang định danh "[E2E-REVIEW]" (bàn riêng, đơn của tài khoản kh2).
 */
const loadPlaywright = () => {
  try { return require('playwright') } catch { return require('playwright-core') }
}
const { chromium } = loadPlaywright()

const FE = process.env.APP_URL || 'http://127.0.0.1:5180'
const API = process.env.API_BASE_URL || 'http://127.0.0.1:8019/api/v1'
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const TAG = '[E2E-REVIEW]'
const problems = []
const steps = []
const pass = (label) => { steps.push(label); console.log(`✓ ${steps.length}. ${label}`) }
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

const request = async (method, route, token, body, headers = {}) => {
  const response = await fetch(API + route, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`${method} ${route}: ${response.status} ${JSON.stringify(json).slice(0, 300)}`)
  return json.data
}
const login = (username, password = '123') => request('POST', '/auth/login', null, { username, password })

const contextFor = async (browser, auth, viewport = { width: 1440, height: 960 }) => {
  const context = await browser.newContext({ viewport })
  if (auth) {
    await context.addInitScript(({ accessToken, account }) => {
      localStorage.setItem('restaurant_access_token', accessToken)
      localStorage.setItem('restaurant_account', JSON.stringify(account))
    }, auth)
  }
  return context
}

const watch = (page, label) => {
  page.on('console', (message) => { if (message.type() === 'error' && !/ERR_FAILED|net::ERR/.test(message.text())) problems.push(`${label} console: ${message.text()}`) })
  page.on('pageerror', (error) => problems.push(`${label} pageerror: ${error.message}`))
  page.on('response', (response) => { if (response.status() >= 500) problems.push(`${label} HTTP ${response.status()} ${response.url()}`) })
  page.on('dialog', async (dialog) => { problems.push(`${label} native dialog: ${dialog.message()}`); await dialog.dismiss() })
  return page
}

/** Tỷ lệ tương phản của mọi đoạn chữ đang hiển thị so với nền thực tế (WCAG 2.1). */
const contrastViolations = (page) => page.evaluate(() => {
  const parse = (value) => {
    const match = value.match(/rgba?\(([^)]+)\)/)
    if (!match) return null
    const [r, g, b, a = 1] = match[1].split(',').map((part) => Number(part.trim()))
    return { r, g, b, a }
  }
  const luminance = ({ r, g, b }) => {
    const channel = (value) => { const v = value / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  }
  const blend = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 })
  const backgroundOf = (element) => {
    const layers = []
    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node)
      if (style.backgroundImage && style.backgroundImage !== 'none' && !style.backgroundImage.includes('gradient')) return null
      const color = parse(style.backgroundColor)
      if (color && color.a > 0) {
        layers.push(color)
        if (color.a >= 1) break
      }
    }
    return layers.reverse().reduce((acc, layer) => blend(layer, acc), { r: 255, g: 255, b: 255, a: 1 })
  }
  const issues = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const seen = new Set()
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent.trim()
    const element = walker.currentNode.parentElement
    if (!text || !element || seen.has(element)) continue
    seen.add(element)
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    if (rect.width === 0 || rect.height === 0 || style.visibility === 'hidden' || Number(style.opacity) < 0.5) continue
    if (element.closest('[disabled], [aria-hidden="true"], svg')) continue
    const background = backgroundOf(element)
    const color = parse(style.color)
    if (!background || !color) continue
    const foreground = blend(color, background)
    const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
    const ratio = (light + 0.05) / (dark + 0.05)
    const size = parseFloat(style.fontSize)
    const bold = Number(style.fontWeight) >= 700
    const required = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5
    if (ratio < required) issues.push({ text: text.slice(0, 60), ratio: Math.round(ratio * 100) / 100, required })
  }
  return issues
})

const auditContrast = async (page, label) => {
  const issues = await contrastViolations(page)
  if (issues.length) problems.push(`${label} tương phản thấp: ${JSON.stringify(issues.slice(0, 6))}`)
  return issues.length
}

const main = async () => {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true })
  try {
    const customer = await login('kh2', 'Password@123')
    const staff = await login('staff1')
    const admin = await login('admin')
    const dishes = (await request('GET', '/customer/dishes?perPage=5&isAvailable=true')).items

    // G — checkout QR giữ bước thanh toán.
    const cart = await request('GET', '/customer/cart', customer.accessToken)
    for (const item of cart.items) await request('DELETE', `/customer/cart/items/${item.dishId}`, customer.accessToken)
    await request('POST', '/customer/cart/items', customer.accessToken, { dishId: dishes[0].dishId, quantity: 1 })
    const customerContext = await contextFor(browser, customer)
    const checkout = watch(await customerContext.newPage(), 'customer')
    await checkout.goto(`${FE}/checkout`, { waitUntil: 'networkidle' })
    await checkout.locator('input[name="recipientName"]').fill(`${TAG} Khách QR`)
    await checkout.locator('input[name="recipientPhone"]').fill('0901234567')
    await checkout.getByRole('button', { name: 'Tự đến lấy', exact: true }).click()
    await auditContrast(checkout, 'checkout 1440 (tự lấy)')
    const placedResponse = checkout.waitForResponse((response) => response.url().endsWith('/customer/orders/checkout') && response.request().method() === 'POST')
    await checkout.getByRole('button', { name: 'Xác nhận Đặt món ngay' }).click()
    const placed = (await (await placedResponse).json()).data
    await checkout.getByRole('dialog').waitFor({ timeout: 10000 })
    await checkout.waitForTimeout(1500)
    if (new URL(checkout.url()).pathname !== '/checkout') throw new Error(`Checkout QR redirected to ${checkout.url()}`)
    await checkout.getByRole('dialog').getByText(/VietQR|Quét mã|chuyển khoản/i).first().waitFor({ timeout: 10000 })
    await auditContrast(checkout, 'checkout QR modal')
    await checkout.getByRole('dialog').getByRole('button').first().click()
    await checkout.waitForURL('**/orders', { timeout: 10000 })
    await checkout.getByText(`Đã tạo đơn #${placed.orderId}`, { exact: false }).waitFor({ timeout: 10000 })
    pass(`G: checkout chuyển khoản đơn #${placed.orderId} giữ modal VietQR trên /checkout; đóng modal về Đơn hàng kèm hướng dẫn`)
    await checkout.close()

    // D — thu tiền mặt một phần, mất phản hồi, gửi lại an toàn.
    const table = await request('POST', '/admin/tables', admin.accessToken, { tableName: uid('E2E-REVIEW'), capacity: 4, status: 'AVAILABLE', location: `${TAG} bàn kiểm thử` })
    const session = await request('POST', '/staff/pos/sessions', staff.accessToken, { tableIds: [table.tableId], guestCount: 2 }, { 'Idempotency-Key': uid('open') })
    const order = await request('POST', `/staff/pos/sessions/${session.sessionId}/orders`, staff.accessToken, {})
    const item = await request('POST', `/staff/pos/orders/${order.orderId}/items`, staff.accessToken, { dishId: dishes[0].dishId, quantity: 2, clientRequestId: uid('item') })
    await request('POST', `/staff/pos/orders/${order.orderId}/send-kitchen`, staff.accessToken, { itemIds: [item.itemId] })
    const invoice = await request('POST', `/staff/pos/sessions/${session.sessionId}/invoices`, staff.accessToken)
    const staffContext = await contextFor(browser, staff)
    const pos = watch(await staffContext.newPage(), 'staff')
    await pos.goto(`${FE}/staff/sessions/${session.sessionId}`, { waitUntil: 'networkidle' })
    const paymentUrl = `${API}/staff/invoices/${invoice.invoiceId}/payments`
    const keys = []
    pos.on('request', (req) => { if (req.url() === paymentUrl && req.method() === 'POST') keys.push(req.headers()['idempotency-key']) })
    await pos.route(paymentUrl, async (route) => {
      const response = await route.fetch()
      if (response.status() !== 201) throw new Error(`first payment status ${response.status()}`)
      await route.abort('failed')
    }, { times: 1 })
    await pos.getByLabel('Khách đưa', { exact: true }).fill('10000')
    await pos.getByRole('button', { name: /GHI NHẬN THU MỘT PHẦN/ }).click()
    await pos.getByRole('button', { name: 'GỬI LẠI KHOẢN THU' }).waitFor({ timeout: 10000 })
    if (await pos.getByRole('button', { name: /GHI NHẬN THU MỘT PHẦN/ }).count()) throw new Error('New collection must be blocked while a payment is unresolved')
    await pos.reload({ waitUntil: 'networkidle' }) // reload: khoản treo vẫn còn và tự gửi lại đúng khóa
    await pos.getByText(/Đã xác nhận với máy chủ|Đã ghi nhận 10\.000/).first().waitFor({ timeout: 15000 })
    const afterRetry = await request('GET', `/staff/pos/sessions/${session.sessionId}`, staff.accessToken)
    if (afterRetry.invoice.amountPaid !== 10000) throw new Error(`Expected 10000 recorded once, got ${afterRetry.invoice.amountPaid}`)
    if (keys.length < 2 || new Set(keys).size !== 1) throw new Error(`Retry must reuse the same key, got ${JSON.stringify(keys)}`)
    await pos.getByLabel('Khách đưa', { exact: true }).fill('10000')
    const secondResponse = pos.waitForResponse((response) => response.url() === paymentUrl && response.request().method() === 'POST')
    await pos.getByRole('button', { name: /GHI NHẬN THU MỘT PHẦN/ }).click()
    if ((await secondResponse).status() !== 201) throw new Error('Second real collection was not recorded')
    await pos.getByText('Đã ghi nhận thanh toán tiền mặt.', { exact: true }).waitFor({ timeout: 10000 })
    const afterSecond = await request('GET', `/staff/pos/sessions/${session.sessionId}`, staff.accessToken)
    if (afterSecond.invoice.amountPaid !== 20000) throw new Error(`Second real collection should be recorded, got ${afterSecond.invoice.amountPaid}`)
    if (new Set(keys).size !== 2) throw new Error('A new collection must use a new key')
    await auditContrast(pos, 'POS phiên 1440')
    pass(`D: mất phản hồi + reload → gửi lại cùng khóa, chỉ ghi 10.000 ₫; lần thu mới dùng khóa mới (tổng 20.000 ₫), khóa: ${[...new Set(keys)].length}`)
    await pos.close()

    // R — hoàn một khoản chuyển đã áp cho hai đơn bị hủy: mỗi đơn đúng phần của mình.
    const placeQrOrder = async () => {
      await request('POST', '/customer/cart/items', customer.accessToken, { dishId: dishes[0].dishId, quantity: 1 })
      return request('POST', '/customer/orders/checkout', customer.accessToken, {
        fulfillmentType: 'PICKUP', recipientName: `${TAG} Hai đơn chung`, recipientPhone: '0901234567', scheduledAt: null, paymentMethod: 'BANK_TRANSFER_QR',
      })
    }
    const paymentOf = async (orderId) => (await request('GET', `/admin/payments?keyword=${orderId}&perPage=50`, admin.accessToken)).items.find((row) => row.orderId === orderId)
    const shared = [await placeQrOrder(), await placeQrOrder()]
    const sharedTotal = shared.reduce((sum, row) => sum + Number(row.totalAmount), 0)
    const reference = uid('FT-SHARED').toUpperCase()
    await request('POST', `/admin/payments/${(await paymentOf(shared[0].orderId)).paymentId}/confirm`, admin.accessToken, { transactionCode: reference, amount: sharedTotal })
    const sharedTx = (await request('GET', `/admin/payments/transactions?keyword=${reference}`, admin.accessToken)).items[0]
    await request('POST', `/admin/payments/transactions/${sharedTx.transactionId}/allocate`, admin.accessToken, { orderId: shared[1].orderId, note: `${TAG} khách trả chung hai đơn` })
    for (const row of shared) await request('POST', `/admin/orders/${row.orderId}/cancel`, admin.accessToken, { cancelReason: `${TAG} nhà hàng hết món, hủy cả hai đơn` })

    const adminContext = await contextFor(browser, admin)
    const ledger = watch(await adminContext.newPage(), 'admin')
    await ledger.goto(`${FE}/admin/payments?tab=transactions`, { waitUntil: 'networkidle' })
    await ledger.getByLabel('Lọc trạng thái đối soát').selectOption('')
    await ledger.getByLabel('Tìm giao dịch tiền').fill(reference)
    const card = ledger.locator('article').filter({ hasText: `#${sharedTx.transactionId} ·` })
    await card.waitFor({ timeout: 10000 })
    const refundUrl = `${API}/admin/payments/transactions/${sharedTx.transactionId}/refunds`
    const refundKeys = []
    ledger.on('request', (req) => { if (req.url() === refundUrl && req.method() === 'POST') refundKeys.push(req.headers()['idempotency-key']) })
    // Lần gửi đầu: máy chủ ghi xong nhưng phản hồi bị mất → bấm lại trong cùng modal phải dùng cùng khóa.
    await ledger.route(refundUrl, async (route) => {
      const response = await route.fetch()
      if (response.status() !== 200) throw new Error(`first refund status ${response.status()}`)
      await route.abort('failed')
    }, { times: 1 })
    await card.getByRole('button', { name: 'Ghi nhận đã hoàn tiền' }).click()
    const modal = ledger.getByRole('dialog')
    await modal.locator('input[type="number"]').fill(String(sharedTotal))
    await modal.getByPlaceholder('FT26102199887 / PC-0123').fill(`${reference}-HOAN`)
    await modal.locator('textarea').fill(`${TAG} hai đơn đều bị hủy`)
    await modal.getByRole('button', { name: 'Ghi nhận đã hoàn tiền' }).click()
    await modal.getByRole('alert').waitFor({ timeout: 10000 })
    const retried = ledger.waitForResponse((response) => response.url() === refundUrl && response.request().method() === 'POST')
    await modal.getByRole('button', { name: 'Ghi nhận đã hoàn tiền' }).click()
    if ((await retried).status() !== 200) throw new Error('Refund retry was not accepted as a replay')
    await ledger.getByText('Đã ghi nhận khoản hoàn tiền.').first().waitFor({ timeout: 10000 })
    for (const row of shared) await card.getByText(`· đơn #${row.orderId}`, { exact: false }).first().waitFor({ timeout: 10000 })
    if (refundKeys.length !== 2 || new Set(refundKeys).size !== 1) throw new Error(`Refund retry must reuse the same key, got ${JSON.stringify(refundKeys)}`)
    const afterRefund = (await request('GET', `/admin/payments/transactions?keyword=${reference}`, admin.accessToken)).items[0]
    if (afterRefund.refundedAmount !== sharedTotal || afterRefund.refunds.length !== 2) throw new Error(`Refund recorded wrongly: ${JSON.stringify(afterRefund.refunds)}`)
    for (const row of shared) {
      const payment = await paymentOf(row.orderId)
      if (payment.amountRefunded !== Number(row.totalAmount) || payment.status !== 'REFUNDED' || payment.amountPaid !== 0) {
        throw new Error(`Order #${row.orderId}: refunded ${payment.amountRefunded}/${row.totalAmount}, status ${payment.status}, paid ${payment.amountPaid}`)
      }
    }
    await auditContrast(ledger, 'sổ giao dịch sau hoàn')
    await ledger.goto(`${FE}/admin/payments?keyword=${shared[0].orderId}`, { waitUntil: 'networkidle' })
    await auditContrast(ledger, 'thanh toán theo đơn sau hoàn')
    await adminContext.close()
    pass(`R: hoàn ${sharedTotal.toLocaleString('vi-VN')} ₫ của giao dịch #${sharedTx.transactionId} trả chung đơn #${shared[0].orderId}/#${shared[1].orderId}: mỗi đơn REFUNDED đúng phần, mất phản hồi gửi lại cùng khóa không ghi thêm`)

    // N — rà tương phản các màn chính ở 1440 và 390.
    const surfaces = [
      ['customer', customer, ['/menu', '/cart', '/orders', '/reservations', '/profile']],
      ['admin', admin, ['/admin', '/admin/orders', '/admin/payments', '/admin/payments?tab=transactions', '/admin/approvals', '/admin/reservations']],
      ['staff', staff, ['/staff/floor', `/staff/sessions/${session.sessionId}`, '/staff/kitchen']],
      ['guest', null, ['/', '/login']],
    ]
    let audited = 0
    for (const width of [1440, 390]) {
      for (const [label, auth, routes] of surfaces) {
        const context = await contextFor(browser, auth, { width, height: 900 })
        for (const route of routes) {
          const page = watch(await context.newPage(), `${label}-${width}`)
          await page.goto(`${FE}${route}`, { waitUntil: 'networkidle' })
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
          if (overflow > 1) problems.push(`${label} ${width} ${route}: tràn ngang ${overflow}px`)
          await auditContrast(page, `${label} ${width} ${route}`)
          audited += 1
          await page.close()
        }
        await context.close()
      }
    }
    const mobileCheckout = await contextFor(browser, customer, { width: 390, height: 900 })
    await request('POST', '/customer/cart/items', customer.accessToken, { dishId: dishes[0].dishId, quantity: 1 })
    const mobile = watch(await mobileCheckout.newPage(), 'customer-390')
    await mobile.goto(`${FE}/checkout`, { waitUntil: 'networkidle' })
    await mobile.getByRole('button', { name: 'Tự đến lấy', exact: true }).click()
    await auditContrast(mobile, 'checkout 390 (tự lấy)')
    await mobileCheckout.close()
    pass(`N: rà tương phản chữ & tràn ngang trên ${audited + 3} màn (1440px và 390px)`)
  } finally {
    await browser.close()
  }

  if (problems.length) {
    console.error(problems.join('\n'))
    throw new Error(`${problems.length} problem(s) detected`)
  }
  console.log(`\nReview regression E2E passed: ${steps.length} steps, 0 console errors, 0 HTTP 5xx, 0 contrast violations.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
