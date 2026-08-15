import { db } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { paginate } from '~/server/utils/helpers'
import type { DocumentItem } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(50, Number(q.limit) || 12)
  const where: any = { seller_id: user.id }
  if (q.status && q.status !== 'all') where.status = String(q.status)

  const { rows, total } = await db().find<DocumentItem>('documents', {
    where, order: { field: 'created_at', asc: false }, limit, offset: (page - 1) * limit
  })

  const { rows: all } = await db().find<DocumentItem>('documents', { where: { seller_id: user.id } })
  const counts = {
    all: all.length,
    approved: all.filter((d) => d.status === 'approved').length,
    pending: all.filter((d) => d.status === 'pending').length,
    rejected: all.filter((d) => d.status === 'rejected').length
  }
  return { success: true, data: { items: rows, counts, ...paginate(total, page, limit) } }
})
