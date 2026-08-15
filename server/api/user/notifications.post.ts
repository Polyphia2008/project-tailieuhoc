import { db } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import type { Notification } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { id, action = 'read' } = await readBody(event)
  if (action === 'read_all') {
    const { rows } = await db().find<Notification>('notifications', { where: { user_id: user.id, read: false } })
    for (const n of rows) await db().update('notifications', n.id, { read: true })
    return { success: true, data: { count: rows.length }, message: 'Đã đánh dấu tất cả là đã đọc' }
  }
  const n = await db().findOne<Notification>('notifications', { id, user_id: user.id })
  if (!n) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy thông báo' })
  const updated = await db().update('notifications', n.id, { read: true })
  return { success: true, data: updated }
})
