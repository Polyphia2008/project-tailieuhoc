import { db } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { paginate } from '~/server/utils/helpers'
import type { Transaction } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(50, Number(q.limit) || 15)
  const where: any = { user_id: user.id }
  if (q.type && q.type !== 'all') where.type = String(q.type)

  const { rows, total } = await db().find<Transaction>('transactions', {
    where, order: { field: 'created_at', asc: false }, limit, offset: (page - 1) * limit
  })

  const { rows: all } = await db().find<Transaction>('transactions', { where: { user_id: user.id } })
  const summary = {
    balance: user.balance || 0,
    total_revenue: user.total_revenue || 0,
    income: all.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
    outcome: all.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  }

  // Doanh thu 6 tháng gần nhất
  const chart: { label: string; value: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const value = all.filter((t) => t.type === 'sale' && String(t.created_at).startsWith(key)).reduce((s, t) => s + t.amount, 0)
    chart.push({ label: `T${d.getMonth() + 1}`, value })
  }

  return { success: true, data: { items: rows, summary, chart, ...paginate(total, page, limit) } }
})
