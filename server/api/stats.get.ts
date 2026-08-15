import type { DocumentItem, User, Order } from '~/types'
import { db } from '~/server/utils/driver'

export default defineEventHandler(async () => {
  const { rows: docs } = await db().find<DocumentItem>('documents', { where: { status: 'approved' } })
  const { rows: users } = await db().find<User>('users')
  const { rows: orders } = await db().find<Order>('orders', { where: { status: 'paid' } })

  return {
    success: true,
    data: {
      documents: docs.length,
      free_documents: docs.filter((d) => d.is_free).length,
      users: users.filter((u) => !u.blocked).length,
      sellers: users.filter((u) => u.role === 'seller' || u.role === 'admin').length,
      downloads: docs.reduce((s, d) => s + (d.download_count || 0), 0),
      orders: orders.length
    }
  }
})
