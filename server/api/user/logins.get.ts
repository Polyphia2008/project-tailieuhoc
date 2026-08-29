import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const items = Array.isArray(user.logins) ? user.logins : []
  return { items: items.slice(0, 8) }
})
