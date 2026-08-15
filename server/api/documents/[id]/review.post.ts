import { db, cryptoId } from '~/server/utils/driver'
import { requireUser, publicUser } from '~/server/utils/auth'
import { sanitize, hasPurchased, notify } from '~/server/utils/helpers'
import type { DocumentItem, Review } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const rating = Math.min(5, Math.max(1, Number(body?.rating) || 0))
  if (!rating) throw createError({ statusCode: 400, statusMessage: 'Vui lòng chọn số sao đánh giá' })

  const doc = await db().findOne<DocumentItem>('documents', { id })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tài liệu' })
  if (doc.seller_id === user.id) throw createError({ statusCode: 400, statusMessage: 'Bạn không thể tự đánh giá tài liệu của mình' })
  if (!doc.is_free && !(await hasPurchased(user.id, doc.id)))
    throw createError({ statusCode: 403, statusMessage: 'Chỉ người đã mua mới được đánh giá' })

  const existed = await db().findOne<Review>('reviews', { document_id: doc.id, user_id: user.id })
  const comment = sanitize(body?.comment, 1000)
  let review: Review
  if (existed) {
    review = await db().update<Review>('reviews', existed.id, { rating, comment })
  } else {
    review = await db().insert<Review>('reviews', {
      id: cryptoId(), document_id: doc.id, user_id: user.id, rating, comment,
      created_at: new Date().toISOString()
    })
    await notify(doc.seller_id, 'Đánh giá mới', `${user.name} vừa đánh giá "${doc.title}" ${rating} sao`, 'review', `/tai-lieu/${doc.slug}`)
  }

  const { rows } = await db().find<Review>('reviews', { where: { document_id: doc.id } })
  const avg = rows.reduce((s, r) => s + r.rating, 0) / (rows.length || 1)
  await db().update('documents', doc.id, { rating_avg: Math.round(avg * 10) / 10, rating_count: rows.length })

  return { success: true, data: { ...review, user: publicUser(user) }, message: 'Cảm ơn bạn đã đánh giá!' }
})
