import { db } from '~/server/utils/driver'
import { requireUser, safeUser, hashPassword, verifyPassword } from '~/server/utils/auth'
import { sanitize } from '~/server/utils/helpers'
import type { User } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const b = await readBody(event)
  const patch: any = {}
  if (b.name) patch.name = sanitize(b.name, 60)
  if (b.phone !== undefined) patch.phone = sanitize(b.phone, 20)
  if (b.bio !== undefined) patch.bio = sanitize(b.bio, 500)
  if (b.avatar !== undefined) patch.avatar = sanitize(b.avatar, 300)
  if (b.bank_name !== undefined) patch.bank_name = sanitize(b.bank_name, 60)
  if (b.bank_number !== undefined) patch.bank_number = sanitize(b.bank_number, 30)

  if (b.new_password) {
    if (String(b.new_password).length < 6)
      throw createError({ statusCode: 400, statusMessage: 'Mật khẩu mới phải từ 6 ký tự' })
    if (!(await verifyPassword(user, String(b.old_password || ''))))
      throw createError({ statusCode: 400, statusMessage: 'Mật khẩu hiện tại không đúng' })
    const { hash, salt } = await hashPassword(String(b.new_password))
    patch.password = hash
    patch.salt = salt
  }

  const updated = await db().update<User>('users', user.id, patch)
  return { success: true, data: safeUser(updated), message: 'Đã cập nhật hồ sơ' }
})
