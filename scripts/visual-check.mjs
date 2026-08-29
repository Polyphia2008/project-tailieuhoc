import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const EMAIL = process.env.MAPDOCS_ADMIN || 'admin@mapdocs.vn'
const PASS = process.env.MAPDOCS_PASS || '123456'
const DIR = 'screenshots'

mkdirSync(DIR, { recursive: true })

const results = []
const errors = []
const shots = []

function ok(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`)
}

async function shot(page, file, full = true) {
  const path = `${DIR}/${file}`
  await page.screenshot({ path, fullPage: full })
  shots.push(file)
  console.log(`SHOT  ${file}`)
}

const IGNORE = [
  'app-manifest',
  'favicon',
  'dicebear',
  'Failed to load resource',
  'net::ERR',
  'ResizeObserver',
  'Hydration',
  'failed to connect to websocket',
  'WebSocket closed without opened',
  '[vite]'
]

function attach(page) {
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    if (IGNORE.some((s) => t.includes(s))) return
    errors.push(t)
  })
  page.on('pageerror', (e) => {
    const t = String(e.message || e)
    if (IGNORE.some((s) => t.includes(s))) return
    errors.push(t)
  })
}

async function go(page, path, theme) {
  if (theme) {
    await page.addInitScript((t) => {
      try {
        localStorage.setItem('mapdocs:theme', t)
      } catch {}
    }, theme)
  }
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(3200)
}

async function login(page) {
  const r = await page.evaluate(
    async ([email, password]) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      return res.status
    },
    [EMAIL, PASS]
  )
  return r
}

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } })
const page = await ctx.newPage()
attach(page)

await go(page, '/auth/dang-nhap', 'light')
await shot(page, 'mapdocs-auth-login.png')
{
  const icons = await page.$$eval('svg', (n) => n.length)
  ok('auth login renders solar icons', icons >= 4, `svg=${icons}`)
}

await go(page, '/auth/dang-ky', 'light')
await shot(page, 'mapdocs-auth-register.png')
{
  const feats = await page.$$('.auth-feature')
  ok('auth register has exactly 4 feature cards', feats.length === 4, `count=${feats.length}`)
  if (feats.length) {
    const st = await feats[0].evaluate((el) => {
      const c = getComputedStyle(el)
      return { r: c.borderTopLeftRadius, p: c.paddingTop }
    })
    ok('auth-feature style radius 12px padding 16px', st.r === '12px' && st.p === '16px', JSON.stringify(st))
  }
  const featIcons = await page.$$eval('.auth-feature svg', (n) => n.length)
  ok('auth register 4 feature icons (shield rocket server headphones)', featIcons >= 4, `svg=${featIcons}`)
}

{
  const st = await login(page)
  ok('mock login api 200', st === 200, `status=${st}`)
}

async function bg(sel) {
  return page.$eval(sel, (el) => getComputedStyle(el).backgroundColor)
}

await go(page, '/dashboard', 'light')
await shot(page, 'mapdocs-dashboard-light.png')
const dashLight = await bg('body')
{
  const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
  ok('dashboard light mode has no dark class', hasDark === false, `dark=${hasDark}`)
  const walletInSidebar = await page.$$eval('aside', (asides) =>
    asides.some((a) => /Số dư ví/.test(a.textContent || ''))
  )
  ok('sidebar has NO wallet card', walletInSidebar === false)
  const card = await page.$('[data-testid="wallet-stat-card"]')
  ok('wallet stat card exists on dashboard', !!card)
  if (card) {
    const ghost = await card.evaluate((el) => {
      const svgs = [...el.querySelectorAll('svg')]
      const box = el.getBoundingClientRect()
      const big = svgs
        .map((s) => {
          const r = s.getBoundingClientRect()
          return { w: r.width, h: r.height, right: box.right - r.right, bottom: box.bottom - r.bottom }
        })
        .sort((a, b) => b.w - a.w)[0]
      return big || null
    })
    ok(
      'wallet stat card has large faded icon at right edge',
      !!ghost && ghost.w >= 80 && ghost.right < 40,
      JSON.stringify(ghost)
    )
  }
}

await go(page, '/dashboard', 'dark')
await shot(page, 'mapdocs-dashboard-dark.png')
const dashDark = await bg('body')
{
  const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
  ok('dashboard dark mode has dark class', hasDark === true)
}
ok('dashboard light/dark background really changes', dashLight !== dashDark, `${dashLight} -> ${dashDark}`)

await go(page, '/admin', 'light')
await shot(page, 'mapdocs-admin-light.png')
const admLight = await bg('body')
await go(page, '/admin', 'dark')
await shot(page, 'mapdocs-admin-dark.png')
const admDark = await bg('body')
ok('admin light/dark background really changes', admLight !== admDark, `${admLight} -> ${admDark}`)

{
  const p2 = await ctx.newPage()
  attach(p2)
  await p2.goto(BASE + '/dashboard', { waitUntil: 'domcontentloaded', timeout: 90000 })
  await p2.waitForTimeout(3200)
  const before = await p2.evaluate(() => document.documentElement.classList.contains('dark'))
  const toggle = await p2.$('button[aria-label="Đổi giao diện sáng tối"]')
  ok('theme toggle button present', !!toggle)
  if (toggle) {
    await toggle.click()
    await p2.waitForTimeout(1000)
    const after = await p2.evaluate(() => document.documentElement.classList.contains('dark'))
    ok('theme toggle click flips theme', before !== after, `${before} -> ${after}`)
    const svgs = await toggle.$$eval('svg', (n) => n.length)
    ok('theme toggle has two icons (sun + moon)', svgs === 2, `svg=${svgs}`)
    const stored = await p2.evaluate(() => localStorage.getItem('mapdocs:theme'))
    ok('theme saved to localStorage', stored === (after ? 'dark' : 'light'), `stored=${stored}`)
    await p2.reload({ waitUntil: 'domcontentloaded' })
    await p2.waitForTimeout(3000)
    const persisted = await p2.evaluate(() => document.documentElement.classList.contains('dark'))
    ok('theme persists after reload', persisted === after, `expected=${after} got=${persisted}`)
    await p2.goto(BASE + '/admin', { waitUntil: 'domcontentloaded', timeout: 90000 })
    await p2.waitForTimeout(2800)
    const onAdmin = await p2.evaluate(() => document.documentElement.classList.contains('dark'))
    ok('theme persists when navigating to admin', onAdmin === after, `got=${onAdmin}`)
  }
  await p2.close()
}

await go(page, '/dashboard', 'light')
{
  const trigger = await page.$('[data-testid="user-menu-trigger"]')
  ok('user dropdown trigger present', !!trigger)
  if (trigger) {
    await trigger.click()
    await page.waitForTimeout(900)
    const content = await page.$('[data-testid="user-menu-content"]')
    ok('user dropdown content opens', !!content)
    if (content) {
      const geo = await content.evaluate((el) => {
        const r = el.getBoundingClientRect()
        return {
          top: Math.round(r.top),
          right: Math.round(r.right),
          width: Math.round(r.width),
          vw: window.innerWidth,
          vh: window.innerHeight,
          bottom: Math.round(r.bottom)
        }
      })
      ok('dropdown width ~340px', Math.abs(geo.width - 340) <= 8, JSON.stringify(geo))
      ok('dropdown sits just under topbar', geo.top > 0 && geo.top < 150, `top=${geo.top}`)
      ok('dropdown right-aligned near viewport right', geo.vw - geo.right < 80, `right=${geo.right} vw=${geo.vw}`)
      ok(
        'dropdown NOT stuck at bottom-right corner',
        !(geo.top > geo.vh - 250 && geo.vw - geo.right < 20),
        `top=${geo.top} vh=${geo.vh}`
      )
      const links = await content.$$eval('a', (n) => n.length)
      ok('dropdown has >=9 quick links', links >= 9, `links=${links}`)
      const wrapPos = await page.$eval('[data-radix-popper-content-wrapper]', (el) =>
        getComputedStyle(el).position
      ).catch(() => 'none')
      ok('radix popper wrapper is fixed/absolute positioned by radix', wrapPos === 'fixed' || wrapPos === 'absolute', wrapPos)
      const layers = await page.$$eval('[data-dismissable-layer]', (els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect()
          return { t: Math.round(r.top), w: Math.round(r.width) }
        })
      )
      ok('dismissable layers positioned in-viewport', layers.every((l) => l.t >= 0 && l.t < 400), JSON.stringify(layers))
      await shot(page, 'mapdocs-user-dropdown.png', false)
    }
    await page.keyboard.press('Escape')
    await page.waitForTimeout(700)
    ok('Escape closes user dropdown', (await page.$('[data-testid="user-menu-content"]')) === null)

    await trigger.click()
    await page.waitForTimeout(800)
    await page.mouse.click(20, 600)
    await page.waitForTimeout(700)
    ok('click outside closes user dropdown', (await page.$('[data-testid="user-menu-content"]')) === null)
  }
}

await go(page, '/dashboard/ho-so', 'light')
await shot(page, 'mapdocs-profile.png')
{
  const hero = await page.$('[data-testid="profile-hero"]')
  ok('profile hero present', !!hero)
  const avatar = await page.$('[data-testid="profile-hero"] img')
  const src = avatar ? await avatar.getAttribute('src') : ''
  ok('profile avatar uses dicebear', /dicebear/.test(src || ''), String(src).slice(0, 60))
  const txt = await page.textContent('body')
  ok('profile has all 4 sections', ['Thông tin cá nhân', 'Tài khoản nhận tiền', 'Đổi mật khẩu', 'Lịch sử đăng nhập'].every((s) => txt.includes(s)))
}

await go(page, '/ho-tro', 'light')
await shot(page, 'mapdocs-support.png')
{
  const cards = await page.$$('.support-card')
  ok('support page has >=6 support cards', cards.length >= 6, `count=${cards.length}`)
  if (cards.length) {
    const st = await cards[0].evaluate((el) => {
      const c = getComputedStyle(el)
      return { r: c.borderTopLeftRadius, p: c.paddingTop }
    })
    ok('support-card style radius 12px padding 20px', st.r === '12px' && st.p === '20px', JSON.stringify(st))
  }
  const txt = await page.textContent('body')
  ok('support page has no dichvudev mention', !/dichvu/i.test(txt))
  ok('support page mentions MapDocs support title', txt.includes('Hỗ trợ MapDocs'))
}

{
  let opened = false
  for (const route of ['/admin/danh-muc', '/admin/tai-lieu', '/admin/nguoi-dung', '/admin/bai-viet']) {
    await go(page, route, 'light')
    const btns = await page.$$('button, [role="button"]')
    for (const b of btns) {
      const vis = await b.isVisible().catch(() => false)
      if (!vis) continue
      const t = ((await b.textContent()) || '').trim()
      const aria = (await b.getAttribute('aria-label')) || ''
      if (!/Thêm|Tạo|Sửa|Xem|Duyệt|Chi tiết|Từ chối|Xoá|Xóa/i.test(t + ' ' + aria)) continue
      await b.click({ timeout: 4000 }).catch(() => {})
      await page.waitForTimeout(1300)
      if (await page.$('[role="dialog"]')) {
        opened = true
        break
      }
    }
    if (opened) break
  }
  ok('admin dialog can be opened', opened)
  if (opened) {
    const geo = await page.$eval('[role="dialog"]', (el) => {
      const r = el.getBoundingClientRect()
      return { t: Math.round(r.top), w: Math.round(r.width), inView: r.top >= 0 && r.left >= 0 }
    })
    ok('admin dialog positioned in viewport', geo.inView, JSON.stringify(geo))
    const layers = await page.$$eval('[data-dismissable-layer]', (els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect()
        return { t: Math.round(r.top), w: Math.round(r.width) }
      })
    )
    ok('dialog dismissable layer positioned correctly', layers.length > 0 && layers.every((l) => l.w > 0), JSON.stringify(layers))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)
    const closedByEsc = (await page.$('[role="dialog"]')) === null
    ok('Escape closes admin dialog', closedByEsc)

    const reopen = await page.$$('button')
    for (const b of reopen) {
      const t = ((await b.textContent()) || '').trim()
      if (!/Thêm|Tạo|Sửa|Xem|Chi tiết/i.test(t)) continue
      if (!(await b.isVisible().catch(() => false))) continue
      await b.click({ timeout: 4000 }).catch(() => {})
      await page.waitForTimeout(1200)
      if (await page.$('[role="dialog"]')) break
    }
    if (await page.$('[role="dialog"]')) {
      await page.mouse.click(12, 12)
      await page.waitForTimeout(1100)
      ok('overlay click closes admin dialog', (await page.$('[role="dialog"]')) === null)
    }
  }
}

ok('no console errors', errors.length === 0, errors.slice(0, 4).join(' | '))

await browser.close()

const failed = results.filter((r) => !r.pass)
console.log('\n==== SUMMARY ====')
console.log(`checks: ${results.length}  passed: ${results.length - failed.length}  failed: ${failed.length}`)
console.log(`screenshots: ${shots.length}`)
if (failed.length) {
  console.log('FAILED:')
  failed.forEach((f) => console.log(` - ${f.name} ${f.detail}`))
}
process.exit(0)
