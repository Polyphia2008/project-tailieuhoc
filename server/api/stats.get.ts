import { useDriver } from '~/server/utils/driver'

export default defineEventHandler(async () => {
  const db = useDriver()
  const [documents, users, orders, freeDocs] = await Promise.all([
    db.count('documents', { where: { status: 'approved' } }),
    db.count('users'),
    db.count('orders', { where: { status: 'paid' } }),
    db.count('documents', { where: { status: 'approved', is_free: true } })
  ])

  const { rows: docs } = await db.find<any>('documents', { where: { status: 'approved' } })
  const downloads = docs.reduce((s, d) => s + Number(d.download_count || 0), 0)
  const views = docs.reduce((s, d) => s + Number(d.view_count || 0), 0)

  return { documents, users, orders, free_documents: freeDocs, downloads, views }
})
