import type { User } from '~/types'
import { db, cryptoId } from '~/server/utils/driver'
import { hashPassword, signToken, setAuthCookie, safeUser } from '~/server/utils/auth'
import { sanitize, notify } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const name = sanitize(body?.name, 80)
  const email = sanitize(body?.email, 120).toLowerCase()
  const password = String(body?.password || '')

  if (!name || name.length < 2) throw createError({ statusCode: 400, statusMessage: 'Vui lòng nhập họ tên hợp lệ' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'Email không hợp lệ' })
  if (password.length < 6) throw createError({ statusCode: 400, statusMessage: 'Mật khẩu phải có ít nhất 6 ký tự' })

  const exists = await db().findOne<User>('users', { email })
  if (exists) throw createError({ statusCode: 409, statusMessage: 'Email này đã được đăng ký' })

  const { hash, salt } = await hashPassword(password)
  const user = await db().insert<User>('users', {
    id: cryptoId(), name, email, password: hash, salt, role: 'user', balance: 0,
    blocked: false, email_verified: false, provider: 'local', created_at: new Date().toISOString()
  })

  await notify(user.id, 'Chào mừng đến MapDocs!', 'Cảm ơn bạn đã đăng ký. Khám phá kho tài liệu chất lượng ngay hôm nay.', 'system', '/tai-lieu')
  setAuthCookie(event, await signToken(user.id))
  return { success: true, data: safeUser(user), message: 'Đăng ký thành công' }
})
