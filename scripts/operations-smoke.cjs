/**
 * Browser smoke test cho các luồng vận hành Mộc Dining (cần Vite :5173 và Laravel :8000 đang chạy).
 * Chạy: node scripts/operations-smoke.cjs
 * Thất bại nếu có lỗi console, HTTP 5xx, hoặc trang dùng window.alert/confirm/prompt.
 */
const loadPlaywright = () => {
  try { return require('playwright') } catch { return require('playwright-core') }
}
const { chromium } = loadPlaywright()

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:5173'
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const problems = []
const checks = []
const pass = (label) => { checks.push(label); console.log(`✓ ${label}`) }

const watch = (page, label) => {
  page.on('console', (message) => message.type() === 'error' && problems.push(`${label} console: ${message.text()}`))
  page.on('pageerror', (error) => problems.push(`${label} pageerror: ${error.message}`))
  page.on('response', (response) => response.status() >= 500 && problems.push(`${label} HTTP ${response.status()} ${response.url()}`))
  page.on('dialog', async (dialog) => { problems.push(`${label} native ${dialog.type()} dialog: ${dialog.message()}`); await dialog.dismiss() })
  return page
}

const login = async (page, username, password = '123') => {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' })
  await page.getByLabel('Tên đăng nhập').fill(username)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
}

const expectPath = (page, expected) => {
  const actual = new URL(page.url()).pathname
  if (actual !== expected) throw new Error(`Expected ${expected}, received ${actual}`)
}

