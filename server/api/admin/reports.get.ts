import { db } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { paginate } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(50, Number(q.limit) || 15)
  const opts: any = { order: { field: 'created_at', asc: false }, limit, offset: (page - 1) * limit, where: {} }
  if (q.status && q.status !== 'all') opts.where.status = String(q.status)
  const { rows, total } = await db().find<any>('reports', opts)
  return { success: true, data: { items: rows, ...paginate(total, page, limit) } }
})
