import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { useR2 } from '~/server/utils/r2'
import { fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const db = useDriver()

  const doc = await db.findOne<any>('documents', { id })
  if (!doc) fail(404, 'Không tìm thấy tài liệu')

  const isOwner = doc.seller_id === user.id
  const allowed = doc.is_free || isOwner || user.role === 'admin' ||
    Boolean(await db.findOne('orders', { buyer_id: user.id, document_id: id, status: 'paid' }))
  if (!allowed) fail(403, 'Bạn cần mua tài liệu này trước khi tải về')

  await db.insert('downloads', {
    id: 'dl_' + cryptoId(),
    user_id: user.id,
    document_id: id,
    created_at: new Date().toISOString()
  })
  await db.increment('documents', id, 'download_count')

  const r2 = useR2()
  return {
    ok: true,
    url: r2.publicUrl(doc.file_url || `documents/${doc.slug}.pdf`),
    filename: `${doc.slug}.${doc.file_type || 'pdf'}`,
    storage: r2.kind
  }
})
