import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireUser, slimUser } from '~/server/utils/auth'
import { assertBody, fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  assertBody(body, ['rating'])

  const rating = Math.round(Number(body.rating))
  if (rating < 1 || rating > 5) fail(400, 'Điểm đánh giá phải từ 1 đến 5')

  const db = useDriver()
  const doc = await db.findOne<any>('documents', { id })
  if (!doc) fail(404, 'Không tìm thấy tài liệu')
  if (doc.seller_id === user.id) fail(400, 'Bạn không thể tự đánh giá tài liệu của mình')

  const owned = doc.is_free || Boolean(await db.findOne('orders', { buyer_id: user.id, document_id: id, status: 'paid' }))
  if (!owned) fail(403, 'Bạn cần mua tài liệu trước khi đánh giá')

  const existing = await db.findOne<any>('reviews', { user_id: user.id, document_id: id })
  const comment = String(body.comment || '').trim().slice(0, 1000)

  let review: any
  if (existing) {
    review = await db.update('reviews', existing.id, { rating, comment })
  } else {
    review = await db.insert('reviews', {
      id: 'r_' + cryptoId(),
      document_id: id,
      user_id: user.id,
      rating,
      comment,
      created_at: new Date().toISOString()
    })
  }

  const { rows: all } = await db.find<any>('reviews', { where: { document_id: id } })
  const avg = all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0
  await db.update('documents', id, {
    rating_avg: Math.round(avg * 10) / 10,
    rating_count: all.length
  })

  if (!existing) {
    await db.insert('notifications', {
      id: 'n_' + cryptoId(),
      user_id: doc.seller_id,
      title: `Đánh giá mới ${rating} sao`,
      body: `Tài liệu "${doc.title}" nhận được đánh giá ${rating} sao từ ${user.name}.`,
      type: 'info',
      link: '/dashboard/dang-ban',
      read: false,
      created_at: new Date().toISOString()
    })
  }

  return { review: { ...review, user: slimUser(user) }, rating_avg: Math.round(avg * 10) / 10, rating_count: all.length }
})
