import { db, cryptoId } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { sanitize, notify } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const b = await readBody(event)
  const amount = Math.floor(Number(b?.amount) || 0)
  const settings = await db().getSettings()
  const min = Number(settings.min_withdraw) || 200000

  if (amount < min) throw createError({ statusCode: 400, statusMessage: `Số tiền rút tối thiểu là ${min.toLocaleString('vi-VN')}đ` })
  if (amount > (user.balance || 0)) throw createError({ statusCode: 400, statusMessage: 'Số dư ví không đủ' })
  const bank = sanitize(b?.bank_name || user.bank_name, 60)
  const num = sanitize(b?.bank_number || user.bank_number, 30)
  if (!bank || !num) throw createError({ statusCode: 400, statusMessage: 'Vui lòng nhập thông tin ngân hàng nhận tiền' })

  const bal = (user.balance || 0) - amount
  await db().update('users', user.id, { balance: bal, bank_name: bank, bank_number: num })
  const tx = await db().insert('transactions', {
    id: cryptoId(), user_id: user.id, type: 'withdraw', amount: -amount, balance_after: bal,
    note: `Rút tiền về ${bank} - ${num}`, ref: 'WD' + Date.now().toString(36).toUpperCase(),
    status: 'pending', created_at: new Date().toISOString()
  })
  await notify(user.id, 'Yêu cầu rút tiền', `Yêu cầu rút ${amount.toLocaleString('vi-VN')}đ đang được xử lý (1-3 ngày làm việc).`, 'wallet', '/dashboard/doanh-thu')
  return { success: true, data: { transaction: tx, balance: bal }, message: 'Đã gửi yêu cầu rút tiền' }
})
