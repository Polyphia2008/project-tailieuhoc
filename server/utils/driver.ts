import {
  USERS, CATEGORIES, DOCUMENTS, ORDERS, REVIEWS, TRANSACTIONS,
  BLOGS, NOTIFICATIONS, REPORTS, FAVORITES, DOWNLOADS, SETTINGS
} from './seed'
import { useR2, r2Configured } from './r2'

export type TableName =
  | 'users' | 'documents' | 'categories' | 'orders' | 'reviews'
  | 'transactions' | 'blogs' | 'notifications' | 'reports' | 'favorites' | 'downloads'

export interface FindOpts {
  where?: Record<string, any>
  whereIn?: Record<string, any[]>
  whereNot?: Record<string, any>
  gte?: Record<string, any>
  lte?: Record<string, any>
  search?: { fields: string[]; term: string }
  order?: { field: string; asc?: boolean }
  limit?: number
  offset?: number
}

export interface Driver {
  readonly kind: 'r2' | 'memory'
  find<T = any>(table: TableName, opts?: FindOpts): Promise<{ rows: T[]; total: number }>
  findOne<T = any>(table: TableName, where: Record<string, any>): Promise<T | null>
  insert<T = any>(table: TableName, row: any): Promise<T>
  update<T = any>(table: TableName, id: string, patch: any): Promise<T>
  remove(table: TableName, id: string): Promise<void>
  increment(table: TableName, id: string, field: string, by?: number): Promise<void>
  count(table: TableName, opts?: FindOpts): Promise<number>
  getSettings(): Promise<Record<string, any>>
  setSettings(patch: Record<string, any>): Promise<Record<string, any>>
}

export function cryptoId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

export function orderCode(): string {
  return 'MD' + (Date.now().toString(36) + Math.random().toString(36).slice(2, 5)).toUpperCase()
}

function unaccent(s: any): string {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

interface Store {
  users: any[]
  documents: any[]
  categories: any[]
  orders: any[]
  reviews: any[]
  transactions: any[]
  blogs: any[]
  notifications: any[]
  reports: any[]
  favorites: any[]
  downloads: any[]
  settings: Record<string, any>
}

const G = globalThis as any

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x))
}

function store(): Store {
  if (!G.__mapdocs_store) {
    G.__mapdocs_store = {
      users: clone(USERS),
      documents: clone(DOCUMENTS),
      categories: clone(CATEGORIES),
      orders: clone(ORDERS),
      reviews: clone(REVIEWS),
      transactions: clone(TRANSACTIONS),
      blogs: clone(BLOGS),
      notifications: clone(NOTIFICATIONS),
      reports: clone(REPORTS),
      favorites: clone(FAVORITES),
      downloads: clone(DOWNLOADS),
      settings: clone(SETTINGS)
    } as Store
  }
  return G.__mapdocs_store as Store
}

class MemoryDriver implements Driver {
  readonly kind = 'memory' as const

  protected table(t: TableName): any[] {
    return (store() as any)[t] as any[]
  }

  protected filter(t: TableName, opts: FindOpts): any[] {
    let rows = [...this.table(t)]

    if (opts.where) {
      for (const [k, v] of Object.entries(opts.where)) {
        if (v === undefined) continue
        rows = rows.filter((r) => r[k] === v)
      }
    }
    if (opts.whereNot) {
      for (const [k, v] of Object.entries(opts.whereNot)) rows = rows.filter((r) => r[k] !== v)
    }
    if (opts.whereIn) {
      for (const [k, arr] of Object.entries(opts.whereIn)) rows = rows.filter((r) => arr.includes(r[k]))
    }
    if (opts.gte) {
      for (const [k, v] of Object.entries(opts.gte)) {
        if (v === undefined || v === null) continue
        rows = rows.filter((r) => Number(r[k]) >= Number(v))
      }
    }
    if (opts.lte) {
      for (const [k, v] of Object.entries(opts.lte)) {
        if (v === undefined || v === null) continue
        rows = rows.filter((r) => Number(r[k]) <= Number(v))
      }
    }
    if (opts.search?.term) {
      const term = unaccent(opts.search.term)
      const fields = opts.search.fields
      rows = rows.filter((r) =>
        fields.some((f) => {
          const val = r[f]
          if (Array.isArray(val)) return val.some((x: any) => unaccent(x).includes(term))
          return unaccent(val).includes(term)
        })
      )
    }
    if (opts.order) {
      const { field, asc } = opts.order
      rows.sort((a, b) => {
        const x = a[field]
        const y = b[field]
        if (typeof x === 'number' && typeof y === 'number') return asc ? x - y : y - x
        return asc ? String(x ?? '').localeCompare(String(y ?? '')) : String(y ?? '').localeCompare(String(x ?? ''))
      })
    }
    return rows
  }

