import { db } from '~/server/utils/driver'
import { requireAdmin, safeUser } from '~/server/utils/auth'
import { notify } from '~/server/utils/helpers'
import type { User } from '~/types'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const { id, action, role } = await readBody(event)
  const user = await db().findOne<User>('users', { id })
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy người dùng' })
  if (user.id === admin.id) throw createError({ statusCode: 400, statusMessage: 'Bạn không thể thao tác trên chính mình' })

  if (action === 'block') {
    const u = await db().update<User>('users', id, { blocked: !user.blocked })
    return { success: true, data: safeUser(u), message: u.blocked ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản' }
  }
  if (action === 'role') {
    if (!['user', 'seller', 'admin'].includes(role)) throw createError({ statusCode: 400, statusMessage: 'Vai trò không hợp lệ' })
    const u = await db().update<User>('users', id, { role })
    await notify(id, 'Cập nhật quyền', `Tài khoản của bạn đã được đổi sang vai trò: ${role}`, 'system')
    return { success: true, data: safeUser(u), message: 'Đã cập nhật vai trò' }
  }
  if (action === 'delete') {
    await db().remove('users', id)
    return { success: true, data: { id }, message: 'Đã xoá người dùng' }
  }
  throw createError({ statusCode: 400, statusMessage: 'Hành động không hợp lệ' })
})
