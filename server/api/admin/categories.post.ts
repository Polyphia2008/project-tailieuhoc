import { useDriver, cryptoId } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { assertBody, slugify, fail, str } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  assertBody(body, ['action'])

  const db = useDriver()
  const action = String(body.action)

  if (action === 'create') {
    assertBody(body, ['name'])
    const slug = str(body.slug) || slugify(String(body.name))
    if (await db.findOne('categories', { slug })) fail(409, 'Slug này đã tồn tại')
    const cat = await db.insert('categories', {
      id: 'c_' + cryptoId(),
      name: String(body.name).trim(),
      slug,
      icon: str(body.icon) || 'solar:book-2-bold-duotone',
      color: str(body.color) || '#3b82f6',
      parent_id: str(body.parent_id) || null,
      description: str(body.description) || '',
      document_count: 0
    })
    return { category: cat }
  }

  if (action === 'update') {
    assertBody(body, ['id'])
    const patch: Record<string, any> = {}
    if (str(body.name)) patch.name = String(body.name).trim()
    if (str(body.icon)) patch.icon = str(body.icon)
    if (str(body.color)) patch.color = str(body.color)
    if (body.description !== undefined) patch.description = String(body.description)
    const cat = await db.update('categories', String(body.id), patch)
    return { category: cat }
  }

  if (action === 'delete') {
    assertBody(body, ['id'])
    const cat = await db.findOne<any>('categories', { id: String(body.id) })
    if (!cat) fail(404, 'Không tìm thấy danh mục')
    const used = await db.count('documents', { where: { subject: cat.slug } })
    if (used > 0) fail(400, `Không thể xoá danh mục đang có ${used} tài liệu`)
    await db.remove('categories', cat.id)
    return { ok: true }
  }

  fail(400, 'Hành động không hợp lệ')
})
