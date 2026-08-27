import { useDriver } from '~/server/utils/driver'
import { requireAdmin, slimUser } from '~/server/utils/auth'
import { paginate, paged, str, bool } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const { page, limit, offset } = paginate(q, 15)
  const db = useDriver()

  const where: Record<string, any> = {}
  const published = bool(q.published)
  if (published !== undefined) where.published = published

  const { rows, total } = await db.find<any>('blogs', {
    where,
    search: str(q.q) ? { fields: ['title', 'excerpt', 'tags'], term: str(q.q)! } : undefined,
    order: { field: 'created_at' },
    limit,
    offset
  })

  const authorIds = [...new Set(rows.map((b) => b.author_id))]
  const { rows: authors } = await db.find<any>('users', { whereIn: { id: authorIds } })
  const amap = new Map(authors.map((u) => [u.id, slimUser(u)]))

  const { rows: all } = await db.find<any>('blogs')
  const counts = {
    all: all.length,
    published: all.filter((b) => b.published).length,
    draft: all.filter((b) => !b.published).length,
    views: all.reduce((s, b) => s + Number(b.view_count || 0), 0)
  }

  return {
    ...paged(rows.map((b) => ({ ...b, content: undefined, author: amap.get(b.author_id) || null })), total, page, limit),
    counts
  }
})
