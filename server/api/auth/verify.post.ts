import { useDriver } from '~/server/utils/driver'
import { requireUser, publicUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const updated = await useDriver().update('users', user.id, { email_verified: true })
  return { user: publicUser(updated) }
})
