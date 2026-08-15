import type { User } from '~/types'
import { db, cryptoId } from '~/server/utils/driver'
import { signToken, setAuthCookie } from '~/server/utils/auth'
import { sanitize, notify } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  const q = getQuery(event)
  const code = String(q.code || '')
  const origin = getRequestURL(event).origin

  if (q.error || !code) {
    return sendRedirect(event, '/auth/dang-nhap?error=' + encodeURIComponent('Đăng nhập Google bị huỷ'))
  }

  try {
    const tokenRes: any = await $fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        code,
        client_id: cfg.googleClientId,
        client_secret: cfg.googleClientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: 'authorization_code'
      })
    })

    const profile: any = await $fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenRes.access_token}` }
    })

    const email = sanitize(profile.email, 120).toLowerCase()
    if (!email) throw new Error('no email')

    let user = await db().findOne<User>('users', { email })
    if (!user) {
      user = await db().insert<User>('users', {
        id: cryptoId(), name: sanitize(profile.name, 80) || 'Người dùng Google', email,
        role: 'user', balance: 0, blocked: false, email_verified: true, provider: 'google',
        avatar: profile.picture || '', created_at: new Date().toISOString()
      })
      await notify(user.id, 'Chào mừng đến MapDocs!', 'Bạn đã đăng nhập bằng Google thành công.', 'system', '/tai-lieu')
    }
    if (user.blocked) {
      return sendRedirect(event, '/auth/dang-nhap?error=' + encodeURIComponent('Tài khoản đã bị khoá'))
    }

    setAuthCookie(event, await signToken(user.id))
    return sendRedirect(event, '/dashboard')
  } catch {
    return sendRedirect(event, '/auth/dang-nhap?error=' + encodeURIComponent('Không thể xác thực với Google'))
  }
})
