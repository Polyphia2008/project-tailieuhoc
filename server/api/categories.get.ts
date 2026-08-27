import { useDriver } from '~/server/utils/driver'

export default defineEventHandler(async () => {
  const db = useDriver()
  const { rows } = await db.find<any>('categories', { order: { field: 'name', asc: true } })

  const withCounts = await Promise.all(
    rows.map(async (c) => ({
      ...c,
      document_count: await db.count('documents', { where: { subject: c.slug, status: 'approved' } })
    }))
  )
  return { categories: withCounts }
})
