import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { assertBody, fail } from '~/server/utils/helpers'

const ACTIONS = ['approve', 'reject', 'feature', 'unfeature', 'delete', 'pending']

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  assertBody(body, ['action'])

  const action = String(body.action)
  if (!ACTIONS.includes(action)) fail(400, 'Hành động không hợp lệ')

  const ids: string[] = Array.isArray(body.ids) ? body.ids.map(String) : body.id ? [String(body.id)] : []
  if (!ids.length) fail(400, 'Vui lòng chọn ít nhất một tài liệu')

  const db = useDriver()
  const now = new Date().toISOString()
  let affected = 0

  for (const id of ids) {
    const doc = await db.findOne<any>('documents', { id })
    if (!doc) continue

    if (action === 'delete') {
      await db.remove('documents', id)
      affected++
      continue
    }

    const patch: Record<string, any> = { updated_at: now }
    let notify: { title: string; body: string; type: string } | null = null

    if (action === 'approve') {
      patch.status = 'approved'
      patch.reject_reason = undefined
      notify = { title: 'Tài liệu đã được duyệt', body: `"${doc.title}" đã được duyệt và hiển thị công khai.`, type: 'success' }
    } else if (action === 'reject') {
      patch.status = 'rejected'
      patch.reject_reason = String(body.reason || 'Không đạt yêu cầu kiểm duyệt')
      notify = { title: 'Tài liệu bị từ chối', body: `"${doc.title}" không được duyệt. Lý do: ${patch.reject_reason}`, type: 'error' }
    } else if (action === 'pending') {
      patch.status = 'pending'
    } else if (action === 'feature') {
      patch.featured = true
    } else if (action === 'unfeature') {
      patch.featured = false
    }

    await db.update('documents', id, patch)
    affected++

    if (notify) {
      await db.insert('notifications', {
        id: 'n_' + cryptoId(),
        user_id: doc.seller_id,
        title: notify.title,
        body: notify.body,
        type: notify.type,
        link: '/dashboard/dang-ban',
        read: false,
        created_at: now
      })
    }
  }

  return { ok: true, affected, action }
})
