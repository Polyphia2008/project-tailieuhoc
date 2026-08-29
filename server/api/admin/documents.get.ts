import { useDriver } from '~/server/utils/driver'
import { requireAdmin, slimUser } from '~/server/utils/auth'
import { paginate, paged, str, num, bool } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const { page, limit, offset } = paginate(q, 15)
  const db = useDriver()

  const where: Record<string, any> = {}
  if (str(q.status)) where.status = str(q.status)
  if (str(q.subject)) where.subject = str(q.subject)
  if (num(q.grade)) where.grade = num(q.grade)
  const free = bool(q.free)
  if (free !== undefined) where.is_free = free
  const featured = bool(q.featured)
  if (featured !== undefined) where.featured = featured

  const { rows, total } = await db.find<any>('documents', {
    where,
    search: str(q.q) ? { fields: ['title', 'slug', 'tags'], term: str(q.q)! } : undefined,
    order: { field: String(q.sort || 'created_at') },
    limit,
    offset
  })

  const sellerIds = [...new Set(rows.map((r) => r.seller_id))]
  const { rows: sellers } = await db.find<any>('users', { whereIn: { id: sellerIds } })
  const smap = new Map(sellers.map((s) => [s.id, slimUser(s)]))

  const { rows: all } = await db.find<any>('documents')
  const counts = {
    all: all.length,
    approved: all.filter((d) => d.status === 'approved').length,
    pending: all.filter((d) => d.status === 'pending').length,
    rejected: all.filter((d) => d.status === 'rejected').length,
    featured: all.filter((d) => d.featured).length
  }

  return {
    ...paged(rows.map((d) => ({ ...d, seller: smap.get(d.seller_id) || null })), total, page, limit),
    counts
  }
})
