import { useDriver } from '~/server/utils/driver'
import { requireAdmin } from '~/server/utils/auth'
import { fail, str } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const id = str(q.id)
  if (!id) fail(400, 'Thiếu id bài viết')

  const blog = await useDriver().findOne<any>('blogs', { id })
  if (!blog) fail(404, 'Không tìm thấy bài viết')

  return { blog }
})
