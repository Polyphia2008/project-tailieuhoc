import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireUser, publicUser } from '~/server/utils/auth'
import { assertBody, fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  assertBody(body, ['amount'])

  const db = useDriver()
  const settings = await db.getSettings()
  const amount = Math.round(Number(body.amount))
  const min = Number(settings.min_withdraw ?? 200000)

  if (!Number.isFinite(amount) || amount < min) fail(400, `Số tiền rút tối thiểu là ${min.toLocaleString('vi-VN')}đ`)
  if (amount > Number(user.balance || 0)) fail(400, 'Số dư không đủ để thực hiện yêu cầu')

  const after = Number(user.balance) - amount
  const updated = await db.update('users', user.id, { balance: after })

  const bank = String(body.bank || 'Chưa cung cấp')
  const account = String(body.account || '').replace(/\d(?=\d{4})/g, '*')

  await db.insert('transactions', {
    id: 't_' + cryptoId(),
    user_id: user.id,
    type: 'withdraw',
    amount: -amount,
    balance_after: after,
    ref: 'WD' + cryptoId().toUpperCase().slice(0, 8),
    note: `Rút về ${bank} ${account}`.trim(),
    status: 'pending',
    created_at: new Date().toISOString()
  })

  await db.insert('notifications', {
    id: 'n_' + cryptoId(),
    user_id: user.id,
    title: 'Yêu cầu rút tiền đã được ghi nhận',
    body: `Yêu cầu rút ${amount.toLocaleString('vi-VN')}đ đang được xử lý, dự kiến hoàn tất trong 1-2 ngày làm việc.`,
    type: 'warning',
    link: '/dashboard/doanh-thu',
    read: false,
    created_at: new Date().toISOString()
  })

  return { user: publicUser(updated), amount, balance: after }
})
