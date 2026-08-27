import { useDriver, cryptoId, orderCode } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { assertBody, fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  assertBody(body, ['document_id'])

  const db = useDriver()
  const doc = await db.findOne<any>('documents', { id: String(body.document_id) })
  if (!doc) fail(404, 'Không tìm thấy tài liệu')
  if (doc.status !== 'approved') fail(400, 'Tài liệu chưa được duyệt')
  if (doc.is_free) fail(400, 'Tài liệu này miễn phí, bạn có thể tải trực tiếp')
  if (doc.seller_id === user.id) fail(400, 'Bạn không thể mua tài liệu của chính mình')

  const dup = await db.findOne('orders', { buyer_id: user.id, document_id: doc.id, status: 'paid' })
  if (dup) fail(409, 'Bạn đã mua tài liệu này')

  const settings = await db.getSettings()
  const rate = Number(settings.commission_rate ?? 0.15)
  const commission = Math.round(doc.price * rate)
  const method = String(body.method || 'wallet')

  if (method === 'wallet' && user.balance < doc.price) {
    fail(400, `Số dư không đủ. Bạn cần thêm ${(doc.price - user.balance).toLocaleString('vi-VN')}đ`)
  }

  const order = await db.insert('orders', {
    id: 'o_' + cryptoId(),
    code: orderCode(),
    buyer_id: user.id,
    document_id: doc.id,
    seller_id: doc.seller_id,
    amount: doc.price,
    commission,
    seller_amount: doc.price - commission,
    method,
    status: 'pending',
    created_at: new Date().toISOString()
  })

  return {
    order,
    document: { id: doc.id, title: doc.title, slug: doc.slug, price: doc.price, thumbnail: doc.thumbnail, subject: doc.subject },
    next: method === 'wallet' ? 'confirm' : `/thanh-toan/gia-lap?code=${order.code}`
  }
})
