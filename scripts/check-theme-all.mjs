import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const browser = await chromium.launch({ args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto(`${BASE}/api/auth/login`).catch(() => {})
await page.goto(BASE, { waitUntil: 'domcontentloaded' })
await page.evaluate(async () => {
  await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@mapdocs.vn', password: '123456' })
  })
})

const PAGES = [
  ['landing', '/'],
  ['dashboard', '/dashboard'],
  ['admin', '/admin']
]

async function read() {
  return await page.evaluate(() => {
    const mdk = document.querySelector('.mdk')
    const card = document.querySelector('.card, .stat-card')
    return {
      html: document.documentElement.className,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      mdkBg: mdk ? getComputedStyle(mdk).backgroundColor : null,
      mdkColor: mdk ? getComputedStyle(mdk).color : null,
      cardBg: card ? getComputedStyle(card).backgroundColor : null
    }
  })
}

for (const [name, path] of PAGES) {
  for (const mode of ['light', 'dark']) {
    await page.addInitScript((m) => localStorage.setItem('mapdocs:theme', m), mode)
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2500)
    const data = await read()
    await page.screenshot({ path: `screenshots/theme-${name}-${mode}.png` })
    console.log(`${name.padEnd(10)} ${mode.padEnd(6)}`, JSON.stringify(data))
  }
}

await page.addInitScript(() => localStorage.removeItem('mapdocs:theme'))
await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2000)
console.log('admin before toggle', JSON.stringify(await read()))
const btn = await page.$('button[aria-label="Đổi giao diện sáng tối"]')
if (btn) {
  await btn.click()
  await page.waitForTimeout(1200)
  console.log('admin after toggle ', JSON.stringify(await read()))
} else {
  console.log('TOGGLE BUTTON NOT FOUND on /admin')
}

await browser.close()
console.log('Done')
