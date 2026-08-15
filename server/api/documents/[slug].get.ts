import type { DocumentItem, Review, User } from '~/types'
import { db } from '~/server/utils/driver'
import { getUser, publicUser } from '~/server/utils/auth'
import { attachSellers, hasPurchased } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const doc = await db().findOne<DocumentItem>('documents', { slug })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tài liệu' })

  const me = await getUser(event)
  const isOwnerOrAdmin = me && (me.id === doc.seller_id || me.role === 'admin')
  if (doc.status !== 'approved' && !isOwnerOrAdmin) {
    throw createError({ statusCode: 404, statusMessage: 'Tài liệu không khả dụng' })
  }

  await db().increment('documents', doc.id, 'view_count', 1)
  doc.view_count = (doc.view_count || 0) + 1

  const [withSeller] = await attachSellers([doc])

  const { rows: rawReviews } = await db().find<Review>('reviews', {
    where: { document_id: doc.id },
    order: { field: 'created_at' }
  })
  const uids = [...new Set(rawReviews.map((r) => r.user_id))]
  const { rows: reviewers } = uids.length ? await db().find<User>('users', { whereIn: { id: uids } }) : { rows: [] as User[] }
  const umap = new Map(reviewers.map((u) => [u.id, publicUser(u)]))
  const reviews = rawReviews.map((r) => ({ ...r, user: umap.get(r.user_id) }))

  const { rows: rel } = await db().find<DocumentItem>('documents', {
    where: { subject: doc.subject, status: 'approved' },
    order: { field: 'sold_count' },
    limit: 7
  })
  const related = await attachSellers(rel.filter((r) => r.id !== doc.id).slice(0, 6))

  let owned = doc.is_free
  let favorited = false
  if (me) {
    if (!owned) owned = me.id === doc.seller_id || me.role === 'admin' || (await hasPurchased(me.id, doc.id))
    favorited = !!(await db().findOne('favorites', { user_id: me.id, document_id: doc.id }))
  }

  return { success: true, data: { document: withSeller, reviews, related, owned, favorited } }
})
