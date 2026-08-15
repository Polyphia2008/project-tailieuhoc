import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  USERS, CATEGORIES, DOCUMENTS, ORDERS, REVIEWS, TRANSACTIONS,
  BLOGS, NOTIFICATIONS, REPORTS, FAVORITES, DOWNLOADS, SETTINGS
} from './seed'

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
  readonly kind: 'supabase' | 'mock'
  find<T = any>(table: TableName, opts?: FindOpts): Promise<{ rows: T[]; total: number }>
  findOne<T = any>(table: TableName, where: Record<string, any>): Promise<T | null>
  insert<T = any>(table: TableName, row: any): Promise<T>
  update<T = any>(table: TableName, id: string, patch: any): Promise<T>
  remove(table: TableName, id: string): Promise<void>
  increment(table: TableName, id: string, field: string, by?: number): Promise<void>
  getSettings(): Promise<Record<string, any>>
  setSettings(patch: Record<string, any>): Promise<Record<string, any>>
}

export function cryptoId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

function norm(s: any): string {
  return String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase()
}

interface Store {
  users: any[]; documents: any[]; categories: any[]; orders: any[]; reviews: any[]
  transactions: any[]; blogs: any[]; notifications: any[]; reports: any[]
  favorites: any[]; downloads: any[]; settings: Record<string, any>
}

const G = globalThis as any

function store(): Store {
  if (!G.__mapdocs_store) {
    const clone = (x: any) => JSON.parse(JSON.stringify(x))
    G.__mapdocs_store = {
      users: clone(USERS), documents: clone(DOCUMENTS), categories: clone(CATEGORIES),
      orders: clone(ORDERS), reviews: clone(REVIEWS), transactions: clone(TRANSACTIONS),
      blogs: clone(BLOGS), notifications: clone(NOTIFICATIONS), reports: clone(REPORTS),
      favorites: clone(FAVORITES), downloads: clone(DOWNLOADS), settings: clone(SETTINGS)
    } as Store
  }
  return G.__mapdocs_store as Store
}

class MockDriver implements Driver {
  readonly kind = 'mock' as const

  private table(t: TableName): any[] {
    return (store() as any)[t] as any[]
  }

  async find<T = any>(t: TableName, opts: FindOpts = {}): Promise<{ rows: T[]; total: number }> {
    let rows = [...this.table(t)]

    if (opts.where) for (const [k, v] of Object.entries(opts.where)) {
      if (v === undefined) continue
      rows = rows.filter((r) => r[k] === v)
    }
    if (opts.whereNot) for (const [k, v] of Object.entries(opts.whereNot)) rows = rows.filter((r) => r[k] !== v)
    if (opts.whereIn) for (const [k, arr] of Object.entries(opts.whereIn)) rows = rows.filter((r) => arr.includes(r[k]))
    if (opts.gte) for (const [k, v] of Object.entries(opts.gte)) rows = rows.filter((r) => Number(r[k]) >= Number(v))
    if (opts.lte) for (const [k, v] of Object.entries(opts.lte)) rows = rows.filter((r) => Number(r[k]) <= Number(v))

    if (opts.search?.term) {
      const term = norm(opts.search.term)
      rows = rows.filter((r) =>
        opts.search!.fields.some((f) => {
          const val = r[f]
          if (Array.isArray(val)) return val.some((x) => norm(x).includes(term))
          return norm(val).includes(term)
        })
      )
    }

    const total = rows.length

    if (opts.order) {
      const { field, asc } = opts.order
      rows.sort((a, b) => {
        const av = a[field], bv = b[field]
        if (typeof av === 'number' && typeof bv === 'number') return asc ? av - bv : bv - av
        return asc ? String(av ?? '').localeCompare(String(bv ?? '')) : String(bv ?? '').localeCompare(String(av ?? ''))
      })
    }

    const off = opts.offset || 0
    if (opts.limit !== undefined) rows = rows.slice(off, off + opts.limit)
    else if (off) rows = rows.slice(off)

    return { rows: JSON.parse(JSON.stringify(rows)) as T[], total }
  }

  async findOne<T = any>(t: TableName, where: Record<string, any>): Promise<T | null> {
    const row = this.table(t).find((r) => Object.entries(where).every(([k, v]) => r[k] === v))
    return row ? (JSON.parse(JSON.stringify(row)) as T) : null
  }

  async insert<T = any>(t: TableName, row: any): Promise<T> {
    const rec = { id: row.id || cryptoId(), ...row }
    this.table(t).unshift(rec)
    return JSON.parse(JSON.stringify(rec)) as T
  }

