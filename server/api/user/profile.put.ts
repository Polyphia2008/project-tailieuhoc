import { useDriver } from '~/server/utils/driver'
import { requireUser, publicUser, hashPassword, verifyPassword } from '~/server/utils/auth'
import { fail, str } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const db = useDriver()

  const patch: Record<string, any> = {}
  if (str(body.name)) {
    const name = String(body.name).trim()
    if (name.length < 2) fail(400, 'Tên phải có ít nhất 2 ký tự')
    patch.name = name
  }
  if (body.bio !== undefined) patch.bio = String(body.bio).slice(0, 500)
  if (body.phone !== undefined) patch.phone = String(body.phone).slice(0, 20)
  if (body.avatar !== undefined) patch.avatar = String(body.avatar).slice(0, 500)

  if (body.new_password) {
    const np = String(body.new_password)
    if (np.length < 6) fail(400, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    if (user.password_hash) {
      if (!body.current_password) fail(400, 'Vui lòng nhập mật khẩu hiện tại')
      const ok = await verifyPassword(String(body.current_password), user.password_hash, user.salt || 'mapdocs')
      if (!ok) fail(400, 'Mật khẩu hiện tại không đúng')
    }
    patch.password_hash = await hashPassword(np, user.salt || 'mapdocs')
  }

  const updated = await db.update('users', user.id, patch)
  return { user: publicUser(updated) }
})
