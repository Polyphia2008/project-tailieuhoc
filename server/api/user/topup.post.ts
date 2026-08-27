import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireUser, publicUser } from '~/server/utils/auth'
import { assertBody, fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  assertBody(body, ['amount'])

  const amount = Math.round(Number(body.amount))
  if (!Number.isFinite(amount) || amount < 10000) fail(400, 'Số tiền nạp tối thiểu là 10.000đ')
  if (amount > 50000000) fail(400, 'Số tiền nạp tối đa là 50.000.000đ')

  const db = useDriver()
  const after = Number(user.balance || 0) + amount
  const updated = await db.update('users', user.id, { balance: after })

  await db.insert('transactions', {
    id: 't_' + cryptoId(),
    user_id: user.id,
    type: 'topup',
    amount,
    balance_after: after,
    ref: 'TOPUP' + cryptoId().toUpperCase().slice(0, 8),
    note: `Nạp tiền qua ${body.method === 'vnpay' ? 'VNPay' : 'cổng giả lập'}`,
    status: 'success',
    created_at: new Date().toISOString()
  })

  await db.insert('notifications', {
    id: 'n_' + cryptoId(),
    user_id: user.id,
    title: 'Nạp tiền thành công',
    body: `Ví của bạn đã được cộng ${amount.toLocaleString('vi-VN')}đ.`,
    type: 'success',
    link: '/dashboard/doanh-thu',
    read: false,
    created_at: new Date().toISOString()
  })

  return { user: publicUser(updated), amount, balance: after }
})
