import { useDriver } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { paginate, paged, str, seriesFrom, num } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const q = getQuery(event)
  const { page, limit, offset } = paginate(q, 20)
  const db = useDriver()

  const where: Record<string, any> = { user_id: user.id }
  if (str(q.type)) where.type = str(q.type)

  const { rows, total } = await db.find<any>('transactions', {
    where,
    order: { field: 'created_at' },
    limit,
    offset
  })

  const { rows: all } = await db.find<any>('transactions', { where: { user_id: user.id } })
  const income = all.filter((t) => t.amount > 0 && t.status === 'success').reduce((s, t) => s + t.amount, 0)
  const outcome = all.filter((t) => t.amount < 0 && t.status === 'success').reduce((s, t) => s + Math.abs(t.amount), 0)
  const pendingWithdraw = all.filter((t) => t.type === 'withdraw' && t.status === 'pending').reduce((s, t) => s + Math.abs(t.amount), 0)

  const days = num(q.days) ?? 30
  const income$ = seriesFrom(all.filter((t) => t.amount > 0), days, 'created_at', 'amount')
  const outcome$ = seriesFrom(
    all.filter((t) => t.amount < 0).map((t) => ({ ...t, abs: Math.abs(t.amount) })),
    days, 'created_at', 'abs'
  )

  return {
    ...paged(rows, total, page, limit),
    summary: { balance: user.balance, income, outcome, pending_withdraw: pendingWithdraw },
    chart: { labels: income$.labels, income: income$.data, outcome: outcome$.data }
  }
})
