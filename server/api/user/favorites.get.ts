import { useDriver } from '~/server/utils/driver'
import { requireUser, slimUser } from '~/server/utils/auth'
import { paginate, paged } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const q = getQuery(event)
  const { page, limit, offset } = paginate(q, 12)
  const db = useDriver()

  const { rows: favs, total } = await db.find<any>('favorites', {
    where: { user_id: user.id },
    order: { field: 'created_at' },
    limit,
    offset
  })

  const docIds = favs.map((f) => f.document_id)
  const { rows: docs } = await db.find<any>('documents', { whereIn: { id: docIds } })
  const sellerIds = [...new Set(docs.map((d) => d.seller_id))]
  const { rows: sellers } = await db.find<any>('users', { whereIn: { id: sellerIds } })
  const smap = new Map(sellers.map((s) => [s.id, slimUser(s)]))
  const dmap = new Map(docs.map((d) => [d.id, { ...d, seller: smap.get(d.seller_id) || null }]))

  const items = favs.map((f) => dmap.get(f.document_id)).filter(Boolean)
  return paged(items, total, page, limit)
})
