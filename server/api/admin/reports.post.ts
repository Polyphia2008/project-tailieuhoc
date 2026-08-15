import { db } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { sanitize, notify } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id, status, note } = await readBody(event)
  const r = await db().findOne<any>('reports', { id })
  if (!r) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy khiếu nại' })
  if (!['open', 'resolved', 'rejected'].includes(status))
    throw createError({ statusCode: 400, statusMessage: 'Trạng thái không hợp lệ' })

  const updated = await db().update('reports', id, {
    status, admin_note: sanitize(note, 500), resolved_at: new Date().toISOString()
  })
  if (r.user_id)
    await notify(r.user_id, 'Khiếu nại đã được xử lý', `Khiếu nại về "${r.document_title}" đã được ${status === 'resolved' ? 'giải quyết' : 'từ chối'}.`, 'system')
  return { success: true, data: updated, message: 'Đã cập nhật khiếu nại' }
})
