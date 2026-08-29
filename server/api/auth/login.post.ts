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

  const ua = String(getRequestHeader(event, 'user-agent') || '')
  const ip =
    String(getRequestHeader(event, 'cf-connecting-ip') || getRequestHeader(event, 'x-forwarded-for') || '')
      .split(',')[0]
      .trim() || '127.0.0.1'
  const entry = {
    device: deviceOf(ua),
    ip,
    location: String(getRequestHeader(event, 'cf-ipcountry') || 'Việt Nam'),
    at: new Date().toISOString(),
    status: 'success'
  }
  const history = [entry, ...(Array.isArray(user.logins) ? user.logins : [])].slice(0, 8)
  const saved = await db.update('users', user.id, { logins: history, last_login_at: entry.at })

  setAuthCookie(event, await signToken({ sub: user.id, role: user.role }))
  return { user: publicUser(saved || user) }
})

function deviceOf(ua: string): string {
  const os = /Windows/i.test(ua)
    ? 'Windows'
    : /Android/i.test(ua)
      ? 'Android'
      : /iPhone|iPad|iOS/i.test(ua)
        ? 'iOS'
        : /Mac OS X|Macintosh/i.test(ua)
          ? 'macOS'
          : /Linux/i.test(ua)
            ? 'Linux'
            : 'Không rõ'
  const br = /Edg\//i.test(ua)
    ? 'Edge'
    : /OPR\//i.test(ua)
      ? 'Opera'
      : /Chrome\//i.test(ua)
        ? 'Chrome'
        : /Firefox\//i.test(ua)
          ? 'Firefox'
          : /Safari\//i.test(ua)
            ? 'Safari'
            : 'Trình duyệt khác'
  return `${br} · ${os}`
}
