/* Mock-only regression: no backend, real credentials, SMTP, or AI requests are used.
 * Start Vite separately; set APP_URL and provide the existing Playwright runtime via NODE_PATH.
 */
const assert = require('node:assert/strict')
const { chromium } = require('playwright')

const base = process.env.APP_URL || 'http://127.0.0.1:5188'
const account = (id) => ({ accountId: id, username: `review-${id}`, role: 'CUSTOMER', userProfile: { fullName: `Review ${id}` } })
const notice = (id, page) => ({
  noticeId: id * 10 + page, kind: 'PAYMENT_RECEIPT', title: `Private notice ${id} page ${page}`,
  body: `Private order of ${id}`, path: '/orders', createdAt: '2026-10-24T10:00:00+07:00', readAt: null,
  receipt: { rows: [{ kind: 'paid', label: `Private receipt ${id}`, amount: 100000 }] },
})
const deferred = () => {
  let resolve
  const promise = new Promise((done) => { resolve = done })
  return { promise, resolve }
}
const authorize = (page, id) => page.evaluate((user) => {
  localStorage.setItem('restaurant_access_token', `review-token-${user.accountId}`)
  localStorage.setItem('restaurant_account', JSON.stringify(user))
}, account(id))

async function scenario(browser, delayedOldResponse) {
  const context = await browser.newContext()
  const gateB = deferred()
  const gateA = deferred()
  const requestedB = deferred()
  const delayedARequested = deferred()
  const deliveredA = deferred()
  const bPages = []
  let delayA = false
  const errors = []
  try {
    await context.route('**/*', async (route) => {
      const request = route.request()
      if (new URL(request.url()).origin === new URL(base).origin && !request.url().includes('/api/v1/')) return route.continue()
      if (!request.url().includes('/api/v1/')) return route.abort()
      const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' }
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
      const id = request.headers().authorization === 'Bearer review-token-2' ? 2 : 1
      const url = new URL(request.url())
      let data = {}
      if (url.pathname.endsWith('/customer/notifications') && request.method() === 'GET') {
        const pageNumber = Number(url.searchParams.get('page') || 1)
        if (id === 2) {
          bPages.push(pageNumber)
          requestedB.resolve()
          await gateB.promise
        }
        if (id === 1 && delayA && pageNumber === 2) {
          delayedARequested.resolve()
          await gateA.promise
        }
        data = { items: [notice(id, pageNumber)], unreadCount: 1, pagination: { currentPage: pageNumber, totalPages: 2 } }
      } else if (url.pathname.endsWith('/support/current')) data = { conversation: null }
      else if (url.pathname.endsWith('/cart')) data = { items: [], totalQuantity: 0, estimatedTotalAmount: 0 }
      try {
        await route.fulfill({ contentType: 'application/json', headers, body: JSON.stringify({ success: true, data }) })
      } catch (error) {
        if (!/closed|disposed|intercept|invalid/i.test(error.message)) throw error
      } finally {
        if (id === 1 && delayA && url.searchParams.get('page') === '2') deliveredA.resolve()
      }
    })
    const otherTab = await context.newPage()
    await otherTab.goto(`${base}/login`)
    await authorize(otherTab, 1)
    const page = await context.newPage()
    page.on('pageerror', (error) => errors.push(error.message))
    page.setDefaultTimeout(7000)
    await page.goto(`${base}/notifications`)
    await page.getByRole('heading', { name: 'Private notice 1 page 1', exact: true }).waitFor()
    if (delayedOldResponse) delayA = true
    await page.getByRole('button', { name: 'Trang sau →', exact: true }).click()
    if (delayedOldResponse) await delayedARequested.promise
    else {
      await page.getByRole('heading', { name: 'Private notice 1 page 2', exact: true }).waitFor()
      await page.getByRole('button', { name: 'Xem biên nhận', exact: true }).click()
      await page.getByText('Private receipt 1', { exact: true }).waitFor()
    }

    await authorize(otherTab, 2)
    await page.getByTitle('Đăng xuất Review 2', { exact: true }).waitFor({ state: 'attached' })
    assert.equal(await page.getByText('Private receipt 1', { exact: true }).count(), 0, 'old receipt must unmount immediately')
    assert.equal(await page.locator('article').filter({ hasText: 'Private order of 1' }).count(), 0, 'old notifications must disappear before the new response')
    assert.equal(await page.getByRole('dialog').count(), 0, 'old modal must close')
    await requestedB.promise
    assert.ok(bPages.every((value) => value === 1), 'new account starts on page 1')
    gateB.resolve()
    await page.getByRole('heading', { name: 'Private notice 2 page 1', exact: true }).waitFor()
    if (delayedOldResponse) {
      gateA.resolve()
      await deliveredA.promise
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      assert.equal(await page.locator('article').filter({ hasText: 'Private order of 1' }).count(), 0, 'late old-account response must be discarded')
    }
    assert.equal(await page.getByText('Private receipt 1', { exact: true }).count(), 0)
    assert.deepEqual(errors, [])
    console.log(`PASS ${delayedOldResponse ? 'late old-account response ignored' : 'receipt, list, and pagination cleared on account switch'}`)
  } finally {
    gateA.resolve()
    gateB.resolve()
    await context.close()
  }
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  try {
    await scenario(browser, false)
    await scenario(browser, true)
  } finally { await browser.close() }
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
