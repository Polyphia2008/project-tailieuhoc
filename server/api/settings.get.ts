import { useDriver } from '~/server/utils/driver'

export default defineEventHandler(async () => {
  const db = useDriver()
  const s = await db.getSettings()
  return {
    hotline: String(s.hotline || '1900 6789'),
    email: String(s.email || 'hotro@mapdocs.vn'),
    address: String(s.address || ''),
    facebook: String(s.facebook || '')
  }
})
