import { db } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { hasPurchased } from '~/server/utils/helpers'
import { cryptoId } from '~/server/utils/driver'
import type { DocumentItem } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const doc = await db().findOne<DocumentItem>('documents', { id })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tài liệu' })

  const owned = doc.is_free || doc.seller_id === user.id || user.role === 'admin' || (await hasPurchased(user.id, doc.id))
  if (!owned) throw createError({ statusCode: 403, statusMessage: 'Bạn cần mua tài liệu này trước khi tải' })

  await db().increment('documents', doc.id, 'download_count', 1)
  await db().insert('downloads', {
    id: cryptoId(), user_id: user.id, document_id: doc.id, created_at: new Date().toISOString()
  })

  return { success: true, data: { url: doc.file_url, filename: `${doc.slug}.${doc.file_type || 'pdf'}` }, message: 'Bắt đầu tải tài liệu' }
})
