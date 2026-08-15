import type { User } from '~/types'
import { db } from '~/server/utils/driver'
import { signToken } from '~/server/utils/auth'
import { sanitize } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = sanitize(body?.email, 120).toLowerCase()
  if (!email) throw createError({ statusCode: 400, statusMessage: 'Vui lòng nhập email' })

  const user = await db().findOne<User>('users', { email })
  const message = 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu tới hộp thư của bạn.'
  if (!user) return { success: true, data: null, message }

  const token = await signToken(user.id)
  return { success: true, data: null, message, devResetLink: `/auth/dat-lai-mat-khau?token=${token}` }
})
