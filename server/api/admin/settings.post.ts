import { useDriver } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { num, str, fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const patch: Record<string, any> = {}

  const rate = num(body.commission_rate)
  if (rate !== undefined) {
    if (rate < 0 || rate > 0.5) fail(400, 'Tỷ lệ hoa hồng phải từ 0% đến 50%')
    patch.commission_rate = rate
  }
  const minW = num(body.min_withdraw)
  if (minW !== undefined) patch.min_withdraw = Math.max(0, minW)
  const minP = num(body.min_price)
  if (minP !== undefined) patch.min_price = Math.max(0, minP)
  const maxF = num(body.max_file_mb)
  if (maxF !== undefined) patch.max_file_mb = Math.max(1, Math.min(500, maxF))

  for (const k of ['hotline', 'email', 'address', 'facebook']) {
    if (body[k] !== undefined) patch[k] = String(body[k]).slice(0, 300)
  }

  for (const k of ['maintenance', 'banner_enabled']) {
    if (body[k] !== undefined) patch[k] = Boolean(body[k])
  }

  for (const k of ['maintenance_note', 'banner_text']) {
    if (body[k] !== undefined) patch[k] = String(body[k]).slice(0, 600)
  }

  const settings = await useDriver().setSettings(patch)
  return { settings }
})
