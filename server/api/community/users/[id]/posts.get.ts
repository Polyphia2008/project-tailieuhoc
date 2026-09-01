import { useDriver } from '~/server/utils/driver'
import { paginate, paged } from '~/server/utils/helpers'
import { findUser } from '~/server/utils/community'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const q = getQuery(event) as Record<string, any>
  const { page, limit, offset } = paginate(q, 12)

  const user = await findUser(id)
  if (!user) throw createError({ statusCode: 404, message: 'Không tìm thấy thành viên' })

  const { rows, total } = await useDriver().find<any>('documents', {
    where: { seller_id: user.id },
    order: { field: 'created_at', asc: false },
    limit,
    offset
  })

  const items = rows.map((d) => ({
    id: d.id,
    title: d.title,
    slug: d.slug,
    thumbnail: d.thumbnail,
    price: d.price,
    status: d.status,
    views: d.view_count,
    downloads: d.download_count,
    sold: d.sold_count,
    rating: d.rating_avg,
    rating_count: d.rating_count,
    created_at: d.created_at
  }))

  const res = paged(items, total, page, limit)
  return { data: { ...res, totalPages: res.pages } }
})