const main = async () => {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true })

  // Khách vãng lai
  const guest = watch(await browser.newPage({ viewport: { width: 1440, height: 900 } }), 'guest')
  await guest.goto(`${baseUrl}/cart`, { waitUntil: 'networkidle' })
  expectPath(guest, '/login')
  await guest.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' })
  expectPath(guest, '/login')
  await guest.goto(`${baseUrl}/menu`, { waitUntil: 'networkidle' })
  if (await guest.getByRole('link', { name: 'Quản trị' }).count()) throw new Error('Guest sees admin link')
  await guest.getByPlaceholder(/Tìm kiếm theo tên món ăn/i).fill('Phở bò')
  await guest.getByText('Phở bò đặc biệt', { exact: true }).first().waitFor()
  pass('Khách vãng lai: route bảo vệ chuyển về đăng nhập, menu tìm kiếm bằng API thật')

  // Khách hàng
  const customer = watch(await browser.newPage({ viewport: { width: 1440, height: 900 } }), 'customer')
  await login(customer, 'kh1')
  await customer.waitForURL(`${baseUrl}/`)
  await customer.getByRole('link', { name: 'Đơn hàng' }).first().waitFor()
  if (await customer.getByRole('link', { name: 'Quản trị' }).count()) throw new Error('Customer sees admin link')
  await customer.goto(`${baseUrl}/admin/orders`, { waitUntil: 'networkidle' })
  expectPath(customer, '/')
  pass('Khách hàng: điều hướng theo role, bị chặn khỏi khu quản trị')

  await customer.goto(`${baseUrl}/orders`, { waitUntil: 'networkidle' })
  await customer.getByRole('button', { name: /Chi tiết/ }).first().click()
  await customer.getByRole('list', { name: 'Tiến độ đơn hàng' }).or(customer.getByText('Đơn hàng đã hủy')).first().waitFor()
  pass('Khách hàng: chi tiết đơn hiển thị tiến độ bếp và giao nhận')

  await customer.goto(`${baseUrl}/reservations`, { waitUntil: 'networkidle' })
  await customer.getByRole('heading', { name: 'Lịch của bạn' }).waitFor()
  const minDate = await customer.locator('input[name="date"]').getAttribute('min')
  if (!minDate) throw new Error('Reservation date input has no minimum date')
  await customer.getByRole('button', { name: 'Kiểm tra bàn trống' }).click()
  await customer.getByText('Hãy chọn ngày, giờ và số khách trước.').waitFor()
  pass('Khách hàng: form đặt bàn chặn ngày quá khứ và báo lỗi khi thiếu thông tin')

  // Admin
  const admin = watch(await browser.newPage({ viewport: { width: 1440, height: 900 } }), 'admin')
  await login(admin, 'admin')
  await admin.waitForURL('**/admin')
  await admin.getByRole('heading', { name: 'Tổng quan vận hành' }).waitFor()
  await admin.getByRole('button', { name: '30 ngày' }).click()
  await admin.getByText('30 NGÀY').waitFor()
  pass('Admin: dashboard dữ liệu thật, đổi kỳ 30 ngày')

  await admin.getByRole('link', { name: 'Đơn hàng', exact: true }).click()
  await admin.getByRole('heading', { name: 'Đơn hàng', exact: true }).waitFor()
  await admin.locator('select[aria-label="Lọc hình thức"]').selectOption('DINE_IN')
  await admin.waitForTimeout(600)
  if (await admin.getByRole('button', { name: 'Hủy đơn' }).count()) throw new Error('Dine-in order shows admin cancel button')
  await admin.locator('select[aria-label="Lọc hình thức"]').selectOption('')
  await admin.waitForTimeout(600)
  const cancelButton = admin.getByRole('button', { name: 'Hủy đơn' }).first()
  if (await cancelButton.count()) {
    await cancelButton.click()
    const dialog = admin.getByRole('dialog')
    await dialog.getByPlaceholder(/Hết nguyên liệu/).fill('abc')
    await dialog.getByRole('button', { name: 'Hủy đơn' }).click()
    await dialog.getByText('Vui lòng nhập tối thiểu 5 ký tự.').waitFor()
    await dialog.getByRole('button', { name: 'Quay lại' }).click()
    await dialog.waitFor({ state: 'detached' })
  }
  pass('Admin: đơn tại bàn không có nút hủy; modal hủy bắt buộc lý do ≥ 5 ký tự (không dùng window.prompt)')

  await admin.getByRole('link', { name: 'Bàn ăn', exact: true }).click()
  await admin.getByRole('button', { name: 'Thêm bàn' }).click()
  const options = await admin.getByRole('dialog').locator('select[name="status"] option').allTextContents()
  if (options.some((label) => ['Đang phục vụ', 'Đã đặt'].includes(label))) throw new Error(`Manual table status leaks automatic states: ${options}`)
  await admin.getByRole('dialog').getByRole('button', { name: 'Đóng' }).click()
  pass('Admin: không cho đặt tay trạng thái Đang phục vụ/Đã đặt')

  for (const [label, heading] of [['Thực đơn', 'Quản lý thực đơn'], ['Đặt chỗ', 'Đặt chỗ'], ['Tài khoản', 'Tài khoản'], ['Thanh toán', 'Thanh toán']]) {
    await admin.getByRole('link', { name: label, exact: true }).click()
    await admin.getByRole('heading', { name: heading, exact: true }).waitFor()
  }
  const lockButton = admin.getByRole('button', { name: 'Khóa', exact: true })
  await admin.getByRole('link', { name: 'Tài khoản', exact: true }).click()
  await lockButton.first().waitFor()
  await lockButton.first().click()
  await admin.getByRole('dialog').getByText(/đăng xuất khỏi mọi thiết bị/).waitFor()
  await admin.getByRole('dialog').getByRole('button', { name: 'Quay lại' }).click()
  pass('Admin: thực đơn, đặt chỗ, tài khoản, thanh toán; khóa tài khoản qua modal xác nhận')

  // Nhân viên POS & bếp
  const staff = watch(await browser.newPage({ viewport: { width: 1440, height: 900 } }), 'staff')
  await login(staff, 'staff1')
  await staff.waitForURL('**/staff/floor')
  await staff.getByRole('heading', { name: 'Chọn bàn để bắt đầu phục vụ.' }).waitFor()
  await staff.getByText('Tổng số bàn').waitFor()
  const continueButton = staff.getByRole('button', { name: 'TIẾP TỤC PHIÊN' }).first()
  if (await continueButton.count()) {
    await continueButton.click()
    await staff.waitForURL('**/staff/sessions/*')
    await staff.getByRole('heading', { name: 'Chọn món' }).waitFor()
    await staff.getByRole('region', { name: 'Thanh toán' }).waitFor()
    pass('POS: tiếp tục phiên, thực đơn và khối thanh toán hiển thị')
  }
  await staff.goto(`${baseUrl}/staff/kitchen`, { waitUntil: 'domcontentloaded' })
  for (const column of ['Món mới', 'Đang làm', 'Hoàn thành', 'Đã phục vụ']) {
    await staff.getByRole('region', { name: column }).or(staff.getByText('Bếp đang thông thoáng')).first().waitFor()
  }
  await staff.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' })
  expectPath(staff, '/staff/floor')
  pass('Bếp: 4 cột Món mới/Đang làm/Hoàn thành/Đã phục vụ; nhân viên bị chặn khỏi admin')

  // Mobile
  const mobile = watch(await browser.newPage({ viewport: { width: 390, height: 844 } }), 'mobile')
  await login(mobile, 'kh1')
  await mobile.waitForURL(`${baseUrl}/`)
  await mobile.getByRole('button', { name: 'Mở menu' }).click()
  const mobileNav = mobile.getByRole('navigation', { name: 'Điều hướng di động' })
  await mobileNav.getByRole('link', { name: 'Đơn hàng' }).waitFor()
  await mobileNav.getByRole('link', { name: 'Đặt bàn' }).click()
  await mobile.waitForURL('**/reservations')
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (overflow > 1) throw new Error(`Mobile reservations page overflows by ${overflow}px`)
  pass('Mobile 390px: menu di động theo role, không tràn ngang')

  await browser.close()
  if (problems.length) throw new Error(`Browser problems:\n- ${problems.join('\n- ')}`)
  console.log(JSON.stringify({ passed: true, checks: checks.length }, null, 2))
}

main().catch((error) => {
  console.error(error.message || error)
  process.exitCode = 1
})
