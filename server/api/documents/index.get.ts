import type { DocumentItem } from '~/types'
import { db } from '~/server/utils/driver'
import { attachSellers, paginate } from '~/server/utils/helpers'

const SORTS: Record<string, { field: string; asc?: boolean }> = {
  newest: { field: 'created_at' },
  popular: { field: 'view_count' },
  bestseller: { field: 'sold_count' },
  rating: { field: 'rating_avg' },
  downloads: { field: 'download_count' },
  price_asc: { field: 'price', asc: true },
  price_desc: { field: 'price' }
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(48, Math.max(1, Number(q.limit) || 12))
  const order = SORTS[String(q.sort || 'newest')] || SORTS.newest

  const where: Record<string, any> = { status: 'approved' }
  if (q.subject) where.subject = String(q.subject)
  if (q.grade) where.grade = Number(q.grade)
  if (q.seller) where.seller_id = String(q.seller)
  if (q.featured === 'true' || q.featured === '1') where.featured = true
  if (q.type === 'free') where.is_free = true
  if (q.type === 'paid') where.is_free = false

  const opts: any = { where, order }
  if (q.q) opts.search = { fields: ['title', 'description', 'tags'], term: String(q.q) }
  if (q.minPrice) opts.gte = { price: Number(q.minPrice) }
  if (q.maxPrice) opts.lte = { price: Number(q.maxPrice) }

  const all = await db().find<DocumentItem>('documents', opts)
  const start = (page - 1) * limit
  const items = await attachSellers(all.rows.slice(start, start + limit))

  return { success: true, data: { items, ...paginate(all.total, page, limit) } }
})
