import { db } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return { success: true, data: await db().getSettings() }
})
