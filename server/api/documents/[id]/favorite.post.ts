import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const db = useDriver()

  const doc = await db.findOne('documents', { id })
  if (!doc) fail(404, 'Không tìm thấy tài liệu')

  const existing = await db.findOne<any>('favorites', { user_id: user.id, document_id: id })
  if (existing) {
    await db.remove('favorites', existing.id)
    return { favorited: false }
  }

  await db.insert('favorites', {
    id: 'f_' + cryptoId(),
    user_id: user.id,
    document_id: id,
    created_at: new Date().toISOString()
  })
  return { favorited: true }
})
