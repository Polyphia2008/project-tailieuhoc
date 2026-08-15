import { db } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { attachSellers } from '~/server/utils/helpers'
import type { DocumentItem } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { rows: favs } = await db().find<any>('favorites', {
    where: { user_id: user.id }, order: { field: 'created_at', asc: false }
  })
  const ids = favs.map((f) => f.document_id)
  if (!ids.length) return { success: true, data: { items: [], total: 0 } }
  const { rows } = await db().find<DocumentItem>('documents', { whereIn: { id: ids } })
  const items = await attachSellers(rows)
  return { success: true, data: { items, total: items.length } }
})
