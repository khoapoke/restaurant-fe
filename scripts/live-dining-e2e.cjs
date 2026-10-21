/**
 * Browser E2E cho Mộc Live Dining: hai browser context chạy song song
 * (nhân viên POS/KDS trên desktop và khách quét QR trên mobile 390px).
 *
 * Cần: Vite :5173, Laravel :8000 và repo backend ở BACKEND_DIR (mặc định ../restaurant-lavarel).
 * Chạy: node scripts/live-dining-e2e.cjs
 * Kịch bản tự gọi `php artisan dining:demo --json` để làm mới bàn demo trước khi chạy.
 * Thất bại nếu có lỗi console, HTTP 5xx, hộp thoại window.*, sai route hoặc lộ dữ liệu bàn khác.
 */
const { execFileSync } = require('node:child_process')
const path = require('node:path')

const loadPlaywright = () => {
  try { return require('playwright') } catch { return require('playwright-core') }
}
const { chromium } = loadPlaywright()

const baseUrl = process.env.APP_URL || 'http://localhost:5173'
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const backendDir = process.env.BACKEND_DIR || path.resolve(__dirname, '../../restaurant-lavarel')
const problems = []
const steps = []
const pass = (label) => { steps.push(label); console.log(`✓ ${steps.length}. ${label}`) }

const PRIVATE_KEYS = ['tableId', 'sessionId', 'staff', 'staffName', 'customerPhone', 'ma_ban', 'ma_phien', 'token_hash', 'visitId']

// Lỗi console được kịch bản cố tình gây ra (mã bàn sai, ngắt phản hồi) — chỉ bỏ qua đúng các mẫu này.
const expectedConsole = []
const watch = (page, label) => {
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    if (expectedConsole.some((rule) => rule.label === label && rule.pattern.test(message.text()))) return
    problems.push(`${label} console: ${message.text()}`)
  })
  page.on('pageerror', (error) => problems.push(`${label} pageerror: ${error.message}`))
  page.on('response', async (response) => {
    if (response.status() >= 500) problems.push(`${label} HTTP ${response.status()} ${response.url()}`)
    if (label === 'guest' && response.url().includes('/public/dine/') && response.request().method() !== 'OPTIONS') {
      try {
        const body = await response.text()
        PRIVATE_KEYS.forEach((key) => {
          if (body.includes(`"${key}"`)) problems.push(`guest response leaks "${key}": ${response.url()}`)
        })
      } catch {
        // Phản hồi đã bị huỷ (polling bị thay thế) — bỏ qua.
      }
    }
  })
  page.on('dialog', async (dialog) => { problems.push(`${label} native ${dialog.type()} dialog: ${dialog.message()}`); await dialog.dismiss() })
  return page
}

const expectPath = (page, expected) => {
  const actual = new URL(page.url()).pathname
  if (!(expected instanceof RegExp ? expected.test(actual) : actual === expected)) throw new Error(`Expected ${expected}, received ${actual}`)
}

const artisan = (...args) => execFileSync('php', ['artisan', ...args], { cwd: backendDir, encoding: 'utf8' })

const prepareDemo = () => JSON.parse(artisan('dining:demo', '--json').trim().split(/\r?\n/).pop())

