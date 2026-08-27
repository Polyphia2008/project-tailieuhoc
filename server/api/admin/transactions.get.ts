import { useDriver } from '~/server/utils/driver'
import { requireAdmin, slimUser } from '~/server/utils/auth'
import { paginate, paged, str } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const { page, limit, offset } = paginate(q, 15)
  const db = useDriver()

  const where: Record<string, any> = {}
  if (str(q.type)) where.type = str(q.type)
  if (str(q.status)) where.status = str(q.status)

  const { rows, total } = await db.find<any>('transactions', {
    where,
    search: str(q.q) ? { fields: ['ref', 'note'], term: str(q.q)! } : undefined,
    order: { field: 'created_at' },
    limit,
    offset
  })

  const userIds = [...new Set(rows.map((t) => t.user_id))]
  const { rows: users } = await db.find<any>('users', { whereIn: { id: userIds } })
  const umap = new Map(users.map((u) => [u.id, slimUser(u)]))

  return paged(rows.map((t) => ({ ...t, user: umap.get(t.user_id) || null })), total, page, limit)
})