  async update<T = any>(t: TableName, id: string, patch: any): Promise<T> {
    const arr = this.table(t)
    const i = arr.findIndex((r) => r.id === id)
    if (i === -1) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy bản ghi' })
    arr[i] = { ...arr[i], ...patch }
    return JSON.parse(JSON.stringify(arr[i])) as T
  }

  async remove(t: TableName, id: string): Promise<void> {
    const arr = this.table(t)
    const i = arr.findIndex((r) => r.id === id)
    if (i >= 0) arr.splice(i, 1)
  }

  async increment(t: TableName, id: string, field: string, by = 1): Promise<void> {
    const row = this.table(t).find((r) => r.id === id)
    if (row) row[field] = (Number(row[field]) || 0) + by
  }

  async getSettings(): Promise<Record<string, any>> {
    return JSON.parse(JSON.stringify(store().settings))
  }

  async setSettings(patch: Record<string, any>): Promise<Record<string, any>> {
    store().settings = { ...store().settings, ...patch }
    return JSON.parse(JSON.stringify(store().settings))
  }
}

class SupabaseDriver implements Driver {
  readonly kind = 'supabase' as const
  private c: SupabaseClient

  constructor(url: string, key: string) {
    this.c = createClient(url, key, { auth: { persistSession: false } })
  }

  private build(t: TableName, opts: FindOpts = {}, count = false) {
    let q: any = this.c.from(t).select('*', count ? { count: 'exact' } : undefined)
    if (opts.where) for (const [k, v] of Object.entries(opts.where)) if (v !== undefined) q = q.eq(k, v)
    if (opts.whereNot) for (const [k, v] of Object.entries(opts.whereNot)) q = q.neq(k, v)
    if (opts.whereIn) for (const [k, arr] of Object.entries(opts.whereIn)) q = q.in(k, arr)
    if (opts.gte) for (const [k, v] of Object.entries(opts.gte)) q = q.gte(k, v)
    if (opts.lte) for (const [k, v] of Object.entries(opts.lte)) q = q.lte(k, v)
    if (opts.search?.term) {
      const term = opts.search.term.replace(/[%,()]/g, ' ')
      q = q.or(opts.search.fields.map((f) => `${f}.ilike.%${term}%`).join(','))
    }
    if (opts.order) q = q.order(opts.order.field, { ascending: !!opts.order.asc })
    if (opts.limit !== undefined) {
      const off = opts.offset || 0
      q = q.range(off, off + opts.limit - 1)
    }
    return q
  }

  async find<T = any>(t: TableName, opts: FindOpts = {}): Promise<{ rows: T[]; total: number }> {
    const { data, error, count } = await this.build(t, opts, true)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { rows: (data || []) as T[], total: count ?? (data?.length || 0) }
  }

  async findOne<T = any>(t: TableName, where: Record<string, any>): Promise<T | null> {
    let q: any = this.c.from(t).select('*')
    for (const [k, v] of Object.entries(where)) q = q.eq(k, v)
    const { data, error } = await q.limit(1).maybeSingle()
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return (data as T) || null
  }

  async insert<T = any>(t: TableName, row: any): Promise<T> {
    const { data, error } = await this.c.from(t).insert(row).select().single()
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data as T
  }

  async update<T = any>(t: TableName, id: string, patch: any): Promise<T> {
    const { data, error } = await this.c.from(t).update(patch).eq('id', id).select().single()
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data as T
  }

  async remove(t: TableName, id: string): Promise<void> {
    const { error } = await this.c.from(t).delete().eq('id', id)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  async increment(t: TableName, id: string, field: string, by = 1): Promise<void> {
    const cur = await this.findOne<any>(t, { id })
    if (!cur) return
    await this.update(t, id, { [field]: (Number(cur[field]) || 0) + by })
  }

  async getSettings(): Promise<Record<string, any>> {
    const { data } = await this.c.from('settings').select('*').limit(1).maybeSingle()
    return (data?.value as any) || SETTINGS
  }

  async setSettings(patch: Record<string, any>): Promise<Record<string, any>> {
    const merged = { ...(await this.getSettings()), ...patch }
    await this.c.from('settings').upsert({ id: 1, value: merged })
    return merged
  }
}

let _driver: Driver | null = null

export function db(): Driver {
  if (_driver) return _driver
  const cfg = useRuntimeConfig()
  const url = cfg.public.supabaseUrl
  const key = cfg.supabaseServiceKey
  if (url && key) {
    _driver = new SupabaseDriver(url, key)
    console.log('[MapDocs] Data driver: SUPABASE')
  } else {
    _driver = new MockDriver()
    console.log('[MapDocs] Data driver: MOCK (in-memory seed data)')
  }
  return _driver
}

export const isMock = () => db().kind === 'mock'
