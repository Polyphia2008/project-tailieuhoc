export function slugify(input: string): string {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90)
}

export async function uniqueSlug(base: string, exists: (s: string) => Promise<boolean>): Promise<string> {
  let slug = slugify(base) || 'tai-lieu'
  let i = 2
  while (await exists(slug)) {
    slug = `${slugify(base)}-${i}`
    i++
    if (i > 200) break
  }
  return slug
}

export function paginate(query: Record<string, any>, defLimit = 12) {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || defLimit))
  return { page, limit, offset: (page - 1) * limit }
}

export function paged<T>(items: T[], total: number, page: number, limit: number) {
  return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) }
}

export function bool(v: any): boolean | undefined {
  if (v === undefined || v === null || v === '') return undefined
  if (v === 'true' || v === true || v === '1' || v === 1) return true
  if (v === 'false' || v === false || v === '0' || v === 0) return false
  return undefined
}

export function num(v: any): number | undefined {
  if (v === undefined || v === null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

export function str(v: any): string | undefined {
  const s = String(v ?? '').trim()
  return s || undefined
}

export function isEmail(v: any): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v ?? '').trim())
}

export function assertBody<T extends Record<string, any>>(body: any, fields: (keyof T)[]): void {
  const missing = fields.filter((f) => {
    const v = body?.[f]
    return v === undefined || v === null || v === ''
  })
  if (missing.length) {
    throw createError({ statusCode: 400, statusMessage: `Thiếu thông tin: ${missing.join(', ')}` })
  }
}

export function fail(code: number, msg: string): never {
  throw createError({ statusCode: code, statusMessage: msg })
}

export function daySeries(days: number): string[] {
  const out: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    out.push(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10))
  }
  return out
}

export function groupByDay(rows: any[], field = 'created_at', valueField?: string): Record<string, number> {
  const map: Record<string, number> = {}
  for (const r of rows) {
    const key = String(r[field] || '').slice(0, 10)
    if (!key) continue
    map[key] = (map[key] || 0) + (valueField ? Number(r[valueField] || 0) : 1)
  }
  return map
}

export function seriesFrom(rows: any[], days: number, field = 'created_at', valueField?: string) {
  const labels = daySeries(days)
  const map = groupByDay(rows, field, valueField)
  return { labels, data: labels.map((d) => map[d] || 0) }
}
