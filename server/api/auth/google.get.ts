import { useDriver, cryptoId } from '~/server/utils/driver'
import { signToken, setAuthCookie } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  const q = getQuery(event)

  if (cfg.googleClientId && cfg.googleClientSecret) {
    const redirect = `${cfg.public.siteUrl}/api/auth/google`
    const params = new URLSearchParams({
      client_id: cfg.googleClientId,
      redirect_uri: redirect,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account'
    })
    if (!q.code) return sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${params}`)
  }

  const db = useDriver()
  const email = String(q.email || 'demo.google@mapdocs.vn').toLowerCase()
  let user = await db.findOne<any>('users', { email })

  if (!user) {
    user = await db.insert('users', {
      id: 'u_' + cryptoId(),
      name: String(q.name || 'Người dùng Google'),
      email,
      role: 'user',
      avatar: '',
      bio: '',
      balance: 0,
      blocked: false,
      email_verified: true,
      google_id: 'g_' + cryptoId(),
      provider: 'google',
      created_at: new Date().toISOString()
    })
    setAuthCookie(event, await signToken({ sub: user.id, role: user.role }))
    return sendRedirect(event, `/auth/chuc-mung?name=${encodeURIComponent(user.name)}`)
  }

  setAuthCookie(event, await signToken({ sub: user.id, role: user.role }))
  return sendRedirect(event, '/dashboard')
})
