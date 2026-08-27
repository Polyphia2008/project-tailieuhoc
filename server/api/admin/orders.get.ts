import { useDriver } from '~/server/utils/driver'
import { requireAdmin, slimUser } from '~/server/utils/auth'
import { paginate, paged, str } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const { page, limit, offset } = paginate(q, 15)
  const db = useDriver()

  const where: Record<string, any> = {}
  if (str(q.status)) where.status = str(q.status)
  if (str(q.method)) where.method = str(q.method)

  const { rows, total } = await db.find<any>('orders', {
    where,
    search: str(q.q) ? { fields: ['code'], term: str(q.q)! } : undefined,
    order: { field: 'created_at' },
    limit,
    offset
  })

  const docIds = [...new Set(rows.map((o) => o.document_id))]
  const userIds = [...new Set(rows.flatMap((o) => [o.buyer_id, o.seller_id]))]
  const [{ rows: docs }, { rows: users }] = await Promise.all([
    db.find<any>('documents', { whereIn: { id: docIds } }),
    db.find<any>('users', { whereIn: { id: userIds } })
  ])
  const dmap = new Map(docs.map((d) => [d.id, { id: d.id, title: d.title, slug: d.slug, subject: d.subject }]))
  const umap = new Map(users.map((u) => [u.id, slimUser(u)]))

  const { rows: all } = await db.find<any>('orders')
  const paid = all.filter((o) => o.status === 'paid')
  const counts = {
    all: all.length,
    paid: paid.length,
    pending: all.filter((o) => o.status === 'pending').length,
    failed: all.filter((o) => o.status === 'failed').length,
    refunded: all.filter((o) => o.status === 'refunded').length,
    gmv: paid.reduce((s, o) => s + Number(o.amount || 0), 0),
    commission: paid.reduce((s, o) => s + Number(o.commission || 0), 0)
  }

  return {
    ...paged(
      rows.map((o) => ({
        ...o,
        document: dmap.get(o.document_id) || null,
        buyer: umap.get(o.buyer_id) || null,
        seller: umap.get(o.seller_id) || null
      })),
      total, page, limit
    ),
    counts
  }
})
