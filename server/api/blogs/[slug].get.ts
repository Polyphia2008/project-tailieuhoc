import { useDriver } from '~/server/utils/driver'
import { slimUser } from '~/server/utils/auth'
import { fail } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const db = useDriver()

  const blog = await db.findOne<any>('blogs', { slug })
  if (!blog || !blog.published) fail(404, 'Không tìm thấy bài viết')

  await db.increment('blogs', blog.id, 'view_count')
  const author = await db.findOne<any>('users', { id: blog.author_id })

  const { rows: related } = await db.find<any>('blogs', {
    where: { published: true },
    whereNot: { id: blog.id },
    order: { field: 'view_count' },
    limit: 4
  })

  return {
    blog: { ...blog, author: slimUser(author) },
    related: related.map((b) => ({ ...b, content: undefined }))
  }
})
