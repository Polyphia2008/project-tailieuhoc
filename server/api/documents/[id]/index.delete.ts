import { useDriver } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const db = useDriver()

  const doc = await db.findOne<any>('documents', { id })
  if (!doc) fail(404, 'Không tìm thấy tài liệu')
  if (doc.seller_id !== user.id && user.role !== 'admin') fail(403, 'Bạn không có quyền xoá tài liệu này')

  const sold = await db.count('orders', { where: { document_id: id, status: 'paid' } })
  if (sold > 0 && user.role !== 'admin') fail(400, 'Không thể xoá tài liệu đã có giao dịch. Bạn có thể ẩn tài liệu thay thế.')

  await db.remove('documents', id)
  return { ok: true }
})
