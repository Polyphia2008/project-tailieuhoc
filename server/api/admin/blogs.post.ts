import { db, cryptoId } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { sanitize, slugify } from '~/server/utils/helpers'
import type { Blog } from '~/types'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const b = await readBody(event)
  const action = b.action || 'create'

  if (action === 'delete') {
    await db().remove('blogs', b.id)
    return { success: true, data: { id: b.id }, message: 'Đã xoá bài viết' }
  }

  const title = sanitize(b.title, 200)
  if (!title) throw createError({ statusCode: 400, statusMessage: 'Vui lòng nhập tiêu đề' })
  const payload: any = {
    title, slug: sanitize(b.slug, 90) || slugify(title),
    excerpt: sanitize(b.excerpt, 400), content: sanitize(b.content, 30000),
    thumbnail: sanitize(b.thumbnail, 300), tags: Array.isArray(b.tags) ? b.tags.map((t: string) => sanitize(t, 30)) : [],
    published: b.published !== false, updated_at: new Date().toISOString()
  }

  if (action === 'update') {
    const blog = await db().update<Blog>('blogs', b.id, payload)
    return { success: true, data: blog, message: 'Đã cập nhật bài viết' }
  }
  const blog = await db().insert<Blog>('blogs', {
    id: cryptoId(), ...payload, author_id: admin.id, author_name: admin.name,
    view_count: 0, created_at: new Date().toISOString()
  })
  return { success: true, data: blog, message: 'Đã đăng bài viết' }
})
