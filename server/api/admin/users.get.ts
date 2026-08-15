import { db } from '~/server/utils/driver'
import { requireAdmin, safeUser } from '~/server/utils/auth'
import { paginate } from '~/server/utils/helpers'
import type { User } from '~/types'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(50, Number(q.limit) || 15)
  const opts: any = { order: { field: 'created_at', asc: false }, limit, offset: (page - 1) * limit, where: {} }
  if (q.role && q.role !== 'all') opts.where.role = String(q.role)
  if (q.q) opts.search = { fields: ['name', 'email'], term: String(q.q) }

  const { rows, total } = await db().find<User>('users', opts)
  return { success: true, data: { items: rows.map(safeUser), ...paginate(total, page, limit) } }
})
