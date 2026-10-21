const loadPlaywright = () => {
  try { return require('playwright') } catch { return require('playwright-core') }
}
const { chromium } = loadPlaywright()

const baseUrl = 'http://127.0.0.1:5173'

const expectPath = (page, expected) => {
  const actual = new URL(page.url()).pathname
  if (actual !== expected) throw new Error(`Expected path ${expected}, received ${actual}`)
}

const main = async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const consoleErrors = []
  page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()))
  page.on('pageerror', (error) => consoleErrors.push(error.message))

  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' })
  await page.getByLabel('Tên đăng nhập').fill('staff1')
  await page.locator('#password').fill('123')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await page.waitForURL('**/staff/floor')
  expectPath(page, '/staff/floor')

  await page.getByRole('button', { name: 'TIẾP TỤC PHIÊN' }).click()
  await page.waitForURL('**/staff/sessions/*')
  if (!new URL(page.url()).pathname.startsWith('/staff/sessions/')) {
    throw new Error(`Expected staff session route, received ${page.url()}`)
  }

  await page.getByRole('link', { name: 'Bếp' }).click()
  await page.waitForURL('**/staff/kitchen')
  expectPath(page, '/staff/kitchen')

  await page.goto(`${baseUrl}/menu`, { waitUntil: 'networkidle' })
  await page.getByPlaceholder(/Tìm kiếm theo tên món ăn/i).fill('Phở bò')
  await page.waitForTimeout(500)
  const visibleDish = await page.getByText('Phở bò đặc biệt', { exact: true }).count()
  if (!visibleDish) throw new Error('Menu search did not show Phở bò đặc biệt')

  if (consoleErrors.length) throw new Error(`Browser console errors: ${consoleErrors.join(' | ')}`)
  await browser.close()
  console.log(JSON.stringify({ passed: true, checks: ['staff login', 'floor to session', 'session to kitchen', 'menu search'], consoleErrors }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
