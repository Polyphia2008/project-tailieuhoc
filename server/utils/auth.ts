import { SignJWT, jwtVerify } from 'jose'
import type { H3Event } from 'h3'
import type { User, PublicUser } from '~/types'
import { db, cryptoId } from './driver'

const COOKIE = 'mapdocs_token'
const MAX_AGE = 60 * 60 * 24 * 7

function secret(): Uint8Array {
  return new TextEncoder().encode(useRuntimeConfig().jwtSecret)
}

async function sha256(text: string): Promise<string> {
  const buf = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(pw: string): Promise<{ hash: string; salt: string }> {
  const salt = cryptoId()
  return { hash: await sha256(salt + ':' + pw), salt }
}

export async function verifyPassword(user: User, pw: string): Promise<boolean> {
  if (!user.password) return false
  if (!user.salt) return user.password === pw
  return (await sha256(user.salt + ':' + pw)) === user.password
}

export async function signToken(userId: string): Promise<string> {
  return await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return (payload.sub as string) || null
  } catch {
    return null
  }
}

export function setAuthCookie(event: H3Event, token: string) {
  setCookie(event, COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: MAX_AGE, secure: false })
}

export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, COOKIE, { path: '/' })
}

export async function getUser(event: H3Event): Promise<User | null> {
  if (event.context.authUser !== undefined) return event.context.authUser
  const token = getCookie(event, COOKIE)
  if (!token) {
    event.context.authUser = null
    return null
  }
  const uid = await verifyToken(token)
  if (!uid) {
    event.context.authUser = null
    return null
  }
  const user = await db().findOne<User>('users', { id: uid })
  event.context.authUser = user && !user.blocked ? user : null
  return event.context.authUser
}

export async function requireUser(event: H3Event): Promise<User> {
  const u = await getUser(event)
  if (!u) throw createError({ statusCode: 401, statusMessage: 'Bạn cần đăng nhập để thực hiện thao tác này' })
  return u
}

export async function requireAdmin(event: H3Event): Promise<User> {
  const u = await requireUser(event)
  if (u.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền truy cập' })
  return u
}

export function publicUser(u: User | null | undefined): PublicUser | undefined {
  if (!u) return undefined
  return { id: u.id, name: u.name, avatar: u.avatar, role: u.role, bio: u.bio }
}

export function safeUser(u: User) {
  const { password, salt, ...rest } = u as any
  return rest as User
}
