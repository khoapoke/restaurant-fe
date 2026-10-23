/**
 * Browser E2E cho các luồng ngoại lệ nghiệp vụ (ADR-023 → ADR-027).
 *
 * Cần: Vite :5173, Laravel :8000 (trong giờ nhận gọi món 10:00–22:00) và repo backend ở BACKEND_DIR.
 * Chạy: node scripts/exception-e2e.cjs
 *
 * Dữ liệu demo có định danh "[E2E-NGOAI-LE]" và chỉ dùng bàn demo Live Dining (làm mới bằng
 * `php artisan dining:demo`). Kịch bản:
 *  1. Khách đặt bàn đến trễ: gia hạn có lý do → quá hạn → nhường bàn + mở phiên mới trong một thao tác.
 *  2. Hủy món chưa nấu (nhân viên, có lý do, không tính tiền) và món đang nấu (gửi quản lý duyệt,
 *     quản lý duyệt trên tài khoản của mình; khách đổi ý → vẫn tính tiền).
 *  3. Tiền dư: chuyển khoản nhiều hơn số phải trả → sổ giao dịch "Cần xem xét" → ghi nhận đã hoàn tiền.
 *  4. Giao hàng thất bại: ghi nguyên nhân → đơn tiền mặt không bị ghi đã thu → giao lại.
 * Thất bại nếu có lỗi console, HTTP 5xx, hộp thoại window.* hoặc tràn ngang ở 390px.
 */
const { execFileSync } = require('node:child_process')
const path = require('node:path')

const loadPlaywright = () => {
  try { return require('playwright') } catch { return require('playwright-core') }
}
const { chromium } = loadPlaywright()

const baseUrl = process.env.APP_URL || 'http://localhost:5173'
const API = process.env.API_BASE_URL || 'http://127.0.0.1:8000/api/v1'
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const backendDir = process.env.BACKEND_DIR || path.resolve(__dirname, '../../restaurant-lavarel')
const TAG = '[E2E-NGOAI-LE]'
const RUN = Date.now().toString(36).toUpperCase()
const problems = []
const steps = []
const pass = (label) => { steps.push(label); console.log(`✓ ${steps.length}. ${label}`) }

const request = async (method, route, { token, body, headers = {} } = {}) => {
  const response = await fetch(`${API}${route}`, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const json = await response.json().catch(() => ({}))
  return { status: response.status, json }
}
const expectStatus = (result, expected, label) => {
  const allowed = Array.isArray(expected) ? expected : [expected]
  if (!allowed.includes(result.status)) throw new Error(`${label}: expected HTTP ${allowed.join('/')}, received ${result.status} ${JSON.stringify(result.json).slice(0, 400)}`)
  return result.json.data
}
const expectEqual = (actual, expected, label) => {
  if (actual !== expected) throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)
}
const uid = (prefix) => `${prefix}${Date.now()}${Math.random().toString(16).slice(2, 6)}`.toUpperCase()
const login = async (username) => expectStatus(await request('POST', '/auth/login', { body: { username, password: '123' } }), 200, `login ${username}`).accessToken

const artisan = (...args) => execFileSync('php', ['artisan', ...args], { cwd: backendDir, encoding: 'utf8' })
const tinker = (code) => artisan('tinker', '--execute', code).trim().split(/\r?\n/).pop()

const watch = (page, label) => {
  page.on('console', (message) => { if (message.type() === 'error') problems.push(`${label} console: ${message.text()}`) })
  page.on('pageerror', (error) => problems.push(`${label} pageerror: ${error.message}`))
  page.on('response', (response) => { if (response.status() >= 500) problems.push(`${label} HTTP ${response.status()} ${response.url()}`) })
  page.on('dialog', async (dialog) => { problems.push(`${label} native ${dialog.type()} dialog: ${dialog.message()}`); await dialog.dismiss() })
  return page
}