  async find<T = any>(t: TableName, opts: FindOpts = {}): Promise<{ rows: T[]; total: number }> {
    const rows = this.filter(t, opts)
    const total = rows.length
    const offset = opts.offset ?? 0
    const limit = opts.limit ?? total
    return { rows: clone(rows.slice(offset, offset + limit)) as T[], total }
  }

  async findOne<T = any>(t: TableName, where: Record<string, any>): Promise<T | null> {
    const row = this.table(t).find((r) => Object.entries(where).every(([k, v]) => r[k] === v))
    return row ? (clone(row) as T) : null
  }

  async insert<T = any>(t: TableName, row: any): Promise<T> {
    const rec = { id: row.id || cryptoId(), created_at: row.created_at || new Date().toISOString(), ...row }
    if (!rec.id) rec.id = cryptoId()
    this.table(t).push(rec)
    await this.persist(t)
    return clone(rec) as T
  }

  async update<T = any>(t: TableName, id: string, patch: any): Promise<T> {
    const arr = this.table(t)
    const i = arr.findIndex((r) => r.id === id)
    if (i < 0) throw new Error(`${t}#${id} not found`)
    arr[i] = { ...arr[i], ...patch }
    await this.persist(t)
    return clone(arr[i]) as T
  }

  async remove(t: TableName, id: string): Promise<void> {
    const arr = this.table(t)
    const i = arr.findIndex((r) => r.id === id)
    if (i >= 0) arr.splice(i, 1)
    await this.persist(t)
  }

  async increment(t: TableName, id: string, field: string, by = 1): Promise<void> {
    const arr = this.table(t)
    const row = arr.find((r) => r.id === id)
    if (!row) return
    row[field] = Number(row[field] ?? 0) + by
    await this.persist(t)
  }

  async count(t: TableName, opts: FindOpts = {}): Promise<number> {
    return this.filter(t, opts).length
  }

  async getSettings(): Promise<Record<string, any>> {
    return clone(store().settings)
  }

  async setSettings(patch: Record<string, any>): Promise<Record<string, any>> {
    store().settings = { ...store().settings, ...patch }
    await this.persist('users')
    return clone(store().settings)
  }

  protected async persist(_t: TableName): Promise<void> {}
}

class R2Driver extends MemoryDriver {
  readonly kind = 'r2' as const
  private dirty = new Set<string>()
  private timer: any = null

  protected async persist(t: TableName): Promise<void> {
    this.dirty.add(t)
    if (this.timer) return
    this.timer = setTimeout(() => {
      this.timer = null
      const tables = [...this.dirty]
      this.dirty.clear()
      const r2 = useR2()
      Promise.all(tables.map((t) => r2.writeJson(`db/${t}.json`, (store() as any)[t]))).catch(() => {})
    }, 1200)
  }

  async hydrate(): Promise<void> {
    const r2 = useR2()
    const tables: TableName[] = [
      'users', 'documents', 'categories', 'orders', 'reviews',
      'transactions', 'blogs', 'notifications', 'reports', 'favorites', 'downloads'
    ]
    for (const t of tables) {
      const data = await r2.readJson<any[]>(`db/${t}.json`)
      if (Array.isArray(data) && data.length) (store() as any)[t] = data
      else await r2.writeJson(`db/${t}.json`, (store() as any)[t])
    }
    const s = await r2.readJson<Record<string, any>>('db/settings.json')
    if (s) store().settings = s
    else await r2.writeJson('db/settings.json', store().settings)
  }
}

export function useDriver(): Driver {
  if (!G.__mapdocs_driver) {
    if (r2Configured()) {
      const d = new R2Driver()
      G.__mapdocs_driver = d
      d.hydrate().catch(() => {})
    } else {
      G.__mapdocs_driver = new MemoryDriver()
    }
  }
  return G.__mapdocs_driver as Driver
}

export function driverStatus() {
  const d = useDriver()
  return { kind: d.kind, r2: r2Configured() }
}
