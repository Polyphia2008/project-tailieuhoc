import { useDriver } from '~/server/utils/driver'
import { slimUser } from '~/server/utils/auth'
import { paginate, paged, bool, num, str } from '~/server/utils/helpers'

const SORTS: Record<string, { field: string; asc?: boolean }> = {
  new: { field: 'created_at' },
  popular: { field: 'view_count' },
  sold: { field: 'sold_count' },
  rating: { field: 'rating_avg' },
  'price-asc': { field: 'price', asc: true },
  'price-desc': { field: 'price' }
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const { page, limit, offset } = paginate(q, 12)
  const db = useDriver()

  const where: Record<string, any> = { status: 'approved' }
  if (str(q.subject)) where.subject = str(q.subject)
  if (num(q.grade)) where.grade = num(q.grade)
  const free = bool(q.free)
  if (free !== undefined) where.is_free = free
  if (bool(q.featured)) where.featured = true
  if (str(q.seller)) where.seller_id = str(q.seller)

  const { rows, total } = await db.find<any>('documents', {
    where,
    gte: num(q.min_price) !== undefined ? { price: num(q.min_price) } : undefined,
    lte: num(q.max_price) !== undefined ? { price: num(q.max_price) } : undefined,
    search: str(q.q) ? { fields: ['title', 'description', 'tags'], term: str(q.q)! } : undefined,
    order: SORTS[String(q.sort || 'new')] || SORTS.new,
    limit,
    offset
  })

  const sellerIds = [...new Set(rows.map((r) => r.seller_id))]
  const { rows: sellers } = await db.find<any>('users', { whereIn: { id: sellerIds } })
  const map = new Map(sellers.map((s) => [s.id, slimUser(s)]))

  return paged(rows.map((d) => ({ ...d, seller: map.get(d.seller_id) || null })), total, page, limit)
})
