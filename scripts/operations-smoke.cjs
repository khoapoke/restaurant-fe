const { chromium } = require('playwright')

const baseUrl = 'http://127.0.0.1:5173'

const login = async (page, username, password) => {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' })
  await page.getByLabel('Tên đăng nhập').fill(username)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
}

const main = async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
  const consoleErrors = []

  const customer = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  customer.on('console', (message) => message.type() === 'error' && consoleErrors.push(`customer: ${message.text()}`))
  customer.on('pageerror', (error) => consoleErrors.push(`customer: ${error.message}`))
  await login(customer, 'kh1', '123')
  await customer.waitForURL(`${baseUrl}/`)
  await customer.goto(`${baseUrl}/reservations`, { waitUntil: 'networkidle' })
  await customer.getByRole('heading', { name: 'Đặt bàn' }).waitFor()
  await customer.getByText('Lịch của bạn').waitFor()
  await customer.evaluate(async () => {
    const token = localStorage.getItem('restaurant_access_token') || sessionStorage.getItem('restaurant_access_token')
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const cartResponse = await fetch('http://127.0.0.1:8000/api/v1/customer/cart', { headers })
    const cart = await cartResponse.json()
    if (!cart.data?.items?.length) {
      const dishesResponse = await fetch('http://127.0.0.1:8000/api/v1/customer/dishes?perPage=1', { headers })
      const dishes = await dishesResponse.json()
      await fetch('http://127.0.0.1:8000/api/v1/customer/cart/items', {
        method: 'POST',
        headers,
        body: JSON.stringify({ dishId: dishes.data.items[0].dishId, quantity: 1 }),
      })
    }
  })
  await customer.goto(`${baseUrl}/checkout`, { waitUntil: 'networkidle' })
  await customer.getByRole('heading', { name: 'Xác nhận bữa ngon.' }).waitFor()
  await customer.getByRole('button', { name: 'Giao hàng' }).waitFor()
  await customer.getByRole('button', { name: 'Tự đến lấy' }).click()
  await customer.getByText('Nhận món tại Mộc Dining').waitFor()
  await customer.getByRole('button', { name: 'Hẹn giờ đến lấy' }).click()
  await customer.locator('input[name="scheduledAt"]').waitFor()

  const admin = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  admin.on('console', (message) => message.type() === 'error' && consoleErrors.push(`admin: ${message.text()}`))
  admin.on('pageerror', (error) => consoleErrors.push(`admin: ${error.message}`))
  await login(admin, 'admin', '123')
  await admin.waitForURL('**/admin')
  for (const [label, path, heading] of [
    ['Thực đơn', '/admin/menu', 'Quản lý thực đơn'],
    ['Đơn hàng', '/admin/orders', 'Đơn hàng'],
    ['Đặt chỗ', '/admin/reservations', 'Đặt chỗ'],
    ['Bàn ăn', '/admin/tables', 'Bàn ăn'],
    ['Tài khoản', '/admin/accounts', 'Tài khoản'],
    ['Thanh toán', '/admin/payments', 'Thanh toán'],
  ]) {
    await admin.getByRole('link', { name: label, exact: true }).click()
    await admin.waitForURL(`**${path}`)
    await admin.getByRole('heading', { name: heading, exact: true }).waitFor()
  }

  if (consoleErrors.length) throw new Error(`Browser console errors: ${consoleErrors.join(' | ')}`)
  await browser.close()
  console.log(JSON.stringify({ passed: true, checks: ['customer reservations', 'customer delivery and pickup checkout', 'admin dashboard', 'admin menu', 'admin orders', 'admin reservations', 'admin tables', 'admin accounts', 'admin payments'], consoleErrors }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
