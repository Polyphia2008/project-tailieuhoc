import { db, cryptoId } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const doc = await db().findOne('documents', { id })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tài liệu' })

  const fav = await db().findOne<any>('favorites', { user_id: user.id, document_id: id })
  if (fav) {
    await db().remove('favorites', fav.id)
    return { success: true, data: { favorited: false }, message: 'Đã bỏ khỏi yêu thích' }
  }
  await db().insert('favorites', {
    id: cryptoId(), user_id: user.id, document_id: id, created_at: new Date().toISOString()
  })
  return { success: true, data: { favorited: true }, message: 'Đã thêm vào yêu thích' }
})
