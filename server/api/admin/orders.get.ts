import { db } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { paginate } from '~/server/utils/helpers'
import type { Order } from '~/types'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(50, Number(q.limit) || 15)
  const opts: any = { order: { field: 'created_at', asc: false }, limit, offset: (page - 1) * limit, where: {} }
  if (q.status && q.status !== 'all') opts.where.status = String(q.status)
  if (q.q) opts.search = { fields: ['code', 'document_title', 'buyer_name'], term: String(q.q) }

  const { rows, total } = await db().find<Order>('orders', opts)
  const { rows: all } = await db().find<Order>('orders', { where: { status: 'paid' } })
  return {
    success: true,
    data: {
      items: rows,
      summary: { gmv: all.reduce((s, o) => s + o.amount, 0), commission: all.reduce((s, o) => s + (o.commission || 0), 0), count: all.length },
      ...paginate(total, page, limit)
    }
  }
})
