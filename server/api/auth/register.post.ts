import { useDriver, cryptoId } from '~/server/utils/driver'
import { hashPassword, signToken, setAuthCookie, publicUser } from '~/server/utils/auth'
import { assertBody, isEmail, fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  assertBody(body, ['name', 'email', 'password'])

  const name = String(body.name).trim()
  const email = String(body.email).trim().toLowerCase()
  const password = String(body.password)

  if (name.length < 2) fail(400, 'Tên phải có ít nhất 2 ký tự')
  if (!isEmail(email)) fail(400, 'Email không hợp lệ')
  if (password.length < 6) fail(400, 'Mật khẩu phải có ít nhất 6 ký tự')

  const db = useDriver()
  const exists = await db.findOne('users', { email })
  if (exists) fail(409, 'Email này đã được sử dụng')

  const salt = cryptoId().slice(0, 12)
  const user = await db.insert('users', {
    id: 'u_' + cryptoId(),
    name,
    email,
    password_hash: await hashPassword(password, salt),
    salt,
    role: 'user',
    avatar: '',
    bio: '',
    balance: 0,
    blocked: false,
    email_verified: false,
    provider: 'local',
    created_at: new Date().toISOString()
  })

  await db.insert('notifications', {
    id: 'n_' + cryptoId(),
    user_id: user.id,
    title: 'Chào mừng đến với MapDocs',
    body: 'Tài khoản của bạn đã được tạo thành công. Khám phá hơn 25.000 tài liệu học tập chất lượng cao ngay hôm nay!',
    type: 'success',
    link: '/tai-lieu',
    read: false,
    created_at: new Date().toISOString()
  })

  setAuthCookie(event, await signToken({ sub: user.id, role: user.role }))
  return { user: publicUser(user), first_register: true }
})
