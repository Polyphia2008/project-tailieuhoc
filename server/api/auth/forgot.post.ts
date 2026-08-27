import { useDriver } from '~/server/utils/driver'
import { signToken } from '~/server/utils/auth'
import { assertBody, isEmail, fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  assertBody(body, ['email'])

  const email = String(body.email).trim().toLowerCase()
  if (!isEmail(email)) fail(400, 'Email không hợp lệ')

  const user = await useDriver().findOne<any>('users', { email })
  if (!user) return { ok: true, sent: true }

  const token = await signToken({ sub: user.id, kind: 'reset' }, '30m')
  return {
    ok: true,
    sent: true,
    dev_token: token,
    dev_link: `/auth/dat-lai-mat-khau?token=${token}`
  }
})
