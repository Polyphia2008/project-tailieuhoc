import { clearAuthCookie } from '~/server/utils/auth'

export default defineEventHandler((event) => {
  clearAuthCookie(event)
  return { success: true, data: null, message: 'Đã đăng xuất' }
})
