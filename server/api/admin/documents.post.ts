import { db } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { sanitize, notify } from '~/server/utils/helpers'
import type { DocumentItem } from '~/types'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id, action, reason } = await readBody(event)
  const doc = await db().findOne<DocumentItem>('documents', { id })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tài liệu' })

  if (action === 'approve') {
    const d = await db().update<DocumentItem>('documents', id, { status: 'approved', reject_reason: '', updated_at: new Date().toISOString() })
    await notify(doc.seller_id, 'Tài liệu được duyệt', `"${doc.title}" đã được duyệt và hiển thị trên thư viện.`, 'document', `/tai-lieu/${doc.slug}`)
    return { success: true, data: d, message: 'Đã duyệt tài liệu' }
  }
  if (action === 'reject') {
    const r = sanitize(reason, 300) || 'Không đạt yêu cầu chất lượng'
    const d = await db().update<DocumentItem>('documents', id, { status: 'rejected', reject_reason: r, updated_at: new Date().toISOString() })
    await notify(doc.seller_id, 'Tài liệu bị từ chối', `"${doc.title}" bị từ chối. Lý do: ${r}`, 'document', '/dashboard/tai-lieu')
    return { success: true, data: d, message: 'Đã từ chối tài liệu' }
  }
  if (action === 'feature') {
    const d = await db().update<DocumentItem>('documents', id, { featured: !doc.featured })
    return { success: true, data: d, message: d.featured ? 'Đã đặt làm nổi bật' : 'Đã bỏ nổi bật' }
  }
  if (action === 'delete') {
    await db().remove('documents', id)
    return { success: true, data: { id }, message: 'Đã xoá tài liệu' }
  }
  throw createError({ statusCode: 400, statusMessage: 'Hành động không hợp lệ' })
})
