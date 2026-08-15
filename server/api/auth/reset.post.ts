import type { User } from '~/types'
import { db } from '~/server/utils/driver'
import { verifyToken, hashPassword, signToken, setAuthCookie, safeUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = String(body?.token || '')
  const password = String(body?.password || '')

  if (!token) throw createError({ statusCode: 400, statusMessage: 'Liên kết đặt lại mật khẩu không hợp lệ' })
  if (password.length < 6) throw createError({ statusCode: 400, statusMessage: 'Mật khẩu phải có ít nhất 6 ký tự' })

  const uid = await verifyToken(token)
  if (!uid) throw createError({ statusCode: 400, statusMessage: 'Liên kết đã hết hạn. Vui lòng yêu cầu lại.' })

  const user = await db().findOne<User>('users', { id: uid })
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tài khoản' })

  const { hash, salt } = await hashPassword(password)
  const updated = await db().update<User>('users', uid, { password: hash, salt })
  setAuthCookie(event, await signToken(uid))
  return { success: true, data: safeUser(updated), message: 'Đặt lại mật khẩu thành công' }
})
