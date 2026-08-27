import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireAdmin, publicUser } from '~/server/utils/auth'
import { assertBody, fail, num } from '~/server/utils/helpers'

const ACTIONS = ['block', 'unblock', 'role', 'balance', 'delete']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)
  assertBody(body, ['action'])

  const action = String(body.action)
  if (!ACTIONS.includes(action)) fail(400, 'Hành động không hợp lệ')

  const ids: string[] = Array.isArray(body.ids) ? body.ids.map(String) : body.id ? [String(body.id)] : []
  if (!ids.length) fail(400, 'Vui lòng chọn ít nhất một người dùng')
  if (ids.includes(admin.id) && (action === 'block' || action === 'delete')) {
    fail(400, 'Bạn không thể tự khoá hoặc xoá tài khoản của mình')
  }

  const db = useDriver()
  const now = new Date().toISOString()
  let affected = 0
  let last: any = null

  for (const id of ids) {
    const u = await db.findOne<any>('users', { id })
    if (!u) continue

    if (action === 'delete') {
      await db.remove('users', id)
      affected++
      continue
    }

    const patch: Record<string, any> = {}
    if (action === 'block') patch.blocked = true
    if (action === 'unblock') patch.blocked = false
    if (action === 'role') {
      const role = String(body.role || 'user')
      if (!['admin', 'seller', 'user'].includes(role)) fail(400, 'Vai trò không hợp lệ')
      patch.role = role
    }
    if (action === 'balance') {
      const delta = num(body.amount)
      if (delta === undefined) fail(400, 'Vui lòng nhập số tiền')
      const after = Math.max(0, Number(u.balance || 0) + delta)
      patch.balance = after
      await db.insert('transactions', {
        id: 't_' + cryptoId(),
        user_id: id,
        type: delta >= 0 ? 'topup' : 'withdraw',
        amount: delta,
        balance_after: after,
        ref: 'ADM' + cryptoId().toUpperCase().slice(0, 6),
        note: String(body.note || 'Điều chỉnh số dư bởi quản trị viên'),
        status: 'success',
        created_at: now
      })
    }

    last = await db.update('users', id, patch)
    affected++

    if (action === 'block' || action === 'unblock') {
      await db.insert('notifications', {
        id: 'n_' + cryptoId(),
        user_id: id,
        title: action === 'block' ? 'Tài khoản bị tạm khoá' : 'Tài khoản đã được mở khoá',
        body: action === 'block'
          ? 'Tài khoản của bạn đã bị tạm khoá. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.'
          : 'Tài khoản của bạn đã được mở khoá. Chúc bạn học tập hiệu quả!',
        type: action === 'block' ? 'error' : 'success',
        link: '/dashboard',
        read: false,
        created_at: now
      })
    }
  }

  return { ok: true, affected, action, user: last ? publicUser(last) : null }
})
