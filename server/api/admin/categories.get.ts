import { useDriver } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDriver()
  const { rows } = await db.find<any>('categories', { order: { field: 'name', asc: true } })

  const enriched = await Promise.all(
    rows.map(async (c) => ({
      ...c,
      document_count: await db.count('documents', { where: { subject: c.slug } }),
      approved_count: await db.count('documents', { where: { subject: c.slug, status: 'approved' } }),
      free_count: await db.count('documents', { where: { subject: c.slug, status: 'approved', is_free: true } })
    }))
  )
  return { categories: enriched }
})
