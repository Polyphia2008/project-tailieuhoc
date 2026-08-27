import { useDriver } from '~/server/utils/driver'
import { readToken, hashPassword, signToken, setAuthCookie, publicUser } from '~/server/utils/auth'
import { assertBody, fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  assertBody(body, ['token', 'password'])

  const password = String(body.password)
  if (password.length < 6) fail(400, 'Mật khẩu phải có ít nhất 6 ký tự')

  const payload = await readToken(String(body.token))
  if (!payload?.sub || payload.kind !== 'reset') fail(400, 'Liên kết không hợp lệ hoặc đã hết hạn')

  const db = useDriver()
  const user = await db.findOne<any>('users', { id: String(payload.sub) })
  if (!user) fail(404, 'Không tìm thấy tài khoản')

  const updated = await db.update('users', user.id, {
    password_hash: await hashPassword(password, user.salt || 'mapdocs')
  })

  setAuthCookie(event, await signToken({ sub: user.id, role: user.role }))
  return { user: publicUser(updated) }
})
