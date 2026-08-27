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

  const { rows, total } = await db.find<any>('reports', {
    where,
    order: { field: 'created_at' },
    limit,
    offset
  })

  const docIds = [...new Set(rows.map((r) => r.document_id))]
  const userIds = [...new Set(rows.map((r) => r.user_id))]
  const [{ rows: docs }, { rows: users }] = await Promise.all([
    db.find<any>('documents', { whereIn: { id: docIds } }),
    db.find<any>('users', { whereIn: { id: userIds } })
  ])
  const dmap = new Map(docs.map((d) => [d.id, { id: d.id, title: d.title, slug: d.slug, subject: d.subject, status: d.status }]))
  const umap = new Map(users.map((u) => [u.id, slimUser(u)]))

  const { rows: all } = await db.find<any>('reports')
  const counts = {
    all: all.length,
    open: all.filter((r) => r.status === 'open').length,
    resolved: all.filter((r) => r.status === 'resolved').length,
    dismissed: all.filter((r) => r.status === 'dismissed').length
  }

  return {
    ...paged(
      rows.map((r) => ({ ...r, document: dmap.get(r.document_id) || null, user: umap.get(r.user_id) || null })),
      total, page, limit
    ),
    counts
  }
})
