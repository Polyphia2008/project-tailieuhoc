import { useDriver } from '~/server/utils/driver'
import { requireAdmin, publicUser } from '~/server/utils/auth'
import { paginate, paged, str, bool } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const { page, limit, offset } = paginate(q, 15)
  const db = useDriver()

  const where: Record<string, any> = {}
  if (str(q.role)) where.role = str(q.role)
  const blocked = bool(q.blocked)
  if (blocked !== undefined) where.blocked = blocked

  const { rows, total } = await db.find<any>('users', {
    where,
    search: str(q.q) ? { fields: ['name', 'email'], term: str(q.q)! } : undefined,
    order: { field: String(q.sort || 'created_at') },
    limit,
    offset
  })

  const enriched = await Promise.all(
    rows.map(async (u) => ({
      ...publicUser(u),
      documents: await db.count('documents', { where: { seller_id: u.id } }),
      purchases: await db.count('orders', { where: { buyer_id: u.id, status: 'paid' } }),
      sales: await db.count('orders', { where: { seller_id: u.id, status: 'paid' } })
    }))
  )

  const { rows: all } = await db.find<any>('users')
  const counts = {
    all: all.length,
    admin: all.filter((u) => u.role === 'admin').length,
    seller: all.filter((u) => u.role === 'seller').length,
    user: all.filter((u) => u.role === 'user').length,
    blocked: all.filter((u) => u.blocked).length
  }

  return { ...paged(enriched, total, page, limit), counts }
})
