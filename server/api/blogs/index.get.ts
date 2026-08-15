import { db } from '~/server/utils/driver'
import { paginate } from '~/server/utils/helpers'
import type { Blog } from '~/types'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(24, Number(q.limit) || 9)
  const opts: any = { where: { published: true }, order: { field: 'created_at', asc: false }, limit, offset: (page - 1) * limit }
  if (q.q) opts.search = { fields: ['title', 'excerpt', 'content'], term: String(q.q) }
  const { rows, total } = await db().find<Blog>('blogs', opts)
  return { success: true, data: { items: rows, ...paginate(total, page, limit) } }
})
