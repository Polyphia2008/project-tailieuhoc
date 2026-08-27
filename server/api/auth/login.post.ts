import { useDriver } from '~/server/utils/driver'
import { verifyPassword, signToken, setAuthCookie, publicUser } from '~/server/utils/auth'
import { assertBody, fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  assertBody(body, ['email', 'password'])

  const email = String(body.email).trim().toLowerCase()
  const db = useDriver()
  const user = await db.findOne<any>('users', { email })
  if (!user) fail(401, 'Email hoặc mật khẩu không đúng')
  if (user.blocked) fail(403, 'Tài khoản của bạn đã bị tạm khoá')
  if (!user.password_hash) fail(400, 'Tài khoản này đăng nhập bằng Google')

  const ok = await verifyPassword(String(body.password), user.password_hash, user.salt || 'mapdocs')
  if (!ok) fail(401, 'Email hoặc mật khẩu không đúng')

  setAuthCookie(event, await signToken({ sub: user.id, role: user.role }))
  return { user: publicUser(user) }
})
