import type { User } from '~/types'
import { db } from '~/server/utils/driver'
import { requireUser, safeUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const updated = await db().update<User>('users', u.id, { email_verified: true })
  return { success: true, data: safeUser(updated), message: 'Email đã được xác thực' }
})
