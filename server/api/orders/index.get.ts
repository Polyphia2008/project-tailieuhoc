import { useDriver } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { paginate, paged, str } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const q = getQuery(event)
  const { page, limit, offset } = paginate(q, 12)
  const db = useDriver()

  const role = String(q.role || 'buyer')
  const where: Record<string, any> = role === 'seller' ? { seller_id: user.id } : { buyer_id: user.id }
  if (str(q.status)) where.status = str(q.status)

  const { rows, total } = await db.find<any>('orders', {
    where,
    order: { field: 'created_at' },
    limit,
    offset
  })

  const docIds = [...new Set(rows.map((o) => o.document_id))]
  const { rows: docs } = await db.find<any>('documents', { whereIn: { id: docIds } })
  const dmap = new Map(docs.map((d) => [d.id, d]))

  return paged(rows.map((o) => ({ ...o, document: dmap.get(o.document_id) || null })), total, page, limit)
})
