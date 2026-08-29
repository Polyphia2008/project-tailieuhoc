import { chromium } from 'playwright'

const B = 'http://localhost:3000'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto(B + '/auth/dang-nhap', { waitUntil: 'networkidle' })
await page.fill('input[type="email"]', 'admin@mapdocs.vn')
await page.fill('input[type="password"]', '123456')
await page.click('button[type="submit"]')
await page.waitForTimeout(3500)

await page.goto(B + '/admin/danh-muc', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)

const btns = await page.locator('button:has-text("Thêm danh mục")').count()
console.log('add buttons:', btns)
await page.locator('button:has-text("Thêm danh mục")').first().click()
await page.waitForTimeout(1200)

const info = await page.evaluate(() => {
  const out = {}
  const close = document.querySelector('.dialog-close')
  const content = document.querySelector('.dialog-content')
  const rect = (e) => e ? (({x,y,width,height}) => ({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(e.getBoundingClientRect()) : null
  out.close = rect(close)
  out.content = rect(content)
  out.closeComputed = close ? (({position,top,right,left,bottom,zIndex}) => ({position,top,right,left,bottom,zIndex}))(getComputedStyle(close)) : null
  out.contentPos = content ? getComputedStyle(content).position : null
  out.dismissables = [...document.querySelectorAll('[data-dismissable-layer]')].map(e => ({
    tag: e.tagName, cls: (e.className || '').toString().slice(0,60), ...rect(e)
  }))
  out.viewport = { w: innerWidth, h: innerHeight }
  return out
})
console.log(JSON.stringify(info, null, 2))

await page.screenshot({ path: 'screenshots/dialog-fixed.png' })

console.log('--- ESC test ---')
await page.keyboard.press('Escape')
await page.waitForTimeout(700)
console.log('after ESC, dialog present:', await page.locator('.dialog-content').count())

await page.locator('button:has-text("Thêm danh mục")').first().click()
await page.waitForTimeout(900)
await page.mouse.click(60, 60)
await page.waitForTimeout(700)
console.log('after overlay click, dialog present:', await page.locator('.dialog-content').count())

await page.locator('button:has-text("Thêm danh mục")').first().click()
await page.waitForTimeout(900)
await page.locator('.dialog-close').click()
await page.waitForTimeout(700)
console.log('after X click, dialog present:', await page.locator('.dialog-content').count())

await browser.close()
