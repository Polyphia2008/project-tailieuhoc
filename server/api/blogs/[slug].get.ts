import { db } from '~/server/utils/driver'
import type { Blog } from '~/types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const blog = await db().findOne<Blog>('blogs', { slug })
  if (!blog) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy bài viết' })
  await db().increment('blogs', blog.id, 'view_count', 1)
  const { rows } = await db().find<Blog>('blogs', { where: { published: true }, order: { field: 'created_at', asc: false }, limit: 4 })
  return { success: true, data: { blog, related: rows.filter((b) => b.id !== blog.id).slice(0, 3) } }
})
