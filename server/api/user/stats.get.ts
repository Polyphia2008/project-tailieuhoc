import { useDriver } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { seriesFrom, num } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDriver()
  const days = num(getQuery(event).days) ?? 30

  const [{ rows: myDocs }, { rows: bought }, { rows: sold }, { rows: favs }, { rows: dls }] = await Promise.all([
    db.find<any>('documents', { where: { seller_id: user.id } }),
    db.find<any>('orders', { where: { buyer_id: user.id, status: 'paid' } }),
    db.find<any>('orders', { where: { seller_id: user.id, status: 'paid' } }),
    db.find<any>('favorites', { where: { user_id: user.id } }),
    db.find<any>('downloads', { where: { user_id: user.id } })
  ])

  const revenue = sold.reduce((s, o) => s + Number(o.seller_amount || 0), 0)
  const spent = bought.reduce((s, o) => s + Number(o.amount || 0), 0)
  const views = myDocs.reduce((s, d) => s + Number(d.view_count || 0), 0)
  const downloadsOfMine = myDocs.reduce((s, d) => s + Number(d.download_count || 0), 0)
  const rated = myDocs.filter((d) => d.rating_count > 0)
  const ratingAvg = rated.length ? rated.reduce((s, d) => s + d.rating_avg, 0) / rated.length : 0

  const revenue$ = seriesFrom(sold, days, 'paid_at', 'seller_amount')
  const orders$ = seriesFrom(sold, days, 'paid_at')
  const spent$ = seriesFrom(bought, days, 'paid_at', 'amount')
  const dl$ = seriesFrom(dls, days, 'created_at')

  return {
    cards: {
      balance: Number(user.balance || 0),
      revenue,
      spent,
      documents: myDocs.length,
      documents_approved: myDocs.filter((d) => d.status === 'approved').length,
      documents_pending: myDocs.filter((d) => d.status === 'pending').length,
      bought: bought.length,
      sold: sold.length,
      favorites: favs.length,
      downloads: dls.length,
      views,
      downloads_of_mine: downloadsOfMine,
      rating_avg: Math.round(ratingAvg * 10) / 10
    },
    chart: {
      labels: revenue$.labels,
      revenue: revenue$.data,
      orders: orders$.data,
      spent: spent$.data,
      downloads: dl$.data
    },
    top_documents: [...myDocs]
      .filter((d) => d.status === 'approved')
      .sort((a, b) => b.sold_count - a.sold_count)
      .slice(0, 5)
      .map((d) => ({ id: d.id, title: d.title, slug: d.slug, sold_count: d.sold_count, view_count: d.view_count, price: d.price, subject: d.subject, rating_avg: d.rating_avg }))
  }
})
