import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { assertBody, fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  assertBody(body, ['reason'])

  const db = useDriver()
  const doc = await db.findOne('documents', { id })
  if (!doc) fail(404, 'Không tìm thấy tài liệu')

  const dup = await db.findOne('reports', { document_id: id, user_id: user.id, status: 'open' })
  if (dup) fail(409, 'Bạn đã báo cáo tài liệu này và đang được xử lý')

  const report = await db.insert('reports', {
    id: 'rp_' + cryptoId(),
    document_id: id,
    user_id: user.id,
    reason: String(body.reason),
    detail: String(body.detail || '').slice(0, 1000),
    status: 'open',
    created_at: new Date().toISOString()
  })

  const { rows: admins } = await db.find<any>('users', { where: { role: 'admin' } })
  for (const a of admins) {
    await db.insert('notifications', {
      id: 'n_' + cryptoId(),
      user_id: a.id,
      title: 'Khiếu nại mới',
      body: `Tài liệu "${(doc as any).title}" bị báo cáo: ${body.reason}`,
      type: 'error',
      link: '/admin/khieu-nai',
      read: false,
      created_at: new Date().toISOString()
    })
  }

  return { report }
})
