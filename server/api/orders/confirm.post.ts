import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { assertBody, fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  assertBody(body, ['code'])

  const db = useDriver()
  const order = await db.findOne<any>('orders', { code: String(body.code) })
  if (!order) fail(404, 'Không tìm thấy đơn hàng')
  if (order.buyer_id !== user.id) fail(403, 'Đơn hàng không thuộc về bạn')
  if (order.status === 'paid') return { order, already: true }

  const success = body.success !== false
  const now = new Date().toISOString()

  if (!success) {
    const failed = await db.update('orders', order.id, { status: 'failed' })
    return { order: failed }
  }

  const doc = await db.findOne<any>('documents', { id: order.document_id })
  const buyer = await db.findOne<any>('users', { id: order.buyer_id })
  const seller = await db.findOne<any>('users', { id: order.seller_id })

  if (order.method === 'wallet') {
    if (buyer.balance < order.amount) fail(400, 'Số dư không đủ')
    const after = buyer.balance - order.amount
    await db.update('users', buyer.id, { balance: after })
    await db.insert('transactions', {
      id: 't_' + cryptoId(),
      user_id: buyer.id,
      type: 'purchase',
      amount: -order.amount,
      balance_after: after,
      ref: order.code,
      note: `Mua: ${doc?.title || 'tài liệu'}`,
      status: 'success',
      created_at: now
    })
  } else {
    await db.insert('transactions', {
      id: 't_' + cryptoId(),
      user_id: buyer.id,
      type: 'purchase',
      amount: -order.amount,
      balance_after: buyer.balance,
      ref: order.code,
      note: `Mua: ${doc?.title || 'tài liệu'} (${order.method === 'vnpay' ? 'VNPay' : 'cổng giả lập'})`,
      status: 'success',
      created_at: now
    })
  }

  if (seller) {
    const sAfter = Number(seller.balance || 0) + order.seller_amount
    await db.update('users', seller.id, { balance: sAfter })
    await db.insert('transactions', {
      id: 't_' + cryptoId(),
      user_id: seller.id,
      type: 'sale',
      amount: order.seller_amount,
      balance_after: sAfter,
      ref: order.code,
      note: `Bán tài liệu: ${doc?.title || ''} (đã trừ hoa hồng)`,
      status: 'success',
      created_at: now
    })
    await db.insert('notifications', {
      id: 'n_' + cryptoId(),
      user_id: seller.id,
      title: 'Bạn có đơn hàng mới',
      body: `"${doc?.title}" vừa được mua. Bạn nhận ${order.seller_amount.toLocaleString('vi-VN')}đ.`,
      type: 'success',
      link: '/dashboard/doanh-thu',
      read: false,
      created_at: now
    })
  }

  await db.increment('documents', order.document_id, 'sold_count')

  await db.insert('notifications', {
    id: 'n_' + cryptoId(),
    user_id: buyer.id,
    title: 'Mua tài liệu thành công',
    body: `Bạn đã mua "${doc?.title}". Tải về ngay trong Kho của tôi.`,
    type: 'success',
    link: '/dashboard/da-mua',
    read: false,
    created_at: now
  })

  const paid = await db.update('orders', order.id, { status: 'paid', paid_at: now })
  return { order: paid, document: doc }
})
