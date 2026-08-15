import { db } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { paginate } from '~/server/utils/helpers'
import type { Order, DocumentItem } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(50, Number(q.limit) || 12)

  const { rows, total } = await db().find<Order>('orders', {
    where: { buyer_id: user.id, status: 'paid' },
    order: { field: 'created_at', asc: false },
    limit, offset: (page - 1) * limit
  })

  const ids = [...new Set(rows.map((o) => o.document_id))]
  const { rows: docs } = ids.length ? await db().find<DocumentItem>('documents', { whereIn: { id: ids } }) : { rows: [] as DocumentItem[] }
  const map = new Map(docs.map((d) => [d.id, d]))

  return { success: true, data: { items: rows.map((o) => ({ ...o, document: map.get(o.document_id) })), ...paginate(total, page, limit) } }
})
