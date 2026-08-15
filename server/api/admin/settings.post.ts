import { db } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { sanitize } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = await readBody(event)
  const patch: any = {}
  if (b.commission_rate !== undefined) patch.commission_rate = Math.min(0.5, Math.max(0, Number(b.commission_rate) || 0))
  if (b.min_withdraw !== undefined) patch.min_withdraw = Math.max(0, Number(b.min_withdraw) || 0)
  if (b.min_price !== undefined) patch.min_price = Math.max(0, Number(b.min_price) || 0)
  if (b.max_file_mb !== undefined) patch.max_file_mb = Math.max(1, Number(b.max_file_mb) || 50)
  for (const k of ['hotline', 'email', 'address', 'facebook']) if (b[k] !== undefined) patch[k] = sanitize(b[k], 200)
  const s = await db().setSettings(patch)
  return { success: true, data: s, message: 'Đã lưu cài đặt' }
})
