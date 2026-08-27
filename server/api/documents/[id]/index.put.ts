import { useDriver } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { fail, num, str } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const db = useDriver()

  const doc = await db.findOne<any>('documents', { id })
  if (!doc) fail(404, 'Không tìm thấy tài liệu')
  if (doc.seller_id !== user.id && user.role !== 'admin') fail(403, 'Bạn không có quyền sửa tài liệu này')

  const patch: Record<string, any> = { updated_at: new Date().toISOString() }
  if (str(body.title)) patch.title = String(body.title).trim()
  if (str(body.description)) patch.description = String(body.description).trim()
  if (str(body.subject)) patch.subject = String(body.subject)
  if (num(body.grade)) patch.grade = num(body.grade)
  if (body.is_free !== undefined) {
    patch.is_free = Boolean(body.is_free)
    if (patch.is_free) patch.price = 0
  }
  if (num(body.price) !== undefined && !patch.is_free) patch.price = num(body.price)
  if (Array.isArray(body.tags)) patch.tags = body.tags.slice(0, 8).map(String)
  if (str(body.thumbnail) !== undefined) patch.thumbnail = str(body.thumbnail) || ''

  if (user.role !== 'admin') patch.status = 'pending'
  else if (str(body.status)) patch.status = str(body.status)

  const updated = await db.update('documents', id, patch)
  return { document: updated }
})