const uiLogin = async (page, username, landing) => {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' })
  await page.getByLabel('Tên đăng nhập').fill(username)
  await page.locator('#password').fill('123')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await page.waitForURL(`**${landing}`)
}

const noHorizontalScroll = async (page, label) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (overflow > 1) problems.push(`${label}: tràn ngang ${overflow}px ở 390px`)
}

/** Lượt đặt có định danh, đặt thẳng vào DB để mô phỏng khách đã đặt từ trước và đang đến trễ. */
const placeReservation = (tableId, minutesAgo) => Number(tinker(`
  $account = App\\Models\\Account::where('ten_dang_nhap', 'kh2')->value('ma_tai_khoan');
  $reservation = App\\Models\\Reservation::create(['thoi_gian' => now()->subMinutes(${minutesAgo})->startOfMinute(), 'so_luong_khach' => 2, 'trang_thai' => App\\Enums\\ReservationStatus::CONFIRMED, 'ghi_chu' => '${TAG} khách đến trễ', 'ma_tai_khoan' => $account, 'ma_ban' => ${tableId}]);
  app(App\\Services\\Shared\\TableStatusSynchronizer::class)->refreshReservationHold(App\\Models\\DiningTable::find(${tableId}));
  echo $reservation->ma_dat_ban;`))

/** Dọn lượt đặt E2E còn hiệu lực từ lần chạy trước (chỉ dữ liệu mang định danh). */
const cleanupReservations = () => tinker(`
  echo App\\Models\\Reservation::where('ghi_chu', 'like', '${TAG}%')->whereIn('trang_thai', [App\\Enums\\ReservationStatus::PENDING->value, App\\Enums\\ReservationStatus::CONFIRMED->value])->update(['trang_thai' => App\\Enums\\ReservationStatus::CANCELLED->value, 'ly_do_xu_ly' => 'Dọn dữ liệu E2E', 'xu_ly_luc' => now()]);`)

const fillCart = async (token) => {
  const cart = expectStatus(await request('GET', '/customer/cart', { token }), 200, 'get cart')
  for (const item of cart.items || []) expectStatus(await request('DELETE', `/customer/cart/items/${item.dishId}`, { token }), 200, 'clear cart')
  const dishes = expectStatus(await request('GET', '/customer/dishes?perPage=5&isAvailable=true'), 200, 'dishes').items
  expectStatus(await request('POST', '/customer/cart/items', { token, body: { dishId: dishes[0].dishId, quantity: 1 } }), [200, 201], 'add to cart')
  return dishes
}

