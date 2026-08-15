import type { User } from '~/types'
import { db, cryptoId } from '~/server/utils/driver'
import { signToken, setAuthCookie } from '~/server/utils/auth'
import { notify } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  const origin = getRequestURL(event).origin

  if (cfg.googleClientId && cfg.googleClientSecret) {
    const params = new URLSearchParams({
      client_id: cfg.googleClientId,
      redirect_uri: `${origin}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account'
    })
    return sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${params}`)
  }

  // DEMO fallback: sign in as a synthetic Google account
  const email = 'google.demo@mapdocs.vn'
  let user = await db().findOne<User>('users', { email })
  if (!user) {
    user = await db().insert<User>('users', {
      id: cryptoId(), name: 'Người dùng Google (Demo)', email, role: 'user', balance: 200000,
      blocked: false, email_verified: true, provider: 'google', avatar: '',
      bio: 'Tài khoản demo đăng nhập bằng Google', created_at: new Date().toISOString()
    })
    await notify(user.id, 'Đăng nhập Google thành công', 'Bạn vừa đăng nhập bằng Google ở chế độ demo. Ví của bạn được tặng 200.000đ để trải nghiệm.', 'system', '/tai-lieu')
  }

  setAuthCookie(event, await signToken(user.id))
  return sendRedirect(event, '/dashboard?google=demo')
})
