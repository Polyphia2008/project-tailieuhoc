import { currentUser, publicUser } from '~/server/utils/auth'
import { useDriver } from '~/server/utils/driver'

export default defineEventHandler(async (event) => {
  const user = await currentUser(event)
  if (!user) return { user: null, unread: 0 }

  const db = useDriver()
  const unread = await db.count('notifications', { where: { user_id: user.id, read: false } })
  return { user: publicUser(user), unread }
})
