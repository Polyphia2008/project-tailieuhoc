import { useDriver } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { paginate, paged, str } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const q = getQuery(event)
  const { page, limit, offset } = paginate(q, 12)
  const db = useDriver()

  const where: Record<string, any> = { seller_id: user.id }
  if (str(q.status)) where.status = str(q.status)

  const { rows, total } = await db.find<any>('documents', {
    where,
    search: str(q.q) ? { fields: ['title', 'tags'], term: str(q.q)! } : undefined,
    order: { field: 'created_at' },
    limit,
    offset
  })

  const { rows: all } = await db.find<any>('documents', { where: { seller_id: user.id } })
  const counts = {
    all: all.length,
    approved: all.filter((d) => d.status === 'approved').length,
    pending: all.filter((d) => d.status === 'pending').length,
    rejected: all.filter((d) => d.status === 'rejected').length
  }

  return { ...paged(rows, total, page, limit), counts }
})