const main = async () => {
  const demo = prepareDemo()
  const guestUrl = `${baseUrl}/dine/${demo.tableToken}`
  pass(`Chuẩn bị bàn demo ${demo.tableName} (${demo.cancelledSessions + demo.closedSessions} phiên cũ được dọn)`)

  const browser = await chromium.launch({ executablePath: chromePath, headless: true })
  const staffContext = await browser.newContext({ viewport: { width: 1440, height: 960 } })
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const staff = watch(await staffContext.newPage(), 'staff')
  const guest = watch(await guestContext.newPage(), 'guest')

  // Mã QR giả không mở được bàn nào (404 ở đây là kết quả mong đợi nên dùng trang riêng).
  const probe = await guestContext.newPage()
  probe.on('pageerror', (error) => problems.push(`probe pageerror: ${error.message}`))
  probe.on('dialog', async (dialog) => { problems.push(`probe native dialog: ${dialog.message()}`); await dialog.dismiss() })
  await probe.goto(`${baseUrl}/dine/${'x'.repeat(40)}`, { waitUntil: 'domcontentloaded' })
  await probe.getByRole('heading', { name: 'Mã QR không còn hiệu lực' }).waitFor()
  await probe.close()
  pass('Mã QR không hợp lệ hiển thị trạng thái lỗi, không lộ bàn nào')

  // Nhân viên mở Live Floor.
  await staff.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' })
  await staff.getByLabel('Tên đăng nhập').fill('staff1')
  await staff.locator('#password').fill('123')
  await staff.getByRole('button', { name: 'Đăng nhập' }).click()
  await staff.waitForURL('**/staff/floor')
  await staff.getByRole('heading', { name: 'Hàng đợi Live Dining' }).waitFor()

  // Khách mở link QR và xin nhận bàn.
  await guest.goto(guestUrl, { waitUntil: 'networkidle' })
  await guest.getByRole('heading', { name: demo.tableName, exact: true }).waitFor()
  pass('Khách mở link QR trên mobile, thấy đúng tên bàn')
  await guest.locator('#dine-guest-name').fill('Chị Mai')
  await guest.getByRole('button', { name: 'Tăng số khách' }).click()
  await guest.getByRole('button', { name: 'Yêu cầu nhận bàn' }).click()
  await guest.getByRole('heading', { name: 'Đã báo nhân viên' }).waitFor()
  pass('Khách gửi yêu cầu nhận bàn (3 khách)')

  // Nhân viên chấp nhận từ hàng đợi.
  const checkInRow = staff.locator('li', { hasText: `${demo.tableName} · xin nhận bàn` })
  await checkInRow.waitFor({ timeout: 10000 })
  await checkInRow.getByRole('button', { name: 'NHẬN KHÁCH' }).click()
  await staff.getByRole('button', { name: 'Nhận khách & mở thực đơn' }).click()
  await staff.getByText(`${demo.tableName} đã mở. Thực đơn đã hiện trên điện thoại của khách.`).waitFor()
  pass('POS nhận yêu cầu nổi bật và mở phiên phục vụ')

  // Khách tự chuyển sang thực đơn, thêm món và gửi bếp.
  await guest.getByRole('heading', { name: 'Chọn món cho bàn' }).waitFor({ timeout: 10000 })
  await guest.getByRole('button', { name: /^Thêm Phở bò/ }).click()
  await guest.getByRole('button', { name: /^Xem Bún chả/ }).click()
  await guest.locator('#dine-dish-note').fill('Ít hành')
  await guest.getByRole('button', { name: /^Thêm ·/ }).click()
  await guest.getByRole('button', { name: /Xem giỏ/ }).click()
  const sendButton = guest.getByRole('button', { name: 'Gửi bếp ngay' })
  await sendButton.click()
  await guest.getByRole('heading', { name: 'Bếp đã nhận món' }).waitFor()
  await guest.getByRole('button', { name: 'Theo dõi món' }).click()
  await guest.getByRole('heading', { name: 'Món của bàn' }).waitFor()
  pass('Khách tự chuyển sang thực đơn, thêm 2 món (có ghi chú) và gửi bếp')

  // Mời bạn cùng bàn: QR in sẵn không đủ, thiết bị mới cần mã bàn của đúng phiên này.
  await guest.getByRole('button', { name: /Mời bạn cùng bàn · mã \d{4}/ }).click()
  const joinCode = (await guest.locator('p[aria-label^="Mã bàn"]').textContent()).trim()
  await guest.keyboard.press('Escape')
  const friendContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const friend = watch(await friendContext.newPage(), 'friend')
  expectedConsole.push({ label: 'friend', pattern: /status of 403/ })
  await friend.goto(guestUrl, { waitUntil: 'networkidle' })
  await friend.getByRole('heading', { name: `${demo.tableName} đang phục vụ` }).waitFor()
  if (await friend.getByRole('heading', { name: 'Chọn món cho bàn' }).count()) problems.push('a new device saw the menu without the table code')
  await friend.locator('#dine-join-code').fill(joinCode === '0000' ? '1111' : '0000')
  await friend.getByRole('button', { name: 'Tham gia gọi món' }).click()
  await friend.getByText('Mã bàn chưa đúng. Hãy hỏi người cùng bàn hoặc nhân viên để lấy mã hiện tại.').waitFor()
  await friend.locator('#dine-join-code').fill(joinCode)
  await friend.getByRole('button', { name: 'Tham gia gọi món' }).click()
  await friend.getByRole('heading', { name: 'Chọn món cho bàn' }).waitFor({ timeout: 10000 })
  const inviteContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const inviteGuest = watch(await inviteContext.newPage(), 'invite')
  await inviteGuest.goto(`${guestUrl}#code=${joinCode}`, { waitUntil: 'domcontentloaded' })
  await inviteGuest.getByRole('heading', { name: 'Chọn món cho bàn' }).waitFor({ timeout: 10000 })
  if (new URL(inviteGuest.url()).hash) problems.push('invite code stays in the URL after joining')
  await inviteContext.close()
  pass(`Thiết bị mới phải nhập mã bàn: mã sai bị từ chối, mã ${joinCode} hoặc link mời thì vào được`)

  // Mất phản hồi: backend thật đã nhận lượt món nhưng trình duyệt không nhận được kết quả.
  const orderKeys = []
  guest.on('request', (request) => {
    if (request.method() === 'POST' && /\/public\/dine\/[^/]+\/orders$/.test(request.url())) orderKeys.push(request.headers()['idempotency-key'])
  })
  expectedConsole.push({ label: 'guest', pattern: /ERR_CONNECTION_RESET|ERR_FAILED/ })
  await guest.getByRole('button', { name: 'Thực đơn', exact: true }).click()
  await guest.getByRole('button', { name: /^Thêm Trà đào/ }).click()
  await guest.route('**/public/dine/*/orders', async (route) => {
    await route.fetch()
    await route.abort('connectionreset')
  })
  await guest.getByRole('button', { name: /Xem giỏ/ }).click()
  await guest.getByRole('button', { name: 'Gửi bếp ngay' }).click()
  await guest.getByText('Chưa nhận được xác nhận từ bếp. Lượt món vẫn được giữ nguyên, bạn có thể gửi lại an toàn mà không bị trùng.').first().waitFor()
  await guest.keyboard.press('Escape')
  await guest.getByRole('region', { name: 'Lượt món chưa xác nhận' }).waitFor()
  await guest.unroute('**/public/dine/*/orders')
  await guest.reload({ waitUntil: 'domcontentloaded' })
  await guest.getByRole('heading', { name: 'Bếp đã nhận món' }).waitFor({ timeout: 10000 })
  await guest.getByText(/đã đến bếp từ lần gửi trước/).waitFor()
  await guest.getByRole('button', { name: 'Theo dõi món' }).click()
  const uniqueKeys = [...new Set(orderKeys)]
  if (orderKeys.length < 2 || uniqueKeys.length !== 1) problems.push(`retry after reload must reuse one Idempotency-Key, saw ${JSON.stringify(orderKeys)}`)
  const ticketCount = Number(artisan('tinker', '--execute', `echo \\App\\Models\\KitchenTicket::where('idempotency_key', '${uniqueKeys[0]}')->count();`).trim().split(/\r?\n/).pop())
  const lineCount = Number(artisan('tinker', '--execute', `echo \\App\\Models\\OrderItem::where('client_request_id', 'like', '${uniqueKeys[0]}:%')->count();`).trim().split(/\r?\n/).pop())
  if (ticketCount !== 1 || lineCount !== 1) problems.push(`lost-response retry stored ${ticketCount} rounds / ${lineCount} lines (expected 1 / 1)`)
  pass(`Mất phản hồi + reload: gửi lại cùng 1 key, database chỉ có ${ticketCount} lượt món`)

  // Bếp nhận món QR.
  await staff.goto(`${baseUrl}/staff/kitchen`, { waitUntil: 'domcontentloaded' })
  await staff.getByRole('button', { name: /^QR tại bàn/ }).click()
  const phoCard = staff.locator('article', { hasText: 'Phở bò đặc biệt' }).filter({ hasText: `QR ${demo.tableName}` })
  await phoCard.waitFor({ timeout: 10000 })
  pass('KDS hiển thị món với nguồn “QR Bàn …” trong bộ lọc QR tại bàn')

  await phoCard.getByRole('button', { name: 'NHẬN MÓN' }).click()
  await phoCard.getByRole('button', { name: 'BẮT ĐẦU NẤU' }).click()
  await staff.getByRole('region', { name: 'Đang làm' }).locator('article', { hasText: 'Phở bò đặc biệt' }).waitFor()
  pass('Bếp chuyển món sang Đang chế biến')

  const guestPho = guest.locator('li', { hasText: 'Phở bò đặc biệt' }).first()
  await guestPho.getByText('Đang chế biến', { exact: true }).first().waitFor({ timeout: 10000 })
  await guestPho.getByText(/Đang được chuẩn bị/).waitFor()
  pass('Khách thấy “Đang chế biến” mà không tải lại trang')

  await phoCard.getByRole('button', { name: 'BÁO SẴN SÀNG' }).click()
  await phoCard.getByRole('button', { name: 'ĐÃ PHỤC VỤ' }).click()
  await staff.getByRole('region', { name: 'Đã phục vụ' }).locator('article', { hasText: 'Phở bò đặc biệt' }).waitFor()
  const bunCard = staff.locator('article', { hasText: 'Bún chả Hà Nội' }).filter({ hasText: `QR ${demo.tableName}` })
  const teaCard = staff.locator('article', { hasText: 'Trà đào' }).filter({ hasText: `QR ${demo.tableName}` })
  for (const card of [bunCard, teaCard]) {
    for (const action of ['NHẬN MÓN', 'BẮT ĐẦU NẤU', 'BÁO SẴN SÀNG']) {
      await card.getByRole('button', { name: action }).click()
    }
  }
  await guestPho.locator('span', { hasText: 'Đã phục vụ' }).first().waitFor({ timeout: 10000 })
  pass('Bếp hoàn tất và phục vụ; khách thấy “Đã phục vụ”')

  // Gọi nhân viên.
  await guest.getByRole('button', { name: 'Gọi phục vụ' }).click()
  await guest.getByRole('button', { name: /^Gọi nhân viên/ }).click()
  await guest.getByText('Đã báo nhân viên. Bạn sẽ thấy trạng thái cập nhật ngay bên dưới.').waitFor()
  pass('Khách gọi nhân viên từ service request sheet')

  await staff.goto(`${baseUrl}/staff/floor`, { waitUntil: 'domcontentloaded' })
  const callRow = staff.locator('li', { hasText: `${demo.tableName} · Gọi nhân viên` })
  await callRow.getByRole('button', { name: 'NHẬN', exact: true }).click()
  await guest.getByText('Nhân viên đang đến').first().waitFor({ timeout: 10000 })
  await staff.locator('li', { hasText: `${demo.tableName} · Gọi nhân viên` }).getByRole('button', { name: 'XONG', exact: true }).click()
  await staff.locator('li', { hasText: `${demo.tableName} · Gọi nhân viên` }).waitFor({ state: 'detached', timeout: 10000 })
  pass('Nhân viên nhận (khách thấy “Nhân viên đang đến”) và hoàn thành yêu cầu')

  // Yêu cầu thanh toán.
  await guest.keyboard.press('Escape')
  await guest.getByRole('button', { name: 'Hóa đơn', exact: true }).click()
  await guest.getByRole('button', { name: 'Yêu cầu thanh toán' }).click()
  await guest.getByRole('button', { name: 'Chuyển khoản QR' }).click()
  await guest.getByRole('button', { name: 'Gửi yêu cầu' }).click()
  await guest.getByText('Đã báo nhân viên. Bạn sẽ thấy trạng thái cập nhật ngay bên dưới.').waitFor()
  await guest.keyboard.press('Escape')
  pass('Khách yêu cầu thanh toán bằng chuyển khoản QR')

  const paymentRow = staff.locator('li', { hasText: `${demo.tableName} · Yêu cầu thanh toán` })
  await paymentRow.waitFor({ timeout: 10000 })
  await staff.getByText(/bàn xin thanh toán/).waitFor()
  await paymentRow.locator('button').first().click()
  await staff.waitForURL(/\/staff\/sessions\/\d+/)
  await staff.getByRole('button', { name: 'LẬP HÓA ĐƠN' }).click()
  await staff.getByText('Đã lập hóa đơn cho phiên.').waitFor()
  pass('Yêu cầu thanh toán được ưu tiên trên POS; nhân viên lập hóa đơn')

  await guest.getByRole('heading', { name: /^Hóa đơn HD/ }).waitFor({ timeout: 10000 })
  await guest.getByText('Đang chờ xác nhận thanh toán').waitFor()
  await guest.getByRole('img', { name: /Mã VietQR thanh toán/ }).waitFor()
  await guest.getByText(/^HD\d+ THANH TOAN/).waitFor()
  pass('Khách thấy hóa đơn, VietQR, nội dung chuyển khoản và trạng thái chờ')

  // Thanh toán và đóng phiên.
  await staff.getByRole('radio', { name: 'Chuyển khoản' }).click()
  await staff.getByPlaceholder('Ví dụ: FT26102100123').fill('FT-LIVE-DEMO-001')
  await staff.getByRole('button', { name: 'XÁC NHẬN ĐÃ NHẬN CHUYỂN KHOẢN' }).click()
  await guest.getByText(/Đã thanh toán · Chuyển khoản QR/).first().waitFor({ timeout: 10000 })
  pass('Nhân viên xác nhận chuyển khoản; trang khách tự cập nhật “Đã thanh toán”')

  await staff.getByRole('button', { name: /ĐÓNG PHIÊN/ }).click()
  await staff.waitForURL('**/staff/floor')
  await guest.getByRole('heading', { name: 'Bữa ăn đã hoàn tất' }).waitFor({ timeout: 10000 })
  await guest.getByRole('article', { name: 'Hóa đơn điện tử' }).waitFor()
  pass('Nhân viên đóng phiên; khách thấy “Bữa ăn đã hoàn tất” cùng hóa đơn điện tử')

  // Không còn gọi món được sau khi phiên đóng, và không lộ dữ liệu bàn khác.
  expectPath(guest, `/dine/${demo.tableToken}`)
  const guestText = await guest.locator('body').innerText()
  for (const otherTable of ['Bàn T04', 'Bàn VIP01', 'staff1']) {
    if (guestText.includes(otherTable)) problems.push(`guest page shows foreign data: ${otherTable}`)
  }
  if (await guest.getByRole('button', { name: 'Thực đơn' }).count()) problems.push('guest can still open the menu after the session closed')
  pass('Trang khách đúng route, không còn thực đơn và không chứa dữ liệu bàn/nhân viên khác')

  // Bữa ăn mới của khách khác trên cùng bàn: người giữ QR/pass cũ không tự vào được.
  await staff.goto(`${baseUrl}/staff/floor`, { waitUntil: 'domcontentloaded' })
  const demoCard = staff.locator('article', { has: staff.getByRole('heading', { name: demo.tableName, exact: true }) })
  await demoCard.getByRole('button', { name: /ĐÃ VỆ SINH/ }).click()
  await demoCard.getByRole('button', { name: 'MỞ PHIÊN PHỤC VỤ' }).click()
  await staff.getByRole('button', { name: 'Xác nhận mở bàn' }).click()
  await staff.waitForURL(/\/staff\/sessions\/\d+/)
  const newCode = (await staff.getByTitle('Khách mới nhập mã này để tham gia gọi món').locator('strong').textContent()).trim()
  await guest.getByRole('button', { name: /lượt phục vụ mới|Bắt đầu lượt mới/ }).click()
  await guest.getByRole('heading', { name: `${demo.tableName} đang phục vụ` }).waitFor({ timeout: 10000 })
  await friend.reload({ waitUntil: 'networkidle' })
  for (const [label, page] of [['guest', guest], ['friend', friend]]) {
    if (await page.getByRole('heading', { name: 'Chọn món cho bàn' }).count()) problems.push(`${label} from the previous meal can see the new menu`)
    if ((await page.locator('body').innerText()).includes(newCode)) problems.push(`${label} from the previous meal can see the new table code`)
  }
  pass('Khách của bữa trước (kể cả xoá pass) không tự vào bữa mới, không thấy mã bàn mới')

  await friendContext.close()
  prepareDemo()

  await browser.close()

  if (problems.length) {
    console.error('\nProblems found:')
    problems.forEach((problem) => console.error(`- ${problem}`))
    process.exit(1)
  }
  console.log(`\nLive Dining E2E passed: ${steps.length} steps, 0 console errors, 0 HTTP 5xx, 0 native dialogs.`)
}

main().catch((error) => {
  console.error(error)
  if (problems.length) problems.forEach((problem) => console.error(`- ${problem}`))
  process.exit(1)
})
