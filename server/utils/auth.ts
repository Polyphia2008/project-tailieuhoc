import { SignJWT, jwtVerify } from 'jose'
import type { H3Event } from 'h3'
import { useDriver } from './driver'
import type { User } from '~/types'

const COOKIE = 'mapdocs_token'
const ALG = 'HS256'

function secret(): Uint8Array {
  return new TextEncoder().encode(useRuntimeConfig().jwtSecret)
}

export async function hashPassword(password: string, salt = 'mapdocs'): Promise<string> {
  const enc = new TextEncoder()
  let bytes: Uint8Array = enc.encode(`${salt}:${password}:mapdocs-v2`)
  for (let i = 0; i < 800; i++) {
    const buf = await crypto.subtle.digest('SHA-256', bytes as any)
    bytes = new Uint8Array(buf)
  }
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hash: string, salt = 'mapdocs'): Promise<boolean> {
  const h = await hashPassword(password, salt)
  if (h.length !== hash.length) return false
  let diff = 0
  for (let i = 0; i < h.length; i++) diff |= h.charCodeAt(i) ^ hash.charCodeAt(i)
  return diff === 0
}

export async function signToken(payload: Record<string, any>, expires = '7d'): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secret())
}

export async function readToken(token: string): Promise<Record<string, any> | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload as Record<string, any>
  } catch {
    return null
  }
}

export function setAuthCookie(event: H3Event, token: string): void {
  setCookie(event, COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: false
  })
}

export function clearAuthCookie(event: H3Event): void {
  deleteCookie(event, COOKIE, { path: '/' })
}

export function publicUser(u: User | any) {
  if (!u) return null
  const { password_hash, salt, ...rest } = u
  return rest
}

export function slimUser(u: any) {
  if (!u) return null
  return { id: u.id, name: u.name, avatar: u.avatar || '', role: u.role, bio: u.bio || '' }
}

export async function currentUser(event: H3Event): Promise<any | null> {
  const cached = event.context.mdUser
  if (cached !== undefined) return cached

  const token = getCookie(event, COOKIE)
  if (!token) {
    event.context.mdUser = null
    return null
  }
  const payload = await readToken(token)
  if (!payload?.sub) {
    event.context.mdUser = null
    return null
  }
  const user = await useDriver().findOne<User>('users', { id: String(payload.sub) })
  event.context.mdUser = user && !user.blocked ? user : null
  return event.context.mdUser
}

export async function requireUser(event: H3Event): Promise<any> {
  const user = await currentUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Bạn cần đăng nhập để tiếp tục' })
  return user
}

export async function requireAdmin(event: H3Event): Promise<any> {
  const user = await requireUser(event)
  if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền truy cập' })
  return user
}
