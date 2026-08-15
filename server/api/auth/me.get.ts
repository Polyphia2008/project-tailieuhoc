import { getUser, safeUser } from '~/server/utils/auth'
import { db } from '~/server/utils/driver'

export default defineEventHandler(async (event) => {
  const u = await getUser(event)
  return { success: true, data: u ? safeUser(u) : null, mode: db().kind }
})