const main = async () => {
  const now = new Date()
  const minutesOfDay = now.getHours() * 60 + now.getMinutes()
  // E2E_SERVER_HOURS_COVER_NOW=1: máy chủ kiểm thử riêng được cấu hình RESTAURANT_* bao trùm giờ chạy.
  if (process.env.E2E_SERVER_HOURS_COVER_NOW !== '1' && (minutesOfDay < 10 * 60 + 70 || minutesOfDay > 21 * 60 + 30)) {
    console.log('! Cần chạy trong khoảng 11:10–21:30 để mô phỏng khách đặt bàn đến trễ trong giờ phục vụ.')
    process.exit(2)
  }

  cleanupReservations()
  const demo = JSON.parse(artisan('dining:demo', '--json').trim().split(/\r?\n/).pop())
  const customer = await login('kh1')
  const staffToken = await login('staff1')
  const adminToken = await login('admin')
  pass(`Chuẩn bị bàn demo ${demo.tableName}, dọn lượt đặt E2E cũ`)

  const browser = await chromium.launch({ executablePath: chromePath, headless: true })
  const staffContext = await browser.newContext({ viewport: { width: 1440, height: 960 } })
  const adminContext = await browser.newContext({ viewport: { width: 1366, height: 900 } })
  const staff = watch(await staffContext.newPage(), 'staff')
  const admin = watch(await adminContext.newPage(), 'admin')
  await uiLogin(staff, 'staff1', '/staff/floor')
  await uiLogin(admin, 'admin', '/admin')
  const tableCard = () => staff.locator('article').filter({ has: staff.getByRole('heading', { name: demo.tableName, exact: true }) })

  // 1. Khách đặt bàn đến trễ 10 phút → gia hạn có lý do.
  const reservationId = placeReservation(demo.tableId, 10)
  await staff.reload({ waitUntil: 'networkidle' })
  await tableCard().getByText(/Trễ \d+ phút · giữ bàn đến/).waitFor({ timeout: 15000 })
  await tableCard().getByRole('button', { name: 'Gia hạn giữ bàn' }).click()
  let dialog = staff.getByRole('dialog')
  await dialog.getByRole('textbox').fill(`${TAG} khách gọi báo kẹt xe`)
  await dialog.getByRole('button', { name: 'Gia hạn 15 phút' }).click()
  await staff.getByText(`Đã gia hạn giữ bàn cho lượt đặt #${reservationId}.`).waitFor()
  let detail = expectStatus(await request('GET', `/admin/reservations/${reservationId}`, { token: adminToken }), 200, 'reservation detail')
  if (!detail.extension?.until) throw new Error('Extension was not stored')
  pass(`POS cảnh báo khách đặt #${reservationId} đến trễ; nhân viên gia hạn có lý do (lưu người, giờ, lý do)`)

  // Mô phỏng thời gian trôi: lượt đặt đã quá hạn giữ chỗ → nhường bàn và mở phiên mới cùng lúc.
  tinker(`App\\Models\\Reservation::whereKey(${reservationId})->update(['thoi_gian' => now()->subMinutes(70)->startOfMinute(), 'gia_han_den' => null]); echo 1;`)
  await staff.reload({ waitUntil: 'networkidle' })
  await tableCard().getByText(/Đã quá hạn giữ bàn/).waitFor({ timeout: 15000 })
  await tableCard().getByRole('button', { name: 'NHƯỜNG BÀN · MỞ PHIÊN MỚI' }).click()
  dialog = staff.getByRole('dialog')
  await dialog.getByRole('textbox').fill(`${TAG} gọi 2 lần không nghe máy`)
  await dialog.getByRole('button', { name: 'Ghi không đến & mở phiên mới' }).click()
  await staff.waitForURL('**/staff/sessions/*')
  const sessionId = Number(new URL(staff.url()).pathname.split('/').pop())
  detail = expectStatus(await request('GET', `/admin/reservations/${reservationId}`, { token: adminToken }), 200, 'reservation after release')
  expectEqual(detail.status, 'NO_SHOW', 'released reservation status')
  pass(`Quá hạn giữ chỗ: “Nhường bàn” ghi lượt #${reservationId} không đến và mở phiên #${sessionId} trong một thao tác`)

  // 2. Hủy món trước và sau khi bếp nấu.
  const dishes = expectStatus(await request('GET', '/customer/dishes?perPage=5&isAvailable=true'), 200, 'dishes').items
  const order = expectStatus(await request('POST', `/staff/pos/sessions/${sessionId}/orders`, { token: staffToken, body: {} }), [200, 201], 'pos order')
  const wrong = expectStatus(await request('POST', `/staff/pos/orders/${order.orderId}/items`, { token: staffToken, body: { dishId: dishes[0].dishId, quantity: 1, clientRequestId: uid('wrong') } }), 201, 'add wrong item')
  const cooked = expectStatus(await request('POST', `/staff/pos/orders/${order.orderId}/items`, { token: staffToken, body: { dishId: dishes[1].dishId, quantity: 1, clientRequestId: uid('cooked') } }), 201, 'add cooked item')
  expectStatus(await request('POST', `/staff/pos/orders/${order.orderId}/send-kitchen`, { token: staffToken, body: { itemIds: [wrong.itemId, cooked.itemId] } }), 200, 'send kitchen')
  for (const status of ['QUEUED', 'PREPARING']) expectStatus(await request('PATCH', `/staff/kitchen/items/${cooked.itemId}/status`, { token: staffToken, body: { status } }), 200, `kitchen ${status}`)
  await staff.reload({ waitUntil: 'networkidle' })

  const itemRow = (name) => staff.locator('#pos-order-panel article').filter({ hasText: name })
  await itemRow(wrong.dishName).getByRole('button', { name: 'Xử lý' }).click()
  dialog = staff.getByRole('dialog')
  await dialog.locator('select').first().selectOption('ORDER_ENTRY_ERROR')
  await dialog.getByRole('textbox').fill(`${TAG} bấm nhầm món`)
  await dialog.getByText('Không tính tiền phần đã hủy.').waitFor()
  await dialog.getByRole('button', { name: 'Hủy món', exact: true }).last().click()
  await staff.getByText(`Đã hủy 1 phần ${wrong.dishName}.`).waitFor()
  await itemRow(wrong.dishName).getByText(/Nhân viên gọi nhầm/).waitFor()
  pass('Hủy món chưa nấu: nhân viên chọn lý do, dòng món hiện “Đã hủy · Nhân viên gọi nhầm”, không tính tiền')

  await itemRow(cooked.dishName).getByRole('button', { name: 'Xử lý' }).click()
  dialog = staff.getByRole('dialog')
  await dialog.getByText(/Bếp đã bắt đầu chế biến/).waitFor()
  await dialog.locator('select').first().selectOption('CUSTOMER_CHANGED_MIND')
  await dialog.getByRole('textbox').fill(`${TAG} ${RUN} khách đổi ý khi món đang nấu`)
  await dialog.getByRole('button', { name: 'Gửi quản lý duyệt' }).click()
  await staff.getByText(`Đã gửi yêu cầu hủy ${cooked.dishName} cho quản lý duyệt.`).waitFor()
  await staff.getByText(/món đã chế biến · Chờ duyệt/).waitFor()
  const direct = await request('POST', `/staff/pos/order-items/${cooked.itemId}/void`, { token: staffToken, body: { reason: 'CUSTOMER_CHANGED_MIND', note: 'Gọi thẳng API' } })
  expectEqual(direct.status, 403, 'staff direct API void of cooked item')
  pass('Món đang nấu: nhân viên chỉ gửi được yêu cầu duyệt (gọi thẳng API bị 403), phiên hiện “Chờ duyệt”')

  await admin.goto(`${baseUrl}/admin/approvals`, { waitUntil: 'networkidle' })
  const approvalCard = admin.locator('article').filter({ hasText: `${TAG} ${RUN} khách đổi ý khi món đang nấu` })
  await approvalCard.getByRole('button', { name: 'Duyệt' }).click()
  dialog = admin.getByRole('dialog')
  await dialog.getByRole('textbox').fill('Đồng ý, món đã nấu vẫn tính tiền')
  await dialog.getByRole('button', { name: 'Duyệt và thực hiện' }).click()
  await admin.getByText(/Đã duyệt và thực hiện/).waitFor()
  const session = expectStatus(await request('GET', `/staff/pos/sessions/${sessionId}`, { token: staffToken }), 200, 'session after approval')
  const cookedLine = session.orders[0].items.find((item) => item.itemId === cooked.itemId)
  expectEqual(cookedLine.kitchenStatus, 'CANCELLED', 'approved cooked item cancelled')
  expectEqual(cookedLine.billedQuantity, 1, 'customer changed mind after cooking is still billed')
  await staff.reload({ waitUntil: 'networkidle' })
  await staff.getByText(/món đã chế biến · Đã duyệt/).waitFor()
  pass('Quản lý duyệt trên tài khoản của mình (không nhập mật khẩu ở máy nhân viên); món đã nấu khách đổi ý vẫn tính tiền')

  const invoice = expectStatus(await request('POST', `/staff/pos/sessions/${sessionId}/invoices`, { token: staffToken }), 201, 'invoice')
  expectStatus(await request('POST', `/staff/invoices/${invoice.invoiceId}/payments`, { token: staffToken, headers: { 'Idempotency-Key': uid('pay') }, body: { method: 'CASH', amount: invoice.outstanding, cashTendered: invoice.outstanding } }), 201, 'pay')
  const version = expectStatus(await request('GET', `/staff/pos/sessions/${sessionId}`, { token: staffToken }), 200, 'session version').version
  expectStatus(await request('POST', `/staff/pos/sessions/${sessionId}/close`, { token: staffToken, body: { expectedVersion: version } }), 200, 'close session')
  expectStatus(await request('POST', `/staff/pos/tables/${demo.tableId}/complete-cleaning`, { token: staffToken }), 200, 'clean table')

  // 3. Chuyển khoản dư → sổ giao dịch cần xem xét → ghi nhận đã hoàn tiền.
  await fillCart(customer)
  const delivery = expectStatus(await request('POST', '/customer/orders/checkout', { token: customer, body: {
    fulfillmentType: 'DELIVERY', recipientName: `${TAG} Khách giao`, recipientPhone: '0911222333', shippingAddress: '12 Lý Tự Trọng, Quận 1', paymentMethod: 'BANK_TRANSFER_QR',
  } }), 201, 'checkout delivery')
  const payments = expectStatus(await request('GET', `/admin/payments?keyword=${delivery.orderId}`, { token: adminToken }), 200, 'admin payments').items
  const reference = uid('FTE2E')
  expectStatus(await request('POST', `/admin/payments/${payments[0].paymentId}/confirm`, { token: adminToken, body: { transactionCode: reference, amount: delivery.totalAmount + 50000, note: TAG } }), 200, 'overpaid transfer')
  await admin.goto(`${baseUrl}/admin/payments?tab=transactions`, { waitUntil: 'networkidle' })
  const txCard = admin.locator('article').filter({ hasText: reference })
  await txCard.getByText('Cần xem xét').waitFor({ timeout: 15000 })
  await txCard.getByRole('button', { name: 'Ghi nhận đã hoàn tiền' }).click()
  dialog = admin.getByRole('dialog')
  await dialog.getByText(/chỉ ghi nhận/).waitFor()
  await dialog.getByPlaceholder('FT26102199887 / PC-0123').fill(uid('HT'))
  await dialog.getByPlaceholder(/Khách chuyển khoản hai lần/).fill(`${TAG} hoàn phần chuyển dư 50.000 ₫`)
  await dialog.getByRole('button', { name: 'Ghi nhận đã hoàn tiền' }).click()
  await admin.getByText('Đã ghi nhận khoản hoàn tiền.').waitFor()
  const transactions = expectStatus(await request('GET', `/admin/payments/transactions?keyword=${reference}&reconciliation=`, { token: adminToken }), 200, 'transactions').items
  expectEqual(transactions[0].refundedAmount, 50000, 'refunded surplus')
  expectEqual(transactions[0].unallocatedAmount, 0, 'no unallocated money left')
  pass(`Chuyển dư 50.000 ₫ cho đơn #${delivery.orderId}: sổ giao dịch báo “Cần xem xét”, quản lý “Ghi nhận đã hoàn tiền” kèm chứng từ`)

  // 4. Giao hàng thất bại → không ghi đã thu → giao lại.
  const cashOrderCart = await fillCart(customer)
  const cashOrder = expectStatus(await request('POST', '/customer/orders/checkout', { token: customer, body: {
    fulfillmentType: 'DELIVERY', recipientName: `${TAG} Khách COD`, recipientPhone: '0911222444', shippingAddress: '99 Hai Bà Trưng, Quận 1', paymentMethod: 'CASH',
  } }), 201, 'checkout cash delivery')
  for (const targetStatus of ['CONFIRMED', 'PREPARING', 'READY']) expectStatus(await request('PATCH', `/admin/orders/${cashOrder.orderId}/status`, { token: adminToken, body: { targetStatus } }), 200, `cash order ${targetStatus}`)
  expectStatus(await request('PATCH', `/admin/orders/${cashOrder.orderId}/fulfillment-status`, { token: adminToken, body: { targetStatus: 'OUT_FOR_DELIVERY' } }), 200, 'out for delivery')
  await admin.goto(`${baseUrl}/admin/orders?keyword=${cashOrder.orderId}`, { waitUntil: 'networkidle' })
  const orderCard = admin.locator('article').filter({ has: admin.getByRole('heading', { name: `Đơn #${cashOrder.orderId}` }) })
  await orderCard.getByRole('button', { name: 'Giao thất bại' }).click()
  dialog = admin.getByRole('dialog')
  await dialog.getByText('Khách từ chối nhận').click()
  await dialog.getByRole('textbox').fill(`${TAG} khách không nhận tại cửa`)
  await dialog.getByRole('button', { name: 'Ghi nhận giao thất bại' }).click()
  await orderCard.getByText(/Giao thất bại: Khách từ chối nhận/).waitFor()
  let cashDetail = expectStatus(await request('GET', `/admin/orders/${cashOrder.orderId}`, { token: adminToken }), 200, 'failed order')
  expectEqual(cashDetail.payment.status, 'UNPAID', 'failed COD stays unpaid')
  await orderCard.getByRole('button', { name: 'Giao lại' }).click()
  await admin.getByText(`Đơn #${cashOrder.orderId} chờ tài xế giao lại.`).waitFor()
  cashDetail = expectStatus(await request('GET', `/admin/orders/${cashOrder.orderId}`, { token: adminToken }), 200, 'redelivery order')
  expectEqual(cashDetail.fulfillmentStatus, 'AWAITING_DRIVER', 'redelivery queued')
  expectStatus(await request('PATCH', `/admin/orders/${cashOrder.orderId}/fulfillment-status`, { token: adminToken, body: { targetStatus: 'OUT_FOR_DELIVERY' } }), 200, 'second attempt')
  cashDetail = expectStatus(await request('PATCH', `/admin/orders/${cashOrder.orderId}/fulfillment-status`, { token: adminToken, body: { targetStatus: 'DELIVERED' } }), 200, 'delivered')
  expectEqual(cashDetail.payment.status, 'PAID', 'COD recorded only on successful delivery')
  expectEqual(cashDetail.deliveryAttempts, 2, 'two delivery attempts recorded')
  pass(`Đơn tiền mặt #${cashOrder.orderId}: ghi giao thất bại (không ghi đã thu) → giao lại → lần 2 thành công mới ghi nhận tiền`)
  if (!cashOrderCart.length) problems.push('no dishes available')

  // Mobile 390px: các màn xử lý ngoại lệ không tràn ngang.
  await admin.setViewportSize({ width: 390, height: 844 })
  for (const route of ['/admin/approvals', '/admin/payments?tab=transactions', `/admin/orders?keyword=${cashOrder.orderId}`]) {
    await admin.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
    await noHorizontalScroll(admin, route)
  }
  await staff.setViewportSize({ width: 390, height: 844 })
  await staff.goto(`${baseUrl}/staff/floor`, { waitUntil: 'networkidle' })
  await noHorizontalScroll(staff, '/staff/floor')
  pass('Mobile 390px: duyệt yêu cầu, sổ giao dịch, đơn hàng và sơ đồ bàn không tràn ngang')

  await browser.close()
  artisan('dining:demo', '--json')

  if (problems.length) {
    console.error(problems.join('\n'))
    throw new Error(`${problems.length} problem(s) detected`)
  }
  console.log(`\nException E2E passed: ${steps.length} steps, 0 console errors, 0 HTTP 5xx, 0 native dialogs.`)
}

main().catch((error) => {
  console.error(error)
  if (problems.length) console.error(problems.join('\n'))
  process.exit(1)
})
