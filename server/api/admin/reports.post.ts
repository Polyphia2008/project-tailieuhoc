import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { assertBody, fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  assertBody(body, ['id', 'action'])

  const action = String(body.action)
  if (!['resolve', 'dismiss', 'reopen'].includes(action)) fail(400, 'Hành động không hợp lệ')

  const db = useDriver()
  const report = await db.findOne<any>('reports', { id: String(body.id) })
  if (!report) fail(404, 'Không tìm thấy khiếu nại')

  const status = action === 'resolve' ? 'resolved' : action === 'dismiss' ? 'dismissed' : 'open'
  const updated = await db.update('reports', report.id, {
    status,
    admin_note: String(body.note || report.admin_note || '')
  })

  if (action === 'resolve' && body.reject_document) {
    await db.update('documents', report.document_id, {
      status: 'rejected',
      reject_reason: `Bị khiếu nại: ${report.reason}`
    })
  }

  if (action !== 'reopen') {
    await db.insert('notifications', {
      id: 'n_' + cryptoId(),
      user_id: report.user_id,
      title: action === 'resolve' ? 'Khiếu nại đã được xử lý' : 'Khiếu nại đã được xem xét',
      body: String(body.note || 'Cảm ơn bạn đã báo cáo. Chúng tôi đã xem xét và xử lý.'),
      type: action === 'resolve' ? 'success' : 'info',
      link: '/tai-lieu',
      read: false,
      created_at: new Date().toISOString()
    })
  }

  return { report: updated }
})
