import type { DocumentItem, User, Notification } from '~/types'
import { db, cryptoId } from './driver'
import { publicUser } from './auth'

export function slugify(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90)
}

/** Basic XSS hardening for user-supplied text */
export function sanitize(input: any, maxLen = 5000): string {
  let s = String(input ?? '')
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '')
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '')
  s = s.replace(/<\/?[^>]+(>|$)/g, '')
  s = s.replace(/javascript:/gi, '')
  s = s.replace(/on\w+\s*=/gi, '')
  return s.trim().slice(0, maxLen)
}

export function orderCode(): string {
  return 'MD' + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).toUpperCase().slice(2, 6)
}

export async function attachSellers(docs: DocumentItem[]): Promise<DocumentItem[]> {
  if (!docs.length) return docs
  const ids = [...new Set(docs.map((d) => d.seller_id))]
  const { rows } = await db().find<User>('users', { whereIn: { id: ids } })
  const map = new Map(rows.map((u) => [u.id, publicUser(u)]))
  return docs.map((d) => ({ ...d, seller: map.get(d.seller_id) }))
}

export async function hasPurchased(userId: string, docId: string): Promise<boolean> {
  const o = await db().findOne('orders', { buyer_id: userId, document_id: docId, status: 'paid' })
  return !!o
}

export function paginate(total: number, page: number, limit: number) {
  return { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) }
}

export async function notify(userId: string, title: string, body: string, type = 'system', link?: string): Promise<Notification> {
  return await db().insert<Notification>('notifications', {
    id: cryptoId(), user_id: userId, title, body, type, link, read: false,
    created_at: new Date().toISOString()
  })
}

export const SUBJECT_META: Record<string, { name: string; color: string; icon: string }> = {
  toan: { name: 'Toán học', color: '#0b4a8f', icon: 'fa-square-root-variable' },
  ly: { name: 'Vật lý', color: '#ff8412', icon: 'fa-atom' },
  hoa: { name: 'Hoá học', color: '#16a34a', icon: 'fa-flask' },
  sinh: { name: 'Sinh học', color: '#0891b2', icon: 'fa-dna' },
  van: { name: 'Ngữ văn', color: '#dc2626', icon: 'fa-book-open' },
  anh: { name: 'Tiếng Anh', color: '#7c3aed', icon: 'fa-language' },
  su: { name: 'Lịch sử', color: '#b45309', icon: 'fa-landmark' },
  dia: { name: 'Địa lý', color: '#059669', icon: 'fa-earth-asia' },
  tin: { name: 'Tin học', color: '#4f46e5', icon: 'fa-laptop-code' },
  gdcd: { name: 'GDCD', color: '#db2777', icon: 'fa-scale-balanced' }
}

export async function getCommissionRate(): Promise<number> {
  const s = await db().getSettings()
  const r = Number(s.commission_rate)
  return isNaN(r) ? 0.15 : r
}
