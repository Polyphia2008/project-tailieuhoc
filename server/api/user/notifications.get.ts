import { db } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import type { Notification } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { rows } = await db().find<Notification>('notifications', {
    where: { user_id: user.id }, order: { field: 'created_at', asc: false }, limit: 30
  })
  return { success: true, data: { items: rows, unread: rows.filter((n) => !n.read).length } }
})
