import { db } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import type { DocumentItem, Order, User } from '~/types'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const [{ rows: users }, { rows: docs }, { rows: orders }, { rows: reports }] = await Promise.all([
    db().find<User>('users', {}), db().find<DocumentItem>('documents', {}),
    db().find<Order>('orders', {}), db().find<any>('reports', {})
  ])
  const paid = orders.filter((o) => o.status === 'paid')
  const gmv = paid.reduce((s, o) => s + o.amount, 0)

  const chart: { label: string; revenue: number; orders: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const m = paid.filter((o) => String(o.created_at).startsWith(key))
    chart.push({ label: `T${d.getMonth() + 1}`, revenue: m.reduce((s, o) => s + (o.commission || 0), 0), orders: m.length })
  }

  const top = [...docs].filter((d) => d.status === 'approved')
    .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)).slice(0, 8)
    .map((d) => ({ id: d.id, title: d.title, slug: d.slug, subject: d.subject, sold_count: d.sold_count, price: d.price, revenue: (d.sold_count || 0) * d.price }))

  return {
    success: true,
    data: {
      users: users.length,
      sellers: users.filter((u) => u.role === 'seller' || u.role === 'admin').length,
      blocked: users.filter((u) => u.blocked).length,
      documents: docs.length,
      approved: docs.filter((d) => d.status === 'approved').length,
      pending: docs.filter((d) => d.status === 'pending').length,
      rejected: docs.filter((d) => d.status === 'rejected').length,
      orders: paid.length,
      gmv,
      commission: paid.reduce((s, o) => s + (o.commission || 0), 0),
      reports_open: reports.filter((r) => r.status === 'open').length,
      chart, top
    }
  }
})
