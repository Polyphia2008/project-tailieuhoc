import { useDriver } from '~/server/utils/driver'
import { currentUser, slimUser } from '~/server/utils/auth'
import { fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const db = useDriver()

  const doc = await db.findOne<any>('documents', { slug })
  if (!doc) fail(404, 'Không tìm thấy tài liệu')

  const me = await currentUser(event)
  const isOwner = me?.id === doc.seller_id
  const isAdmin = me?.role === 'admin'
  if (doc.status !== 'approved' && !isOwner && !isAdmin) fail(404, 'Không tìm thấy tài liệu')

  if (doc.status === 'approved') await db.increment('documents', doc.id, 'view_count')

  const seller = await db.findOne<any>('users', { id: doc.seller_id })

  const { rows: reviews } = await db.find<any>('reviews', {
    where: { document_id: doc.id },
    order: { field: 'created_at' },
    limit: 30
  })
  const reviewerIds = [...new Set(reviews.map((r) => r.user_id))]
  const { rows: reviewers } = await db.find<any>('users', { whereIn: { id: reviewerIds } })
  const rmap = new Map(reviewers.map((u) => [u.id, slimUser(u)]))

  const { rows: related } = await db.find<any>('documents', {
    where: { subject: doc.subject, status: 'approved' },
    whereNot: { id: doc.id },
    order: { field: 'view_count' },
    limit: 8
  })

  let owned = false
  let favorited = false
  let reviewed = false
  if (me) {
    owned = doc.is_free || isOwner || isAdmin || Boolean(await db.findOne('orders', { buyer_id: me.id, document_id: doc.id, status: 'paid' }))
    favorited = Boolean(await db.findOne('favorites', { user_id: me.id, document_id: doc.id }))
    reviewed = Boolean(await db.findOne('reviews', { user_id: me.id, document_id: doc.id }))
  }

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length
  }))

  const sellerDocs = await db.count('documents', { where: { seller_id: doc.seller_id, status: 'approved' } })

  return {
    document: { ...doc, seller: slimUser(seller) },
    reviews: reviews.map((r) => ({ ...r, user: rmap.get(r.user_id) || null })),
    dist,
    related,
    owned,
    favorited,
    reviewed,
    seller_stats: { documents: sellerDocs }
  }
})
