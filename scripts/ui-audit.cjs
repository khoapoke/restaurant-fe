const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const baseUrl = 'http://127.0.0.1:5173'
const apiUrl = 'http://127.0.0.1:8000/api/v1'
const outputDir = process.argv[2] || path.join(process.cwd(), 'ui-audit-output')
const viewport = process.env.UI_AUDIT_MOBILE === '1'
  ? { width: 390, height: 844 }
  : { width: 1440, height: 900 }

const login = async (username, password) => {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password, rememberMe: false }),
  })
  if (!response.ok) throw new Error(`Login failed for ${username}: ${response.status}`)
  return (await response.json()).data
}

const auditPage = async (context, name, route) => {
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()))
  page.on('pageerror', (error) => consoleErrors.push(error.message))
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true })
  const visualIssues = await page.evaluate(() => {
    const parseColor = (value) => {
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
      return match ? [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])] : null
    }
    const luminance = ([r, g, b]) => {
      const values = [r, g, b].map((value) => {
        const normalized = value / 255
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2]
    }
    const contrast = (foreground, background) => {
      const light = Math.max(luminance(foreground), luminance(background))
      const dark = Math.min(luminance(foreground), luminance(background))
      return (light + 0.05) / (dark + 0.05)
    }
    const effectiveBackground = (element) => {
      let current = element
      while (current) {
        const parsed = parseColor(getComputedStyle(current).backgroundColor)
        if (parsed && parsed[3] >= 0.95) return parsed
        current = current.parentElement
      }
      return [255, 255, 255, 1]
    }

    return [...document.querySelectorAll('body *')]
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        const ownText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
        return ownText && rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
      })
      .map((element) => {
        const style = getComputedStyle(element)
        const foreground = parseColor(style.color)
        const background = effectiveBackground(element)
        const ratio = foreground ? contrast(foreground, background) : 21
        return {
          tag: element.tagName,
          text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 90),
          fontSize: Number.parseFloat(style.fontSize),
          fontWeight: style.fontWeight,
          color: style.color,
          background: `rgb(${background[0]}, ${background[1]}, ${background[2]})`,
          contrast: Number(ratio.toFixed(2)),
        }
      })
      .filter((item) => item.contrast < 4.5 || item.fontSize < 12)
      .sort((a, b) => a.contrast - b.contrast || a.fontSize - b.fontSize)
      .slice(0, 100)
  })
  const layout = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    overflowing: [...document.querySelectorAll('body *')]
      .map((element) => ({
        tag: element.tagName,
        className: typeof element.className === 'string' ? element.className.slice(0, 180) : '',
        text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 70),
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
      }))
      .filter((item) => item.left < -1 || item.right > window.innerWidth + 1)
      .slice(0, 30),
  }))
  const result = { name, route, title: await page.title(), finalUrl: page.url(), consoleErrors, visualIssues, layout }
  await page.close()
  return result
}

const main = async () => {
  fs.mkdirSync(outputDir, { recursive: true })
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
  const results = []

  const guest = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  for (const [name, route] of [['home', '/'], ['login', '/login'], ['menu', '/menu']]) {
    results.push(await auditPage(guest, name, route))
  }
  await guest.close()

  const staffAuth = await login('staff1', '123')
  const staff = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  await staff.addInitScript(({ token, account }) => {
    localStorage.setItem('restaurant_access_token', token)
    localStorage.setItem('restaurant_account', JSON.stringify(account))
  }, { token: staffAuth.accessToken, account: staffAuth.account })
  for (const [name, route] of [['staff-floor', '/staff/floor'], ['staff-session', '/staff/sessions/1'], ['staff-kitchen', '/staff/kitchen']]) {
    results.push(await auditPage(staff, name, route))
  }
  await staff.close()

  const adminAuth = await login('admin', '123')
  const admin = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  await admin.addInitScript(({ token, account }) => {
    localStorage.setItem('restaurant_access_token', token)
    localStorage.setItem('restaurant_account', JSON.stringify(account))
  }, { token: adminAuth.accessToken, account: adminAuth.account })
  results.push(await auditPage(admin, 'admin', '/admin'))
  await admin.close()

  await browser.close()
  fs.writeFileSync(path.join(outputDir, 'report.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results.map(({ name, finalUrl, consoleErrors, visualIssues, layout }) => ({ name, finalUrl, consoleErrors, issueCount: visualIssues.length, worst: visualIssues.slice(0, 8), layout })), null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
