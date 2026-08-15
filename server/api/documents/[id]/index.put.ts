import { db } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { sanitize } from '~/server/utils/helpers'
import type { DocumentItem } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const doc = await db().findOne<DocumentItem>('documents', { id })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tài liệu' })
  if (doc.seller_id !== user.id && user.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền sửa tài liệu này' })

  const b = await readBody(event)
  const patch: any = { updated_at: new Date().toISOString() }
  if (b.title) patch.title = sanitize(b.title, 200)
  if (b.description !== undefined) patch.description = sanitize(b.description, 5000)
  if (b.subject) patch.subject = sanitize(b.subject, 20)
  if (b.grade !== undefined) patch.grade = Number(b.grade) || 0
  if (b.tags) patch.tags = (Array.isArray(b.tags) ? b.tags : String(b.tags).split(',')).map((t: string) => sanitize(t, 30)).filter(Boolean).slice(0, 8)
  if (b.price !== undefined) { patch.price = Math.max(0, Number(b.price) || 0); patch.is_free = patch.price === 0 }
  if (user.role !== 'admin') patch.status = 'pending'

  const updated = await db().update<DocumentItem>('documents', id, patch)
  return { success: true, data: updated, message: user.role === 'admin' ? 'Đã cập nhật' : 'Đã cập nhật, tài liệu chờ duyệt lại' }
})
