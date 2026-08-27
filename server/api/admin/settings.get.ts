import { useDriver, driverStatus } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { r2Status } from '~/server/utils/r2'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const settings = await useDriver().getSettings()
  return { settings, storage: r2Status(), database: driverStatus() }
})
