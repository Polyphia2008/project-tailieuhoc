import { db, cryptoId } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const amount = Math.floor(Number((await readBody(event))?.amount) || 0)
  if (amount < 10000) throw createError({ statusCode: 400, statusMessage: 'Số tiền nạp tối thiểu là 10.000đ' })
  if (amount > 50000000) throw createError({ statusCode: 400, statusMessage: 'Số tiền nạp tối đa là 50.000.000đ' })

  const bal = (user.balance || 0) + amount
  await db().update('users', user.id, { balance: bal })
  const tx = await db().insert('transactions', {
    id: cryptoId(), user_id: user.id, type: 'topup', amount, balance_after: bal,
    note: 'Nạp tiền vào ví (demo)', ref: 'TU' + Date.now().toString(36).toUpperCase(),
    status: 'success', created_at: new Date().toISOString()
  })
  return { success: true, data: { transaction: tx, balance: bal }, message: `Nạp thành công ${amount.toLocaleString('vi-VN')}đ` }
})
