import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { assertBody, uniqueSlug, fail, str } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)
  assertBody(body, ['action'])

  const db = useDriver()
  const action = String(body.action)
  const now = new Date().toISOString()

  if (action === 'create') {
    assertBody(body, ['title', 'content'])
    const title = String(body.title).trim()
    const slug = await uniqueSlug(str(body.slug) || title, async (s) => Boolean(await db.findOne('blogs', { slug: s })))
    const published = body.published !== false

    const blog = await db.insert('blogs', {
      id: 'b_' + cryptoId(),
      slug,
      title,
      excerpt: String(body.excerpt || String(body.content).slice(0, 200)).trim(),
      cover: str(body.cover) || '',
      content: String(body.content),
      author_id: admin.id,
      tags: Array.isArray(body.tags) ? body.tags.slice(0, 8).map(String) : [],
      view_count: 0,
      published,
      published_at: published ? now : undefined,
      created_at: now
    })
    return { blog }
  }

  if (action === 'update') {
    assertBody(body, ['id'])
    const patch: Record<string, any> = {}
    if (str(body.title)) patch.title = String(body.title).trim()
    if (str(body.excerpt)) patch.excerpt = String(body.excerpt).trim()
    if (str(body.content)) patch.content = String(body.content)
    if (body.cover !== undefined) patch.cover = String(body.cover)
    if (Array.isArray(body.tags)) patch.tags = body.tags.slice(0, 8).map(String)
    if (body.published !== undefined) {
      patch.published = Boolean(body.published)
      if (patch.published) patch.published_at = now
    }
    const blog = await db.update('blogs', String(body.id), patch)
    return { blog }
  }

  if (action === 'publish' || action === 'unpublish') {
    const ids: string[] = Array.isArray(body.ids) ? body.ids.map(String) : body.id ? [String(body.id)] : []
    if (!ids.length) fail(400, 'Vui lòng chọn bài viết')
    for (const id of ids) {
      await db.update('blogs', id, {
        published: action === 'publish',
        published_at: action === 'publish' ? now : undefined
      })
    }
    return { ok: true, affected: ids.length }
  }

  if (action === 'delete') {
    const ids: string[] = Array.isArray(body.ids) ? body.ids.map(String) : body.id ? [String(body.id)] : []
    if (!ids.length) fail(400, 'Vui lòng chọn bài viết')
    for (const id of ids) await db.remove('blogs', id)
    return { ok: true, affected: ids.length }
  }

  fail(400, 'Hành động không hợp lệ')
})
