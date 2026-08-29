import { chromium } from 'playwright'
import fs from 'node:fs'

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const OUT = { }

fs.mkdirSync('screenshots', { recursive: true })

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: UA, locale: 'vi-VN' })
const page = await ctx.newPage()

async function grab() {
  return await page.evaluate(() => {
    const cs = (el) => (el ? getComputedStyle(el) : null)
    const root = getComputedStyle(document.documentElement)
    const aside = document.querySelector('aside')
    const submit = document.querySelector('button[type=submit]')
    const accent = document.querySelector('aside h2 span') || document.querySelector('[class*="text-cmstdev"]')
    const input = document.querySelector('input')
    const rules = []
    for (const sheet of document.styleSheets) {
      try {
        for (const r of sheet.cssRules) {
          const t = r.cssText || ''
          if (/--cmstdev|--background:|--foreground:|--border:|--input:|--muted-foreground:|--ring:/.test(t)) rules.push(t.slice(0, 700))
        }
      } catch {}
    }
    const blobs = Array.from(document.querySelectorAll('aside [class*="cmstdev"], aside .rounded-full')).slice(0, 6).map((el) => ({
      bg: cs(el).backgroundColor,
      cls: String(el.className).slice(0, 120)
    }))
    return {
      url: location.href,
      title: document.title,
      vars: {
        cmstdev: root.getPropertyValue('--cmstdev').trim(),
        background: root.getPropertyValue('--background').trim(),
        foreground: root.getPropertyValue('--foreground').trim(),
        border: root.getPropertyValue('--border').trim(),
        input: root.getPropertyValue('--input').trim(),
        mutedForeground: root.getPropertyValue('--muted-foreground').trim(),
        ring: root.getPropertyValue('--ring').trim(),
        card: root.getPropertyValue('--card').trim(),
        primary: root.getPropertyValue('--primary').trim(),
        destructive: root.getPropertyValue('--destructive').trim()
      },
      htmlClass: document.documentElement.className,
      body_bg: cs(document.body).backgroundColor,
      body_color: cs(document.body).color,
      body_font: cs(document.body).fontFamily,
      aside_bg: aside ? cs(aside).backgroundColor : null,
      accent_text: accent ? cs(accent).color : null,
      accent_cls: accent ? String(accent.className).slice(0, 160) : null,
      submit_bg: submit ? cs(submit).backgroundColor : null,
      submit_border: submit ? cs(submit).borderColor : null,
      submit_color: submit ? cs(submit).color : null,
      submit_cls: submit ? String(submit.className).slice(0, 300) : null,
      input_border: input ? cs(input).borderColor : null,
      input_h: input ? cs(input).height : null,
      input_radius: input ? cs(input).borderRadius : null,
      input_cls: input ? String(input.className).slice(0, 300) : null,
      blobs,
      rules: rules.slice(0, 40)
    }
  })
}

async function visit(name, url) {
  console.log(`=== ${name.toUpperCase()} ===`)
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForSelector('input', { timeout: 20000 }).catch(() => {})
    await page.waitForTimeout(3500)
    await page.screenshot({ path: `screenshots/dichvudev-${name}.png` })
    const data = await grab()
    OUT[name] = data
    console.log(JSON.stringify({ vars: data.vars, accent: data.accent_text, submit: data.submit_bg, input: data.input_border }, null, 2))
  } catch (e) {
    OUT[name] = { error: String(e).slice(0, 300) }
    console.log(`${name} FAILED`, String(e).slice(0, 200))
  }
}

await visit('login', 'https://dichvudev.vn/authentication/login')
await visit('register', 'https://dichvudev.vn/authentication/register')

try {
  console.log('=== LOGIN ATTEMPT ===')
  await page.goto('https://dichvudev.vn/authentication/login', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForSelector('input', { timeout: 20000 })
  const inputs = await page.$$('input')
  if (inputs[0]) await inputs[0].fill(process.env.DV_USER || '')
  const pw = await page.$('input[type=password]')
  if (pw) await pw.fill(process.env.DV_PASS || '')
  await page.screenshot({ path: 'screenshots/dichvudev-filled.png' })
  await page.click('button[type=submit]')
  await page.waitForTimeout(8000)
  await page.screenshot({ path: 'screenshots/dichvudev-after-login.png' })
  OUT.afterLogin = await grab()
  console.log(JSON.stringify(OUT.afterLogin.vars, null, 2))
} catch (e) {
  OUT.afterLogin = { error: String(e).slice(0, 300) }
  console.log('login flow failed:', String(e).slice(0, 200))
}

await browser.close()
fs.writeFileSync('scripts/dichvudev-colors.json', JSON.stringify(OUT, null, 2))
console.log('Done')
