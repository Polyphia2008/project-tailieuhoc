import { db, cryptoId } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { sanitize } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const reason = sanitize(body?.reason, 120)
  if (!reason) throw createError({ statusCode: 400, statusMessage: 'Vui lòng chọn lý do khiếu nại' })

  const doc = await db().findOne<any>('documents', { id })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tài liệu' })

  const report = await db().insert('reports', {
    id: cryptoId(), document_id: id, document_title: doc.title, user_id: user.id, user_name: user.name,
    reason, detail: sanitize(body?.detail, 2000), status: 'open', created_at: new Date().toISOString()
  })
  return { success: true, data: report, message: 'Đã gửi khiếu nại, chúng tôi sẽ xử lý sớm nhất' }
})
