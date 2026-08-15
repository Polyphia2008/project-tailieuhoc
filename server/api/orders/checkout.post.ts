import { db, cryptoId } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { orderCode, notify, getCommissionRate, hasPurchased } from '~/server/utils/helpers'
import type { DocumentItem, Order, User } from '~/types'

/** Chia tiền: 15% sàn, 85% người bán. Dùng chung cho ví & VNPay */
export async function settleOrder(order: Order): Promise<Order> {
  if (order.status === 'paid') return order
  const doc = await db().findOne<DocumentItem>('documents', { id: order.document_id })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Tài liệu không tồn tại' })

  const rate = await getCommissionRate()
  const fee = Math.round(order.amount * rate)
  const net = order.amount - fee
  const now = new Date().toISOString()

  const paid = await db().update<Order>('orders', order.id, {
    status: 'paid', commission: fee, seller_amount: net, paid_at: now
  })

  await db().insert('transactions', {
    id: cryptoId(), user_id: order.buyer_id, type: 'purchase', amount: -order.amount,
    balance_after: 0, note: `Mua tài liệu "${doc.title}"`, ref: order.code, status: 'success', created_at: now
  })

  const seller = await db().findOne<User>('users', { id: doc.seller_id })
  if (seller) {
    const bal = (seller.balance || 0) + net
    await db().update('users', seller.id, { balance: bal, total_revenue: (seller.total_revenue || 0) + net })
    await db().insert('transactions', {
      id: cryptoId(), user_id: seller.id, type: 'sale', amount: net, balance_after: bal,
      note: `Bán tài liệu "${doc.title}" (đã trừ ${Math.round(rate * 100)}% phí sàn)`,
      ref: order.code, status: 'success', created_at: now
    })
    await notify(seller.id, 'Bạn có đơn hàng mới!', `Tài liệu "${doc.title}" vừa được mua. Bạn nhận ${net.toLocaleString('vi-VN')}đ`, 'order', '/dashboard/doanh-thu')
  }

  await db().increment('documents', doc.id, 'sold_count', 1)
  await notify(order.buyer_id, 'Mua tài liệu thành công', `Bạn đã mua "${doc.title}". Tải về ngay trong mục Đã mua.`, 'order', '/dashboard/da-mua')
  return paid
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { document_id, method = 'wallet' } = await readBody(event)
  const doc = await db().findOne<DocumentItem>('documents', { id: document_id })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tài liệu' })
  if (doc.status !== 'approved') throw createError({ statusCode: 400, statusMessage: 'Tài liệu chưa được duyệt' })
  if (doc.is_free) throw createError({ statusCode: 400, statusMessage: 'Tài liệu miễn phí, bạn có thể tải trực tiếp' })
  if (doc.seller_id === user.id) throw createError({ statusCode: 400, statusMessage: 'Đây là tài liệu của bạn' })
  if (await hasPurchased(user.id, doc.id)) throw createError({ statusCode: 400, statusMessage: 'Bạn đã mua tài liệu này rồi' })

  const now = new Date().toISOString()
  const order = await db().insert<Order>('orders', {
    id: cryptoId(), code: orderCode(), buyer_id: user.id, buyer_name: user.name,
    document_id: doc.id, document_title: doc.title, document_slug: doc.slug, seller_id: doc.seller_id,
    amount: doc.price, commission: 0, seller_amount: 0, method,
    status: 'pending', created_at: now
  })

  if (method === 'wallet') {
    if ((user.balance || 0) < doc.price)
      throw createError({ statusCode: 400, statusMessage: 'Số dư ví không đủ. Vui lòng nạp thêm tiền.' })
    const bal = (user.balance || 0) - doc.price
    await db().update('users', user.id, { balance: bal })
    const paid = await settleOrder(order)
    return { success: true, data: { order: paid, redirect: null }, message: 'Thanh toán thành công!' }
  }

  return {
    success: true,
    data: { order, redirect: `/thanh-toan/gia-lap?code=${order.code}&amount=${order.amount}&method=${method}` },
    message: 'Đang chuyển tới cổng thanh toán'
  }
})
