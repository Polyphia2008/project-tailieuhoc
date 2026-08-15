import type { User } from '~/types'
import { db } from '~/server/utils/driver'
import { verifyPassword, signToken, setAuthCookie, safeUser } from '~/server/utils/auth'
import { sanitize } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = sanitize(body?.email, 120).toLowerCase()
  const password = String(body?.password || '')

  if (!email || !password) throw createError({ statusCode: 400, statusMessage: 'Vui lòng nhập email và mật khẩu' })

  const user = await db().findOne<User>('users', { email })
  if (!user || !(await verifyPassword(user, password))) {
    throw createError({ statusCode: 401, statusMessage: 'Email hoặc mật khẩu không chính xác' })
  }
  if (user.blocked) throw createError({ statusCode: 403, statusMessage: 'Tài khoản của bạn đã bị khoá. Liên hệ hỗ trợ để biết thêm chi tiết.' })

  setAuthCookie(event, await signToken(user.id))
  return { success: true, data: safeUser(user), message: 'Đăng nhập thành công' }
})
