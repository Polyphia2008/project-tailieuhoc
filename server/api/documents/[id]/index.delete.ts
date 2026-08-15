import { db } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import type { DocumentItem } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const doc = await db().findOne<DocumentItem>('documents', { id })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tài liệu' })
  if (doc.seller_id !== user.id && user.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền xoá tài liệu này' })
  await db().remove('documents', id)
  return { success: true, data: { id }, message: 'Đã xoá tài liệu' }
})
