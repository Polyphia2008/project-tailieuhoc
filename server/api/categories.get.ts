import type { Category, DocumentItem } from '~/types'
import { db } from '~/server/utils/driver'

export default defineEventHandler(async () => {
  const { rows: cats } = await db().find<Category>('categories')
  const { rows: docs } = await db().find<DocumentItem>('documents', { where: { status: 'approved' } })
  const counts = new Map<string, number>()
  docs.forEach((d) => counts.set(d.subject, (counts.get(d.subject) || 0) + 1))
  const data = cats
    .sort((a, b) => Number(a.id.replace(/\D/g, '')) - Number(b.id.replace(/\D/g, '')))
    .map((c) => ({ ...c, doc_count: counts.get(c.slug) || 0 }))
  return { success: true, data }
})
