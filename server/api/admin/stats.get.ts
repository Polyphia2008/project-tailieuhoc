import { useDriver } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { seriesFrom, num } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDriver()
  const days = num(getQuery(event).days) ?? 30

  const [{ rows: users }, { rows: docs }, { rows: orders }, { rows: txs }, { rows: reports }, { rows: blogs }] = await Promise.all([
    db.find<any>('users'),
    db.find<any>('documents'),
    db.find<any>('orders'),
    db.find<any>('transactions'),
    db.find<any>('reports'),
    db.find<any>('blogs')
  ])

  const paid = orders.filter((o) => o.status === 'paid')
  const gmv = paid.reduce((s, o) => s + Number(o.amount || 0), 0)
  const commission = paid.reduce((s, o) => s + Number(o.commission || 0), 0)

  const gmv$ = seriesFrom(paid, days, 'paid_at', 'amount')
  const commission$ = seriesFrom(paid, days, 'paid_at', 'commission')
  const orders$ = seriesFrom(paid, days, 'paid_at')
  const users$ = seriesFrom(users, days, 'created_at')
  const docs$ = seriesFrom(docs, days, 'created_at')

  const bySubject = Object.entries(
    docs.filter((d) => d.status === 'approved').reduce((acc: Record<string, number>, d) => {
      acc[d.subject] = (acc[d.subject] || 0) + 1
      return acc
    }, {})
  ).map(([subject, count]) => ({ subject, count })).sort((a, b) => b.count - a.count)

  const topSellers = Object.entries(
    paid.reduce((acc: Record<string, number>, o) => {
      acc[o.seller_id] = (acc[o.seller_id] || 0) + Number(o.seller_amount || 0)
      return acc
    }, {})
  )
    .map(([id, revenue]) => {
      const u = users.find((x) => x.id === id)
      return { id, name: u?.name || 'N/A', avatar: u?.avatar || '', revenue: revenue as number }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const topDocs = [...docs]
    .filter((d) => d.status === 'approved')
    .sort((a, b) => b.sold_count - a.sold_count)
    .slice(0, 6)
    .map((d) => ({ id: d.id, title: d.title, slug: d.slug, subject: d.subject, price: d.price, sold_count: d.sold_count, view_count: d.view_count, rating_avg: d.rating_avg }))

  return {
    cards: {
      users: users.length,
      users_blocked: users.filter((u) => u.blocked).length,
      sellers: users.filter((u) => u.role === 'seller' || u.role === 'admin').length,
      documents: docs.length,
      documents_approved: docs.filter((d) => d.status === 'approved').length,
      documents_pending: docs.filter((d) => d.status === 'pending').length,
      documents_rejected: docs.filter((d) => d.status === 'rejected').length,
      orders: paid.length,
      orders_pending: orders.filter((o) => o.status === 'pending').length,
      gmv,
      commission,
      reports_open: reports.filter((r) => r.status === 'open').length,
      blogs: blogs.length,
      withdraw_pending: txs.filter((t) => t.type === 'withdraw' && t.status === 'pending').length,
      views: docs.reduce((s, d) => s + Number(d.view_count || 0), 0),
      downloads: docs.reduce((s, d) => s + Number(d.download_count || 0), 0)
    },
    chart: {
      labels: gmv$.labels,
      gmv: gmv$.data,
      commission: commission$.data,
      orders: orders$.data,
      users: users$.data,
      documents: docs$.data
    },
    by_subject: bySubject,
    top_sellers: topSellers,
    top_documents: topDocs
  }
})
