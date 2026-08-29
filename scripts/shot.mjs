import { chromium } from 'playwright'
const [, , path, out, w, h, dark] = process.argv
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: +(w || 1440), height: +(h || 900) } })
if (dark === 'dark') await page.addInitScript(() => localStorage.setItem('mapdocs:theme', 'dark'))
await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
await page.screenshot({ path: out, fullPage: h === 'full' })
await browser.close()
console.log('saved', out)
