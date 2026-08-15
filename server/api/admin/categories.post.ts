import { db, cryptoId } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { sanitize, slugify } from '~/server/utils/helpers'
import type { Category } from '~/types'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = await readBody(event)
  const action = b.action || 'create'

  if (action === 'delete') {
    await db().remove('categories', b.id)
    return { success: true, data: { id: b.id }, message: 'Đã xoá danh mục' }
  }

  const name = sanitize(b.name, 60)
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Vui lòng nhập tên danh mục' })
  const payload: any = {
    name, slug: sanitize(b.slug, 40) || slugify(name),
    icon: sanitize(b.icon, 40) || 'fa-book', color: sanitize(b.color, 20) || '#0b4a8f',
    description: sanitize(b.description, 300)
  }

  if (action === 'update') {
    const c = await db().update<Category>('categories', b.id, payload)
    return { success: true, data: c, message: 'Đã cập nhật danh mục' }
  }
  const c = await db().insert<Category>('categories', { id: cryptoId(), ...payload, created_at: new Date().toISOString() })
  return { success: true, data: c, message: 'Đã thêm danh mục' }
})
