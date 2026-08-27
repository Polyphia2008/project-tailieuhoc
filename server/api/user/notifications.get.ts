import { useDriver } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { paginate, paged } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const q = getQuery(event)
  const { page, limit, offset } = paginate(q, 20)
  const db = useDriver()

  const { rows, total } = await db.find<any>('notifications', {
    where: { user_id: user.id },
    order: { field: 'created_at' },
    limit,
    offset
  })
  const unread = await db.count('notifications', { where: { user_id: user.id, read: false } })
  return { ...paged(rows, total, page, limit), unread }
})
