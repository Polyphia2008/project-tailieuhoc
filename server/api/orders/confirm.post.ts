import { db } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { settleOrder } from './checkout.post'
import type { Order } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { code, result = 'success' } = await readBody(event)
  const order = await db().findOne<Order>('orders', { code })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy đơn hàng' })
  if (order.buyer_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'Không có quyền' })

  if (result !== 'success') {
    const failed = await db().update<Order>('orders', order.id, { status: 'failed' })
    return { success: false, data: failed, message: 'Thanh toán bị huỷ' }
  }
  const paid = await settleOrder(order)
  return { success: true, data: paid, message: 'Thanh toán thành công!' }
})
