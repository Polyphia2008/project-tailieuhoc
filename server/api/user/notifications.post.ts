import { useDriver } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const db = useDriver()

  if (body.all) {
    const { rows } = await db.find<any>('notifications', { where: { user_id: user.id, read: false } })
    for (const n of rows) await db.update('notifications', n.id, { read: true })
    return { ok: true, updated: rows.length, unread: 0 }
  }

  if (body.id) {
    const n = await db.findOne<any>('notifications', { id: String(body.id), user_id: user.id })
    if (n) await db.update('notifications', n.id, { read: true })
  }

  const unread = await db.count('notifications', { where: { user_id: user.id, read: false } })
  return { ok: true, unread }
})
