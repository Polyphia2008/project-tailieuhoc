#!/usr/bin/env node
/**
 * MapDocs — Seed du lieu mau len Supabase
 *
 * Cach dung:
 *   node scripts/seed-supabase.mjs --dry        # chi in ra so luong, khong ghi DB
 *   node scripts/seed-supabase.mjs              # upsert du lieu
 *   node scripts/seed-supabase.mjs --truncate   # xoa sach roi seed lai
 *
 * Yeu cau .env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const DRY = process.argv.includes('--dry')
const TRUNCATE = process.argv.includes('--truncate')

const c = {
  g: (s) => `\x1b[32m${s}\x1b[0m`,
  y: (s) => `\x1b[33m${s}\x1b[0m`,
  r: (s) => `\x1b[31m${s}\x1b[0m`,
  b: (s) => `\x1b[36m${s}\x1b[0m`,
  d: (s) => `\x1b[90m${s}\x1b[0m`
}

console.log(c.b('\n╔══════════════════════════════════════════╗'))
console.log(c.b('║   MapDocs — Seed du lieu len Supabase    ║'))
console.log(c.b('╚══════════════════════════════════════════╝\n'))

// ---------- 1. Load du lieu mau tu server/utils/seed.ts ----------
const jiti = createJiti(import.meta.url, { interopDefault: true })
let seed
try {
  seed = await jiti.import(resolve(ROOT, 'server/utils/seed.ts'))
} catch (e) {
  console.error(c.r('✖ Khong doc duoc server/utils/seed.ts:'), e.message)
  process.exit(1)
}

const {
  USERS = [], CATEGORIES = [], DOCUMENTS = [], ORDERS = [], REVIEWS = [],
  TRANSACTIONS = [], BLOGS = [], NOTIFICATIONS = [], REPORTS = [],
  FAVORITES = [], DOWNLOADS = [], SETTINGS = {}
} = seed

// ---------- 2. Chuan hoa: bo cac field quan he chi dung runtime ----------
const RUNTIME_FIELDS = ['seller', 'author', 'document', 'user', 'revenue', 'category']
const strip = (row) => {
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    if (RUNTIME_FIELDS.includes(k)) continue
    if (v === undefined) continue
    out[k] = v
  }
  return out
}

const userName = (id) => USERS.find((u) => u.id === id)?.name || null
const docOf = (id) => DOCUMENTS.find((d) => d.id === id) || null

const rows = {
  users:      USERS.map(strip),
  categories: CATEGORIES.map(strip),
  documents:  DOCUMENTS.map((d) => ({
    ...strip(d),
    seller_name: d.seller_name || userName(d.seller_id),
    category_name: d.category_name || CATEGORIES.find((x) => x.id === d.category_id)?.name || null
  })),
  orders: ORDERS.map((o) => ({
    ...strip(o),
    buyer_name: o.buyer_name || userName(o.buyer_id),
    document_title: o.document_title || docOf(o.document_id)?.title || null,
    document_slug: o.document_slug || docOf(o.document_id)?.slug || null
  })),
  reviews:      REVIEWS.map((r) => ({ ...strip(r), user_name: r.user_name || userName(r.user_id) })),
  transactions: TRANSACTIONS.map(strip),
  // QUAN TRONG: blog phai co published = true moi hien tren /blog
  blogs: BLOGS.map((b) => ({
    ...strip(b),
    published: b.published !== false,
    author_name: b.author_name || userName(b.author_id)
  })),
  notifications: NOTIFICATIONS.map(strip),
  reports: REPORTS.map((r) => ({
    ...strip(r),
    user_name: r.user_name || userName(r.user_id),
    document_title: r.document_title || docOf(r.document_id)?.title || null
  })),
  favorites: FAVORITES.map(strip),
  downloads: DOWNLOADS.map(strip)
}

// Thu tu insert ton trong khoa ngoai
const ORDER = [
  'users', 'categories', 'documents', 'orders', 'reviews',
  'transactions', 'blogs', 'notifications', 'reports', 'favorites', 'downloads'
]

console.log(c.y('Du lieu tim thay:'))
for (const t of ORDER) console.log(`  ${t.padEnd(16)} ${String(rows[t].length).padStart(4)} dong`)
console.log(`  ${'settings'.padEnd(16)}    1 dong (jsonb)\n`)

if (DRY) {
  console.log(c.g('✔ Che do --dry: khong ghi gi vao database.\n'))
  process.exit(0)
}

// ---------- 3. Ket noi Supabase ----------
const URL = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error(c.r('✖ Thieu SUPABASE_URL hoac SUPABASE_SERVICE_ROLE_KEY trong .env'))
  console.error(c.d('  Xem file .env.example de biet cach cau hinh.\n'))
  process.exit(1)
}

const db = createClient(URL, KEY, { auth: { persistSession: false } })
console.log(c.d(`Ket noi: ${URL}\n`))

// ---------- 4. Truncate (tuy chon) ----------
if (TRUNCATE) {
  console.log(c.y('Dang xoa du lieu cu...'))
  for (const t of [...ORDER].reverse()) {
    const { error } = await db.from(t).delete().neq('id', '__none__')
    console.log(error ? c.r(`  ✖ ${t}: ${error.message}`) : c.d(`  • da xoa ${t}`))
  }
  console.log()
}

// ---------- 5. Upsert theo chunk 200 dong ----------
const CHUNK = 200
let failed = 0

for (const table of ORDER) {
  const data = rows[table]
  if (!data.length) { console.log(c.d(`- ${table}: bo qua (rong)`)); continue }

  let done = 0
  for (let i = 0; i < data.length; i += CHUNK) {
    const slice = data.slice(i, i + CHUNK)
    const { error } = await db.from(table).upsert(slice, { onConflict: 'id' })
    if (error) {
      console.log(c.r(`✖ ${table} [${i}-${i + slice.length}]: ${error.message}`))
      failed++
      break
    }
    done += slice.length
  }
  if (done) console.log(c.g(`✔ ${table.padEnd(16)} ${done} dong`))
}

// ---------- 6. Settings ----------
const { error: sErr } = await db.from('settings').upsert({ id: 1, value: SETTINGS }, { onConflict: 'id' })
console.log(sErr ? c.r(`✖ settings: ${sErr.message}`) : c.g('✔ settings         1 dong'))
if (sErr) failed++

// ---------- 7. Ket qua ----------
console.log()
if (failed) {
  console.log(c.r(`✖ Hoan tat voi ${failed} loi. Kiem tra da chay supabase/schema.sql chua.\n`))
  process.exit(1)
}

console.log(c.g('✔ Seed thanh cong!\n'))
console.log(c.y('Tai khoan demo:'))
console.log('  Admin   admin@mapdocs.vn  / 123456')
console.log('  Seller  seller@mapdocs.vn / 123456')
console.log('  User    user@mapdocs.vn   / 123456\n')
